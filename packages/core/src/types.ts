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

export interface Conversation {
  jobId: string;
  unread: number;
  lastLabel: string;
  messages: Message[];
}
