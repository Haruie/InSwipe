import type { FitFactor, FitScore, Job } from '@inswipe/core';
import type { ApplicantRecord, PipelineStage } from '@inswipe/data';
import { computeFit } from '../lib/fit';

export type { PipelineStage as KanbanStage } from '@inswipe/data';
export { PIPELINE_STAGES as KANBAN_STAGES } from '@inswipe/data';

/**
 * The row the applicant list, drawer, pipeline and inbox all render.
 *
 * Everything fit-related on it is DERIVED — `fitScore`, `fits`, `lacks`, the details and
 * the breakdown all come out of `computeFit()` in @inswipe/core, the same function the
 * student app runs against the same profile row in Supabase. Nothing about a fit is
 * stored, and nothing about it is written by hand.
 */
export interface Candidate {
  id: string;
  /** the `applications` row this candidate is — what `select_candidate()` is called with */
  applicationId: string;
  jobId: string;
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  /** the student's own photo, if they have added one; the initials stand in otherwise */
  photoUrl?: string;
  school: string;
  degree: string;
  year: string;
  gradYear: string;
  fitScore: number;
  aiExplain: string;
  note?: string;
  fits: string[];
  fitDetails: { skill: string; explanation: string }[];
  lacks: string[];
  lackDetails: { skill: string; explanation: string }[];
  fitBreakdown: { skills: number; experience: number; interests: number; preferences: number };
  projects: { name: string; description: string; tech: string[] }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  availability: string;
  preferences: string[];
  stage: PipelineStage;
  selected: boolean;
  gpa: string;
  location: string;
  resumeSummary: string;
  resumeFile: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

const initialsOf = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const toDetail = (f: FitFactor) => ({ skill: f.label, explanation: f.reason });

/**
 * The one-line rationale next to the fit ring. Built from the strongest matched
 * requirement and the most costly gap, so it can never disagree with the rows below
 * it — CLAUDE.md rule 4: never a score without an explanation.
 */
function explain(name: string, fit: FitScore, skillFits: FitFactor[]): string {
  const first = name.split(' ')[0];
  const required = skillFits.filter((f) => f.required).map((f) => f.label);
  const blocker = fit.gaps.find((g) => g.required);

  const strength = required.length
    ? `${first} covers ${required.slice(0, 3).join(', ')}${required.length > 3 ? ' and more' : ''} with evidence behind it`
    : `${first} does not evidence any of this role's required skills`;

  const risk = blocker
    ? `${blocker.label} is the gap that matters — it is required here.`
    : 'No required skill is missing.';

  return `${strength}. ${risk}`;
}

export function toCandidate({ application, student }: ApplicantRecord, job: Job): Candidate {
  const fit = computeFit(student, job);

  // FitScore.fits also carries non-skill rows (project evidence, work preference,
  // availability). The two labelled skill rows on an applicant card are skills only.
  const jobSkills = new Set(
    [...job.requiredSkills, ...job.preferredSkills].map((s) => s.toLowerCase()),
  );
  const skillFits = fit.fits.filter((f) => jobSkills.has(f.label.toLowerCase()));

  return {
    id: student.id,
    applicationId: application.id,
    jobId: application.jobId,
    rank: 0,
    name: student.name,
    initials: initialsOf(student.name),
    avatarColor: student.avatarColor,
    photoUrl: student.avatarUrl,
    school: student.university,
    degree: student.degree,
    year: student.yearLabel,
    gradYear: student.gradYear,

    fitScore: fit.score,
    aiExplain: explain(student.name, fit, skillFits),
    fits: skillFits.map((f) => f.label),
    fitDetails: skillFits.map(toDetail),
    lacks: fit.gaps.map((g) => g.label),
    lackDetails: fit.gaps.map(toDetail),
    fitBreakdown: fit.breakdown,

    note: application.note,
    projects: student.projects.map((p) => ({
      name: p.name,
      description: p.description,
      tech: p.tech,
    })),
    experience: student.experience.map((e) => ({
      role: e.role,
      company: e.company,
      duration: e.period,
      description: e.summary,
    })),
    availability: application.availability,
    preferences: application.preferenceNotes,
    stage: application.stage,
    selected: application.status === 'selected',
    gpa: student.gpa,
    location: student.location,
    resumeSummary: application.resumeSummary,
    resumeFile: application.resumeAttached ?? student.resumeFile,
    githubUrl: student.links.github,
    portfolioUrl: student.links.portfolio,
  };
}

/** Ranked best-fit-first, per job, because the rank IS the score — never a stored column. */
export function rankCandidates(
  applicants: ApplicantRecord[],
  jobsById: Record<string, Job>,
): Candidate[] {
  const byJob = new Map<string, Candidate[]>();

  for (const applicant of applicants) {
    const job = jobsById[applicant.application.jobId];
    if (!job) continue;
    const list = byJob.get(job.id) ?? [];
    list.push(toCandidate(applicant, job));
    byJob.set(job.id, list);
  }

  return [...byJob.values()].flatMap((list) =>
    list.sort((a, b) => b.fitScore - a.fitScore).map((c, i) => ({ ...c, rank: i + 1 })),
  );
}
