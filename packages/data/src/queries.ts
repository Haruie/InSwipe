/**
 * Reads. Both products call into here, and both get the same rows back — the student
 * app asks for one student's workspace, the dashboard for one company's.
 */
import type { Company, Conversation } from '@inswipe/core';
import type { InswipeClient } from './client';
import {
  toApplication,
  toCompany,
  toConversation,
  toJob,
  toNotification,
  toStudent,
  type ApplicationRecord,
  type JobListing,
  type NotificationRecord,
  type StudentRecord,
} from './map';
import { embeddedSelection } from './rows';
import type {
  ApplicationRow,
  CompanyRow,
  ConversationRow,
  JobRow,
  MessageRow,
  NotificationRow,
  RecruiterRow,
  SelectionRow,
  StudentRow,
  SwipeRow,
} from './rows';

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Supabase: could not load ${what} — ${result.error.message}`);
  return (result.data ?? []) as T;
}

/* --------------------------------- catalogue --------------------------------- */

export interface Catalog {
  companies: Record<string, Company>;
  companyList: Company[];
  jobs: JobListing[];
  jobsById: Record<string, JobListing>;
}

/** Every company and every posting. Both apps need the whole catalogue. */
export async function loadCatalog(db: InswipeClient): Promise<Catalog> {
  const [companyRes, jobRes] = await Promise.all([
    db.from('companies').select('*').order('name'),
    db.from('jobs').select('*').order('sort_order'),
  ]);

  const companyList = unwrap<CompanyRow[]>(companyRes, 'companies').map(toCompany);
  const jobs = unwrap<JobRow[]>(jobRes, 'jobs').map(toJob);

  return {
    companies: Object.fromEntries(companyList.map((c) => [c.id, c])),
    companyList,
    jobs,
    jobsById: Object.fromEntries(jobs.map((j) => [j.id, j])),
  };
}

/* -------------------------------- conversations -------------------------------- */

/**
 * Conversations are always fetched through their selection. There is no query in this
 * file that can produce a thread without one, because the join is the gate.
 */
async function loadConversations(
  db: InswipeClient,
  filter: { studentId?: string; companyId?: string },
  audience: 'student' | 'company',
): Promise<Conversation[]> {
  let query = db
    .from('conversations')
    .select('id, selection_id, created_at, selections!inner(*)')
    .order('created_at', { ascending: false });

  if (filter.studentId) query = query.eq('selections.student_id', filter.studentId);
  if (filter.companyId) query = query.eq('selections.company_id', filter.companyId);

  const rows = unwrap<ConversationRow[]>(await query, 'conversations');
  if (!rows.length) return [];

  const messageRows = unwrap<MessageRow[]>(
    await db
      .from('messages')
      .select('*')
      .in('conversation_id', rows.map((r) => r.id))
      .order('created_at'),
    'messages',
  );

  const byConversation = new Map<string, MessageRow[]>();
  for (const m of messageRows) {
    const list = byConversation.get(m.conversation_id) ?? [];
    list.push(m);
    byConversation.set(m.conversation_id, list);
  }

  const now = new Date();
  return rows
    .map((row) => ({ row, selection: embeddedSelection(row) }))
    .filter((r): r is { row: ConversationRow; selection: SelectionRow } => r.selection !== null)
    .map(({ row, selection }) =>
      toConversation(
        {
          id: row.id,
          selectionId: row.selection_id,
          studentId: selection.student_id,
          jobId: selection.job_id,
        },
        byConversation.get(row.id) ?? [],
        audience,
        now,
      ),
    );
}

/* ------------------------------- student side ------------------------------- */

export interface StudentWorkspace {
  student: StudentRecord;
  applications: ApplicationRecord[];
  saved: string[];
  passed: string[];
  /** postings in the deck, minus anything already applied to or passed on */
  deckJobIds: string[];
  conversations: Conversation[];
  notifications: NotificationRecord[];
  inboxUnlocked: boolean;
}

export async function loadStudentWorkspace(
  db: InswipeClient,
  studentId: string,
  catalog: Catalog,
): Promise<StudentWorkspace> {
  const [studentRes, applicationRes, swipeRes, notificationRes] = await Promise.all([
    db.from('students').select('*').eq('id', studentId).single(),
    db.from('applications').select('*').eq('student_id', studentId).order('applied_order', { ascending: false }),
    db.from('swipes').select('*').eq('student_id', studentId),
    db.from('notifications').select('*').eq('student_id', studentId).order('sort_order', { ascending: false }),
  ]);

  if (studentRes.error) {
    throw new Error(`Supabase: could not load student ${studentId} — ${studentRes.error.message}`);
  }

  const student = toStudent(studentRes.data as StudentRow);
  const applications = unwrap<ApplicationRow[]>(applicationRes, 'applications').map(toApplication);
  const swipes = unwrap<SwipeRow[]>(swipeRes, 'swipes');
  const notifications = unwrap<NotificationRow[]>(notificationRes, 'notifications').map(toNotification);

  const saved = swipes.filter((s) => s.action === 'saved').map((s) => s.job_id);
  const passed = swipes.filter((s) => s.action === 'passed').map((s) => s.job_id);
  const spent = new Set([...passed, ...applications.map((a) => a.jobId)]);

  const conversations = await loadConversations(db, { studentId }, 'student');

  return {
    student,
    applications,
    saved,
    passed,
    deckJobIds: catalog.jobs
      .filter((job) => job.inStudentDeck && job.status === 'Active' && !spent.has(job.id))
      .map((job) => job.id),
    conversations,
    notifications,
    // CLAUDE.md section 6: the inbox is a padlock until the first selection lands.
    inboxUnlocked: conversations.length > 0,
  };
}

/** One student's profile on its own, for callers that do not need their whole workspace. */
export async function loadStudentProfile(
  db: InswipeClient,
  studentId: string,
): Promise<StudentRecord> {
  const result = await db.from('students').select('*').eq('id', studentId).single();
  if (result.error) {
    throw new Error(`Supabase: could not load student ${studentId} \u2014 ${result.error.message}`);
  }
  return toStudent(result.data as StudentRow);
}

/**
 * What a signed-out app renders. There is no student yet, so there is no student row to
 * read — but the catalogue exists, and the deck is simply every active posting. The
 * splash and auth screens draw against this until an account is created or signed into.
 *
 * `student.id` being empty is the signal the rest of the app reads as "nobody is signed
 * in": nothing polls, and nothing is written.
 */
export function emptyStudentWorkspace(catalog: Catalog): StudentWorkspace {
  return {
    student: {
      id: '',
      name: '',
      initial: '·',
      email: '',
      phone: '',
      university: '',
      degree: '',
      field: '',
      gradYear: '',
      skills: [],
      projects: [],
      experience: [],
      education: { degree: '', university: '', period: '' },
      preferences: {
        roles: [],
        workMode: 'Hybrid',
        locations: [],
        durationMonths: 3,
        minStipend: 0,
      },
      links: {},
      avatarColor: '#EEF0FF',
      gpa: '',
      location: '',
      yearLabel: '',
      resumeFile: '',
    },
    applications: [],
    saved: [],
    passed: [],
    deckJobIds: catalog.jobs
      .filter((job) => job.inStudentDeck && job.status === 'Active')
      .map((job) => job.id),
    conversations: [],
    notifications: [],
    inboxUnlocked: false,
  };
}

/* ------------------------------- company side ------------------------------- */

export interface ApplicantRecord {
  application: ApplicationRecord;
  student: StudentRecord;
}

export interface CompanyWorkspace {
  company: Company;
  recruiter: RecruiterRow | null;
  jobs: JobListing[];
  applicants: ApplicantRecord[];
  conversations: Conversation[];
}

export async function loadCompanyWorkspace(
  db: InswipeClient,
  companyId: string,
  catalog: Catalog,
): Promise<CompanyWorkspace> {
  const company = catalog.companies[companyId];
  if (!company) throw new Error(`Supabase: no company ${companyId} in the catalogue`);

  const jobs = catalog.jobs.filter((job) => job.companyId === companyId);
  const jobIds = jobs.map((job) => job.id);

  const [recruiterRes, applicationRes] = await Promise.all([
    db.from('recruiters').select('*').eq('company_id', companyId).limit(1),
    jobIds.length
      ? db.from('applications').select('*').in('job_id', jobIds).order('created_at')
      : Promise.resolve({ data: [], error: null }),
  ]);

  const recruiters = unwrap<RecruiterRow[]>(recruiterRes, 'recruiters');
  const applications = unwrap<ApplicationRow[]>(applicationRes, 'applications').map(toApplication);

  const studentIds = [...new Set(applications.map((a) => a.studentId))];
  const students = studentIds.length
    ? unwrap<StudentRow[]>(await db.from('students').select('*').in('id', studentIds), 'students').map(
        toStudent,
      )
    : [];
  const studentById = new Map(students.map((s) => [s.id, s]));

  const conversations = await loadConversations(db, { companyId }, 'company');

  return {
    company,
    recruiter: recruiters[0] ?? null,
    jobs,
    applicants: applications
      .filter((a) => studentById.has(a.studentId))
      .map((application) => ({ application, student: studentById.get(application.studentId)! })),
    conversations,
  };
}
