import type { FitFactor, FitScore } from '@inswipe/core';
import { computeFit } from '../lib/fit';
import { APPLICANTS, type Applicant, type KanbanStage } from './students';
import { JOBS, getJob, type JobPosting } from './jobs';

export { COMPANY, RECRUITER, getJob, stipendLabel, locationLabel } from './jobs';
export { JOBS };
export { KANBAN_STAGES, APPLICANTS } from './students';
export type { KanbanStage, Applicant } from './students';
export type { JobPosting } from './jobs';
export { fitBand } from '../lib/fit';

/** The dashboard still calls the listing shape `Job`. It is a core Job plus listing metadata. */
export type Job = JobPosting;

/**
 * The row shape the applicant list, drawer, pipeline and inbox all render.
 *
 * Everything fit-related on it is DERIVED — `fitScore`, `fits`, `lacks`, the details and
 * the breakdown all come out of `computeFit()` in @inswipe/core, the same function the
 * student app runs. Change a student's skills in `students.ts` and every number here
 * moves, in both products. Nothing about a fit is written by hand any more.
 */
export interface Candidate {
  id: string;
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
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
  stage: KanbanStage;
  selected?: boolean;
  gpa: string;
  location: string;
  resumeSummary: string;
  resumeFile: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface Message {
  id: string;
  sender: 'company' | 'candidate';
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateInitials: string;
  avatarColor: string;
  jobTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
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

function toCandidate(applicant: Applicant, rank: number): Candidate {
  const { student } = applicant;
  const job = getJob(applicant.jobId);
  const fit = computeFit(student, job);

  // FitScore.fits also carries non-skill rows (project evidence, work preference,
  // availability). The two labelled skill rows on an applicant card are skills only.
  const jobSkills = new Set(
    [...job.requiredSkills, ...job.preferredSkills].map((s) => s.toLowerCase()),
  );
  const skillFits = fit.fits.filter((f) => jobSkills.has(f.label.toLowerCase()));

  return {
    id: student.id,
    rank,
    name: student.name,
    initials: initialsOf(student.name),
    avatarColor: applicant.avatarColor,
    school: student.university,
    degree: student.degree,
    year: applicant.year,
    gradYear: student.gradYear,

    fitScore: fit.score,
    aiExplain: explain(student.name, fit, skillFits),
    fits: skillFits.map((f) => f.label),
    fitDetails: skillFits.map(toDetail),
    lacks: fit.gaps.map((g) => g.label),
    lackDetails: fit.gaps.map(toDetail),
    fitBreakdown: fit.breakdown,

    note: applicant.note,
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
    availability: applicant.availability,
    preferences: applicant.preferenceNotes,
    stage: applicant.stage,
    selected: applicant.selected,
    gpa: applicant.gpa,
    location: applicant.location,
    resumeSummary: applicant.resumeSummary,
    resumeFile: applicant.resumeFile,
    githubUrl: student.links.github,
    portfolioUrl: student.links.portfolio,
  };
}

/** Ranked best-fit-first, because the rank IS the score — never a stored column. */
export const CANDIDATES: Candidate[] = APPLICANTS.map((a) => toCandidate(a, 0))
  .sort((a, b) => b.fitScore - a.fitScore)
  .map((c, i) => ({ ...c, rank: i + 1 }));

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    candidateId: 'arjun-mehta',
    candidateName: 'Arjun Mehta',
    candidateInitials: 'AM',
    avatarColor: '#EEF0FF',
    jobTitle: 'Frontend Engineering Intern',
    lastMessage: 'Thursday at 2pm IST works perfectly for me!',
    lastTime: '2m ago',
    unread: 1,
    messages: [
      {
        id: 'm1',
        sender: 'company',
        text: "Hi Arjun! Congratulations — you've been selected for the Frontend Engineering Intern role at TechNova. We were really impressed by your React and design-systems work, especially the Luminate project. I'd love to set up an intro call to walk you through the team and next steps. Are you free this week?",
        time: 'Yesterday, 3:42 PM',
      },
      {
        id: 'm2',
        sender: 'candidate',
        text: "Hi Priya! Thank you so much — I'm really excited about TechNova! Yes, I'm available this week. I'm free Thursday afternoon or Friday morning. What works for the team?",
        time: 'Yesterday, 5:11 PM',
      },
      {
        id: 'm3',
        sender: 'company',
        text: "Thursday works great! Does 2pm IST suit you? We'll send a Google Meet link ahead of time.",
        time: 'Today, 9:14 AM',
      },
      {
        id: 'm4',
        sender: 'candidate',
        text: 'Thursday at 2pm IST works perfectly for me!',
        time: 'Today, 9:31 AM',
      },
    ],
  },
  {
    id: 'conv2',
    candidateId: 'kavya-reddy',
    candidateName: 'Kavya Reddy',
    candidateInitials: 'KR',
    avatarColor: '#EEF0FF',
    jobTitle: 'Frontend Engineering Intern',
    lastMessage: 'Looking forward to connecting with the team.',
    lastTime: '1h ago',
    unread: 0,
    messages: [
      {
        id: 'm1',
        sender: 'company',
        text: "Hi Kavya! We really enjoyed reviewing your work — the Zomato internship stood out strongly. We'd love to have a conversation about the Frontend Engineering Intern role. Are you available for a quick intro call this week?",
        time: 'Today, 8:00 AM',
      },
      {
        id: 'm2',
        sender: 'candidate',
        text: "Hi Priya! Absolutely — I've been following TechNova for a while and would love to learn more. I'm quite flexible this week. What times work for the team?",
        time: 'Today, 8:45 AM',
      },
      {
        id: 'm3',
        sender: 'company',
        text: 'How about Wednesday at 11am IST? We can do a relaxed 30-minute chat with our engineering lead.',
        time: 'Today, 9:00 AM',
      },
      {
        id: 'm4',
        sender: 'candidate',
        text: 'Wednesday at 11am IST is perfect. Looking forward to connecting with the team.',
        time: 'Today, 9:15 AM',
      },
    ],
  },
];

