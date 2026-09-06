/**
 * Writes. Every one of these is an RPC, because the tables have no insert or update
 * policy — see `supabase/migrations/0002_rls_and_rpcs.sql`. That is deliberate: it
 * means no client, present or future, can open a conversation without a selection.
 */
import type { InswipeClient } from './client';
import { toStudentPatch, type StudentRecord } from './map';
import type { PipelineStage } from './rows';

function unwrap<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Supabase: ${what} failed — ${result.error.message}`);
  return result.data;
}

/* ---------------------------------- accounts ---------------------------------- */

/**
 * Signing up. Returns the id of the student the app then runs as — a real row, not the
 * demo one. Idempotent on email, so a double-submitted form returns the same account.
 *
 * There is no password here on purpose: the demo has no authentication yet
 * (CLAUDE.md section 10) and storing a credential it cannot protect would be worse
 * than storing none. See `supabase/migrations/0004_accounts_and_profile.sql`.
 */
export async function createStudentAccount(
  db: InswipeClient,
  input: { name: string; email: string },
): Promise<string> {
  return unwrap(
    await db.rpc('create_student', { p_name: input.name, p_email: input.email }),
    'create_student',
  ) as string;
}

/** Signing back in. Null when no account has that email. */
export async function signInStudent(db: InswipeClient, email: string): Promise<string | null> {
  return unwrap(await db.rpc('sign_in_student', { p_email: email }), 'sign_in_student') as
    | string
    | null;
}

/**
 * The profile, saved. Everything a student can change about themselves goes through
 * here — onboarding steps, the profile tab, a photo — so an edit survives the next poll
 * instead of being replaced by the row it was edited from.
 *
 * No fit score is written and none can be: the score is computed from what this call
 * stores (CLAUDE.md section 12, rule 4).
 */
export async function saveStudentProfile(
  db: InswipeClient,
  student: StudentRecord,
): Promise<void> {
  unwrap(
    await db.rpc('save_student_profile', {
      p_student_id: student.id,
      p_patch: toStudentPatch(student),
    }),
    'save_student_profile',
  );
}

/* -------------------------------- student side -------------------------------- */

export interface ApplyInput {
  studentId: string;
  jobId: string;
  note?: string;
  noteWasAiDrafted?: boolean;
  /** the fit as it stands right now, so the application keeps a snapshot of it */
  fit: number;
}

/** A right swipe. Returns the application id — idempotent if they already applied. */
export async function applyToJob(db: InswipeClient, input: ApplyInput): Promise<string> {
  return unwrap(
    await db.rpc('apply_to_job', {
      p_student_id: input.studentId,
      p_job_id: input.jobId,
      p_note: input.note ?? null,
      p_note_ai: Boolean(input.noteWasAiDrafted),
      p_fit: Math.round(input.fit),
    }),
    'apply_to_job',
  ) as string;
}

export async function passJob(db: InswipeClient, studentId: string, jobId: string): Promise<void> {
  unwrap(await db.rpc('pass_job', { p_student_id: studentId, p_job_id: jobId }), 'pass_job');
}

export async function setSaved(
  db: InswipeClient,
  studentId: string,
  jobId: string,
  saved: boolean,
): Promise<void> {
  unwrap(
    await db.rpc('set_saved', { p_student_id: studentId, p_job_id: jobId, p_saved: saved }),
    'set_saved',
  );
}

export async function markNotificationsRead(db: InswipeClient, studentId: string): Promise<void> {
  unwrap(await db.rpc('mark_notifications_read', { p_student_id: studentId }), 'mark_notifications_read');
}

/* -------------------------------- company side -------------------------------- */

export async function setApplicationStage(
  db: InswipeClient,
  applicationId: string,
  stage: PipelineStage,
): Promise<void> {
  unwrap(
    await db.rpc('set_application_stage', { p_application_id: applicationId, p_stage: stage }),
    'set_application_stage',
  );
}

export interface SelectCandidateInput {
  applicationId: string;
  recruiterId?: string | null;
  /** the company's opening message; the database writes a default if this is blank */
  message?: string;
}

/**
 * THE GATE (CLAUDE.md section 3, rule 2). One call: the application is selected, a
 * `selections` row is written, a conversation is opened against it and the company's
 * first message lands inside. Returns the conversation id.
 */
export async function selectCandidate(
  db: InswipeClient,
  input: SelectCandidateInput,
): Promise<string> {
  return unwrap(
    await db.rpc('select_candidate', {
      p_application_id: input.applicationId,
      p_recruiter_id: input.recruiterId ?? null,
      p_message: input.message ?? null,
    }),
    'select_candidate',
  ) as string;
}

/** Pausing or closing a job pulls it out of every student's deck, so it is a DB write. */
export async function setJobStatus(
  db: InswipeClient,
  jobId: string,
  status: 'Active' | 'Paused' | 'Closed',
): Promise<void> {
  unwrap(await db.rpc('set_job_status', { p_job_id: jobId, p_status: status }), 'set_job_status');
}

/** Copies a posting as a paused draft, out of the student deck until it is resumed. */
export async function duplicateJob(db: InswipeClient, jobId: string): Promise<string> {
  return unwrap(await db.rpc('duplicate_job', { p_job_id: jobId }), 'duplicate_job') as string;
}

/* ---------------------------------- messaging ---------------------------------- */

export async function sendMessage(
  db: InswipeClient,
  conversationId: string,
  fromCompany: boolean,
  body: string,
): Promise<void> {
  unwrap(
    await db.rpc('send_message', {
      p_conversation_id: conversationId,
      p_from_company: fromCompany,
      p_body: body,
    }),
    'send_message',
  );
}

export async function markConversationRead(
  db: InswipeClient,
  conversationId: string,
  asCompany: boolean,
): Promise<void> {
  unwrap(
    await db.rpc('mark_conversation_read', {
      p_conversation_id: conversationId,
      p_as_company: asCompany,
    }),
    'mark_conversation_read',
  );
}

/* ------------------------------------ demo ------------------------------------ */

/** Restores the presentation dataset. See `supabase/migrations/0003_demo_dataset.sql`. */
export async function resetDemoData(db: InswipeClient): Promise<string> {
  return unwrap(await db.rpc('demo_reset'), 'demo_reset') as string;
}
