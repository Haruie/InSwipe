/**
 * The domain both products share.
 *
 * These types were extracted from the student app so the company dashboard reads the
 * same shapes. Nothing here is UI: no colours, no labels, no view models. Anything a
 * single surface needs and the other does not belongs in that app's own types file.
 */

export type EvidenceStrength = 'strong' | 'moderate' | 'weak';

export interface Skill {
  name: string;
  /** strong = shipped in a project or job · moderate = named with context · weak = self-declared */
  evidence: EvidenceStrength;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
  contribution?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  mode: string;
  period: string;
  summary: string;
}

export interface Education {
  degree: string;
  university: string;
  period: string;
  cgpa?: string;
}

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface Preferences {
  roles: string[];
  workMode: WorkMode;
  locations: string[];
  durationMonths: number;
  minStipend: number;
}

export interface Student {
  id: string;
  name: string;
  initial: string;
  email: string;
  phone: string;
  university: string;
  degree: string;
  field: string;
  gradYear: string;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education;
  preferences: Preferences;
  resume?: { filename: string; size: string; updated: string };
  links: { github?: string; portfolio?: string; linkedin?: string };
  /**
   * The student's own photo, if they have added one. Empty until they do, and every
   * avatar in both products falls back to `initial` on a tinted circle — a profile
   * without a photo is a normal profile, not an incomplete one.
   */
  avatarUrl?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initial: string;
}

export interface Company {
  id: string;
  name: string;
  initial: string;
  color: string;
  gradient: string;
  /**
   * The image a job card shows for this company. The gradient stays underneath it, so
   * a company without a cover — or one whose file fails to load — still reads as itself.
   */
  coverUrl: string;
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

export interface Job {
  id: string;
  companyId: string;
  title: string;
  roleCategory: string;
  location: string;
  workMode: WorkMode;
  durationMonths: number;
  /** rupees per month */
  stipend: number;
  about: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
}

export type ApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'shortlisted'
  | 'selected'
  | 'rejected';

export interface StatusEvent {
  status: ApplicationStatus;
  date: string;
  detail?: string;
}

export interface Application {
  jobId: string;
  status: ApplicationStatus;
  appliedLabel: string;
  appliedOrder: number;
  note?: string;
  noteWasAiDrafted?: boolean;
  resumeAttached?: string;
  timeline: StatusEvent[];
  /** the fit as it stood when they applied */
  fitSnapshot: number;
}

export interface FitFactor {
  label: string;
  required: boolean;
  reason: string;
}

export type FitBand = 'strong' | 'good' | 'stretch';

/**
 * The object both products render. CLAUDE.md section 5: the student app shows it as
 * "what you bring / what to work on", the company app shows the same rows as
 * "what they bring / what they lack".
 */
export interface FitScore {
  score: number;
  band: FitBand;
  bandLabel: string;
  breakdown: { skills: number; experience: number; interests: number; preferences: number };
  fits: FitFactor[];
  gaps: FitFactor[];
}

export interface Message {
  id: string;
  fromCompany: boolean;
  text: string;
  time: string;
  dayLabel?: string;
}

/**
 * A thread between one company and one student about one job. It cannot exist without
 * a selection (CLAUDE.md section 3, rule 2), which is why `selectionId` is not optional:
 * the row it points at is the thing that unlocked this conversation.
 *
 * `unread` is read from the point of view of whoever loaded it — the student counts
 * messages from the company, the company counts replies from the candidate.
 */
export interface Conversation {
  id: string;
  selectionId: string;
  studentId: string;
  jobId: string;
  unread: number;
  lastLabel: string;
  messages: Message[];
}

/* --------------------------------- resume parsing --------------------------------- */

/** How sure the parser is about one extracted field. Anything but `high` is shown to the student to confirm. */
export type FieldConfidence = 'high' | 'medium' | 'low';

/**
 * What reading a resume produces, before the student has confirmed any of it.
 *
 * The profile half is a subset of `Student` — the fields a resume can actually evidence.
 * Name, email and photo are the student's own and are never overwritten by a parse, and
 * preferences are asked for, not read: no resume states a stipend expectation.
 *
 * Nothing here is saved until the review screen is accepted (CLAUDE.md section 6).
 */
export interface ParsedResume {
  profile: Pick<
    Student,
    | 'phone'
    | 'university'
    | 'degree'
    | 'field'
    | 'gradYear'
    | 'skills'
    | 'projects'
    | 'experience'
    | 'education'
    | 'links'
  > & { name: string; email: string };
  /** Per-field, for the six the review screen lists as rows. */
  confidence: Record<
    'name' | 'email' | 'phone' | 'university' | 'degree' | 'gradYear',
    FieldConfidence
  >;
}