/**
 * Average applicant fit per job, computed rather than typed in — and only for jobs that
 * actually have applicants. Scoring the frontend pool against the design role would
 * produce a number, but not a true one, and CLAUDE.md rule 4 applies to charts too.
 */
const avgFitScore = JOBS.flatMap((job) => {
  const rows = APPLICANTS.filter((a) => a.jobId === job.id);
  if (!rows.length) return [];
  const mean = rows.reduce((sum, a) => sum + computeFit(a.student, job).score, 0) / rows.length;
  return [{ label: job.title, value: Math.round(mean) }];
});

export const ANALYTICS_DATA = {
  impressions: [
    { date: '12 Mar', value: 142 }, { date: '13 Mar', value: 198 },
    { date: '14 Mar', value: 234 }, { date: '15 Mar', value: 189 },
    { date: '16 Mar', value: 267 }, { date: '17 Mar', value: 301 },
    { date: '18 Mar', value: 278 }, { date: '19 Mar', value: 312 },
    { date: '20 Mar', value: 356 }, { date: '21 Mar', value: 289 },
    { date: '22 Mar', value: 398 }, { date: '23 Mar', value: 421 },
  ],
  applyRate: [
    { date: '12 Mar', value: 4.2 }, { date: '13 Mar', value: 5.1 },
    { date: '14 Mar', value: 6.3 }, { date: '15 Mar', value: 5.8 },
    { date: '16 Mar', value: 7.2 }, { date: '17 Mar', value: 8.1 },
    { date: '18 Mar', value: 7.6 }, { date: '19 Mar', value: 8.9 },
    { date: '20 Mar', value: 9.2 }, { date: '21 Mar', value: 8.4 },
    { date: '22 Mar', value: 10.1 }, { date: '23 Mar', value: 11.3 },
  ],
  avgFitScore,
  skillDemand: [
    { skill: 'React', demand: 94 }, { skill: 'TypeScript', demand: 88 },
    { skill: 'Figma', demand: 76 }, { skill: 'Python', demand: 71 },
    { skill: 'Node.js', demand: 65 }, { skill: 'GraphQL', demand: 58 },
    { skill: 'Testing', demand: 52 },
  ],
  funnel: [
    { stage: 'Applied', count: 43 }, { stage: 'Reviewed', count: 31 },
    { stage: 'Selected', count: 8 }, { stage: 'In Conversation', count: 5 },
    { stage: 'Interview', count: 2 }, { stage: 'Offer', count: 1 },
  ],
};

export const ATTENTION_ITEMS = [
  { id: 'a1', type: 'deadline', message: 'Frontend Engineering Intern closes in 2 days', action: 'Extend deadline', jobId: 'j1' },
  { id: 'a2', type: 'applicant', message: '14 new applicants for Product Design — none reviewed', action: 'Review now', jobId: 'j2' },
  { id: 'a3', type: 'message', message: 'Arjun Mehta replied to your message', action: 'View message', convId: 'conv1' },
];
