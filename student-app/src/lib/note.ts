import type { FitScore, Job, Student } from '../data/types';
import { getCompany } from '../data/companies';

const shortName = (full: string) => full.split('—')[0].trim();

/**
 * Stands in for the AI note-drafting call. It reads the same fit object the real
 * model would, so the swap later is a change of source, not of shape.
 */
export function draftNote(student: Student, job: Job, fit: FitScore): string {
  const company = getCompany(job.companyId);
  const skillFits = fit.fits.filter((f) => f.required).map((f) => f.label);
  const evidenceProject = student.projects.find((p) =>
    p.tech.some((t) => job.requiredSkills.some((r) => r.toLowerCase() === t.toLowerCase())),
  );

  const parts: string[] = [];

  if (skillFits.length && evidenceProject) {
    parts.push(
      `I have shipped ${student.projects.length} projects using ${skillFits
        .slice(0, 2)
        .join(' and ')}, including ${shortName(evidenceProject.name)} — ${evidenceProject.description
        .replace(/\.$/, '')
        .toLowerCase()}.`,
    );
  } else if (skillFits.length) {
    parts.push(`My background covers ${skillFits.slice(0, 3).join(', ')}, which this role asks for.`);
  }

  if (student.experience.length) {
    const e = student.experience[0];
    parts.push(`I interned at ${e.company} as a ${e.role.toLowerCase()}, where I ${e.summary.charAt(0).toLowerCase()}${e.summary.slice(1).replace(/\.$/, '')}.`);
  }

  parts.push(
    `I am available for ${job.durationMonths} months and looking for exactly this kind of ${job.workMode.toLowerCase()} role${
      job.workMode === 'Remote' ? '' : ` in ${job.location}`
    }.`,
  );

  parts.push(`Would love to help ${company.name} on this.`);

  return parts.join(' ');
}

/** The company's opening message once they select the student. */
export function openingMessage(student: Student, job: Job): string {
  const company = getCompany(job.companyId);
  const project = student.projects[0];
  return `Hi ${student.name.split(' ')[0]} — we went through your application for ${job.title} and were impressed by ${shortName(
    project.name,
  )}. We would like to set up a short call this week. Does Thursday or Friday afternoon work for you?`;
}

export const suggestedReplies = [
  'Thursday afternoon works for me.',
  'Thanks! Could you share more about the team?',
  'Yes — what should I prepare?',
];
