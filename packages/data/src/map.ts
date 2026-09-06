/**
 * Rows in, domain objects out.
 *
 * The two products read the same tables and render them from opposite points of view,
 * so the only thing that varies here is the audience: `unread` counts messages the
 * *reader* has not seen, and nothing else changes.
 */
import type { Application, Company, Conversation, Job, Message, Student } from '@inswipe/core';
import type {
  ApplicationRow,
  CompanyRow,
  JobRow,
  MessageRow,
  NotificationRow,
  PipelineStage,
  StudentRow,
} from './rows';

/** A student profile plus the display facts only the company dashboard shows. */
export interface StudentRecord extends Student {
  avatarColor: string;
  gpa: string;
  location: string;
  yearLabel: string;
  resumeFile: string;
}

/** An application plus the company-side review context that hangs off it. */
export interface ApplicationRecord extends Application {
  id: string;
  studentId: string;
  stage: PipelineStage;
  availability: string;
  preferenceNotes: string[];
  resumeSummary: string;
}

/** A core `Job` plus the listing metadata only the dashboard renders. */
export interface JobListing extends Job {
  department: string;
  /** e.g. "Full-time · 10 weeks" */
  type: string;
  status: 'Active' | 'Paused' | 'Closed';
  posted: string;
  deadline: string;
  inStudentDeck: boolean;
  sortOrder: number;
}

/** Who a conversation is being read by. Only `unread` depends on it. */
export type Audience = 'student' | 'company';

/* ---------------------------------- time ---------------------------------- */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const clock = (d: Date) =>
  d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

const calendar = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const dayOffset = (d: Date, now: Date) => {
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
};

/** "Today" · "Yesterday" · "14 Mar" — the separator above a run of messages. */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const days = dayOffset(d, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return calendar(d);
}

/** The timestamp under a message bubble. */
export function messageTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (now.getTime() - d.getTime() < MINUTE) return 'Just now';
  const days = dayOffset(d, now);
  if (days <= 0) return `Today, ${clock(d)}`;
  if (days === 1) return `Yesterday, ${clock(d)}`;
  return `${calendar(d)}, ${clock(d)}`;
}

/** The compact label beside a row in a conversation list. */
export function relativeLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const delta = now.getTime() - d.getTime();
  if (delta < MINUTE) return 'Now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  const days = dayOffset(d, now);
  if (days <= 0) return `${Math.floor(delta / HOUR)}h ago`;
  if (days === 1) return 'Yesterday';
  return calendar(d);
}

/* --------------------------------- mappers --------------------------------- */

export function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial,
    color: row.color,
    gradient: row.gradient,
    coverUrl: row.cover_url ?? '',
    verified: row.verified,
    tagline: row.tagline,
    about: row.about,
    industry: row.industry,
    size: row.size,
    founded: row.founded,
    location: row.location,
    website: row.website,
    culture: row.culture ?? [],
    stack: row.stack ?? [],
    team: row.team ?? [],
  };
}

export function toStudent(row: StudentRow): StudentRecord {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial,
    email: row.email,
    phone: row.phone,
    university: row.university,
    degree: row.degree,
    field: row.field,
    gradYear: row.grad_year,
    skills: row.skills ?? [],
    projects: row.projects ?? [],
    experience: row.experience ?? [],
    education: row.education,
    preferences: row.preferences,
    resume: row.resume ?? undefined,
    links: row.links ?? {},
    avatarColor: row.avatar_color,
    gpa: row.gpa,
    location: row.location,
    yearLabel: row.year_label,
    resumeFile: row.resume_file,
    avatarUrl: row.avatar_url || undefined,
  };
}

/**
 * The other direction: a profile the student has just edited, as the patch
 * `save_student_profile()` takes. Only the fields a student can actually change are
 * here — the id is the argument, and nothing else in the row is theirs to write.
 */
