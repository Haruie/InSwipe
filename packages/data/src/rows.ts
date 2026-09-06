/**
 * The database, exactly as it comes back. Nothing here is a domain type — these are
 * snake_case rows. `map.ts` turns them into the @inswipe/core shapes both apps render.
 */
import type {
  Education,
  Experience,
  Preferences,
  Project,
  Skill,
  StatusEvent,
  TeamMember,
  ApplicationStatus,
  WorkMode,
} from '@inswipe/core';

export interface CompanyRow {
  id: string;
  name: string;
  initial: string;
  color: string;
  gradient: string;
  cover_url: string;
  verified: boolean;
  tagline: string;
  about: string;
  industry: string;
  size: string;
  founded: string;
  location: string;
  website: string;
  culture: string[];
  stack: string[];
  team: TeamMember[];
}

export interface RecruiterRow {
  id: string;
  company_id: string;
  name: string;
  initials: string;
  role: string;
}

export interface StudentRow {
  id: string;
  name: string;
  initial: string;
  email: string;
  phone: string;
  university: string;
  degree: string;
  field: string;
  grad_year: string;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education;
  preferences: Preferences;
  resume: { filename: string; size: string; updated: string } | null;
  links: { github?: string; portfolio?: string; linkedin?: string };
  avatar_color: string;
  gpa: string;
  location: string;
  year_label: string;
  resume_file: string;
  avatar_url: string;
}

export interface JobRow {
  id: string;
  company_id: string;
  title: string;
  role_category: string;
  location: string;
  work_mode: WorkMode;
  duration_months: number;
  stipend: number;
  about: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  department: string;
  employment_type: string;
  status: 'Active' | 'Paused' | 'Closed';
  posted: string;
  deadline: string;
  in_student_deck: boolean;
  sort_order: number;
}

export interface SwipeRow {
  id: string;
  student_id: string;
  job_id: string;
  action: 'passed' | 'saved';
}

export interface ApplicationRow {
  id: string;
  student_id: string;
  job_id: string;
  status: ApplicationStatus;
  stage: PipelineStage;
  note: string | null;
  note_ai_drafted: boolean;
  resume_file: string | null;
  fit_snapshot: number;
  applied_label: string;
  applied_order: number;
  timeline: StatusEvent[];
  availability: string;
  preference_notes: string[];
  resume_summary: string;
  created_at: string;
}

export interface SelectionRow {
  id: string;
  application_id: string;
  student_id: string;
  job_id: string;
  company_id: string;
  selected_by: string | null;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  selection_id: string;
  created_at: string;
  /**
   * The embedded selection. PostgREST types a to-one embed as an array even though it
   * returns a single object, so both shapes are accepted and normalised on read.
   */
  selections: SelectionRow | SelectionRow[] | null;
}

export const embeddedSelection = (row: ConversationRow): SelectionRow | null =>
  Array.isArray(row.selections) ? (row.selections[0] ?? null) : row.selections;

export interface MessageRow {
  id: string;
  conversation_id: string;
  from_company: boolean;
  body: string;
  read_by_student: boolean;
  read_by_company: boolean;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  student_id: string;
  kind: 'selected' | 'message' | 'status' | 'view' | 'matches';
  title: string;
  body: string;
  time_label: string;
  group_label: string;
  unread: boolean;
  sort_order: number;
  created_at: string;
}

/** CLAUDE.md section 7. Mirrors the `stage` check constraint on `applications`. */
export type PipelineStage =
  | 'Applied'
  | 'Reviewed'
  | 'Selected'
  | 'In Conversation'
  | 'Interview'
  | 'Offer'
  | 'Hired';

export const PIPELINE_STAGES: PipelineStage[] = [
  'Applied',
  'Reviewed',
  'Selected',
  'In Conversation',
  'Interview',
  'Offer',
  'Hired',
];