export function toStudentPatch(student: StudentRecord): Record<string, unknown> {
  return {
    name: student.name,
    initial: student.initial,
    email: student.email,
    phone: student.phone,
    university: student.university,
    degree: student.degree,
    field: student.field,
    grad_year: student.gradYear,
    skills: student.skills,
    projects: student.projects,
    experience: student.experience,
    education: student.education,
    preferences: student.preferences,
    links: student.links,
    avatar_url: student.avatarUrl ?? '',
    resume: student.resume ?? null,
    // the dashboard reads these off the same row, so they follow the profile rather
    // than drift away from it
    resume_file: student.resume?.filename ?? '',
    // display facts the dashboard reads off the same row. They are sent back
    // unchanged unless the row has never had one, so editing a profile cannot
    // quietly rewrite how a recruiter sees it.
    gpa: student.gpa,
    location: student.location,
    year_label: student.yearLabel || (student.gradYear ? `Graduating ${student.gradYear}` : ''),
    // `resume` is the one field that can be emptied; a null value alone would be
    // read as "not sent"
    clear: student.resume ? [] : ['resume'],
  };
}

export function toJob(row: JobRow): JobListing {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    roleCategory: row.role_category,
    location: row.location,
    workMode: row.work_mode,
    durationMonths: row.duration_months,
    stipend: row.stipend,
    about: row.about,
    responsibilities: row.responsibilities ?? [],
    requiredSkills: row.required_skills ?? [],
    preferredSkills: row.preferred_skills ?? [],
    department: row.department,
    type: row.employment_type,
    status: row.status,
    posted: row.posted,
    deadline: row.deadline,
    inStudentDeck: row.in_student_deck,
    sortOrder: row.sort_order,
  };
}

export function toApplication(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    jobId: row.job_id,
    status: row.status,
    stage: row.stage,
    appliedLabel: row.applied_label,
    appliedOrder: row.applied_order,
    note: row.note ?? undefined,
    noteWasAiDrafted: row.note_ai_drafted,
    resumeAttached: row.resume_file ?? undefined,
    timeline: row.timeline ?? [],
    fitSnapshot: row.fit_snapshot,
    availability: row.availability,
    preferenceNotes: row.preference_notes ?? [],
    resumeSummary: row.resume_summary,
  };
}

export function toMessage(row: MessageRow, now = new Date()): Message {
  return {
    id: row.id,
    fromCompany: row.from_company,
    text: row.body,
    time: messageTime(row.created_at, now),
    dayLabel: dayLabel(row.created_at, now),
  };
}

export function toConversation(
  conversation: { id: string; selectionId: string; studentId: string; jobId: string },
  rows: MessageRow[],
  audience: Audience,
  now = new Date(),
): Conversation {
  const ordered = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = ordered[ordered.length - 1];

  // Unread means "not yet read by whoever is looking". A company never has unread
  // messages of its own, and neither does a student.
  const unread = ordered.filter((m) =>
    audience === 'company' ? !m.from_company && !m.read_by_company : m.from_company && !m.read_by_student,
  ).length;

  return {
    id: conversation.id,
    selectionId: conversation.selectionId,
    studentId: conversation.studentId,
    jobId: conversation.jobId,
    unread,
    lastLabel: last ? relativeLabel(last.created_at, now) : '',
    messages: ordered.map((m) => toMessage(m, now)),
  };
}

export interface NotificationRecord {
  id: string;
  kind: NotificationRow['kind'];
  title: string;
  body: string;
  time: string;
  group: string;
  unread: boolean;
}

export function toNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    time: row.time_label,
    group: row.group_label,
    unread: row.unread,
  };
}

/** Core keeps the facts; formatting them is a client concern, shared by both apps. */
export const stipendLabel = (job: Job) => `₹${job.stipend.toLocaleString('en-IN')}/month`;

export const locationLabel = (job: Job) =>
  job.workMode === 'Remote' ? 'Remote' : `${job.location} · ${job.workMode}`;

export type { Application, Company, Conversation, Job, Message, Student };
