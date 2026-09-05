import { gapHints } from '../data/student';
import type { EvidenceStrength, FitFactor, FitScore, Job, Student } from '../data/types';

/**
 * Weights come straight from CLAUDE.md section 5. Keep them here and nowhere else —
 * when the real matching API lands it should return this same shape.
 */
const WEIGHTS = {
  requiredSkills: 40,
  evidence: 20,
  preferences: 15,
  preferredSkills: 10,
  interest: 10,
  availability: 5,
};

const EVIDENCE_WEIGHT: Record<EvidenceStrength, number> = {
  strong: 1,
  moderate: 0.8,
  weak: 0.6,
};

interface Held {
  evidence: EvidenceStrength;
  projects: string[];
  fromExperience: boolean;
}

/**
 * A student "has" a skill if they declared it OR a project/internship demonstrates it.
 * Project-backed skills are upgraded to strong evidence — this is what stops a padded
 * skills list from outranking someone who actually shipped something.
 */
export function heldSkills(student: Student): Map<string, Held> {
  const map = new Map<string, Held>();

  for (const s of student.skills) {
    map.set(s.name.toLowerCase(), { evidence: s.evidence, projects: [], fromExperience: false });
  }

  for (const p of student.projects) {
    for (const t of p.tech) {
      const key = t.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.evidence = 'strong';
        existing.projects.push(p.name);
      } else {
        map.set(key, { evidence: 'strong', projects: [p.name], fromExperience: false });
      }
    }
  }

  for (const e of student.experience) {
    const haystack = `${e.role} ${e.summary}`.toLowerCase();
    for (const [key, held] of map) {
      if (haystack.includes(key)) {
        held.fromExperience = true;
        held.evidence = 'strong';
      }
    }
  }

  return map;
}

const shortName = (full: string) => full.split('—')[0].trim();

function fitReason(skill: string, held: Held, required: boolean): string {
  if (held.projects.length) {
    const names = held.projects.map(shortName);
    const list = names.length > 1 ? `${names[0]} and ${names[1]}` : names[0];
    return required
      ? `Used in ${list}. It is a core requirement here.`
      : `Used in ${list}. Listed here as a preferred skill.`;
  }
  if (held.fromExperience) {
    return 'Demonstrated during your internship, not just listed on your profile.';
  }
  if (held.evidence === 'weak') {
    return 'On your profile, though no project shows it yet. Worth backing up.';
  }
  return required
    ? 'Matches a core requirement for this role.'
    : 'Matches a preferred skill for this role.';
}

function gapReason(skill: string, required: boolean): string {
  const hint = gapHints[skill] ?? 'Not evidenced anywhere in your profile yet.';
  return required ? `Required for this role. ${hint}` : `Preferred, not required. ${hint}`;
}

export function computeFit(student: Student, job: Job): FitScore {
  const held = heldSkills(student);
  const has = (s: string) => held.get(s.toLowerCase());

  /* --- required skills, weighted by evidence strength --- */
  const requiredMatches = job.requiredSkills.filter((s) => has(s));
  const requiredCoverage = job.requiredSkills.length
    ? job.requiredSkills.reduce((sum, s) => {
        const h = has(s);
        return sum + (h ? EVIDENCE_WEIGHT[h.evidence] : 0);
      }, 0) / job.requiredSkills.length
    : 1;

  /* --- preferred skills, unweighted --- */
  const preferredMatches = job.preferredSkills.filter((s) => has(s));
  const preferredCoverage = job.preferredSkills.length
    ? preferredMatches.length / job.preferredSkills.length
    : 1;

  /* --- evidence: how many matched requirements are backed by real work --- */
  const backed = requiredMatches.filter((s) => {
    const h = has(s)!;
    return h.projects.length > 0 || h.fromExperience;
  });
  const evidence = requiredMatches.length ? backed.length / requiredMatches.length : 0.5;

  /* --- role interest --- */
  const interest = student.preferences.roles.includes(job.roleCategory) ? 1 : 0.45;

  /* --- preferences: work mode, location, stipend --- */
  const modeMatch = student.preferences.workMode === job.workMode;
  const locationMatch = student.preferences.locations.some(
    (l) => l.toLowerCase() === job.location.toLowerCase(),
  );
  const stipendMatch = job.stipend >= student.preferences.minStipend;
  const preferenceScore =
    (modeMatch ? 0.5 : 0.15) + (locationMatch ? 0.3 : 0.05) + (stipendMatch ? 0.2 : 0.05);

  /* --- availability --- */
  const monthGap = Math.abs(job.durationMonths - student.preferences.durationMonths);
  const availability = monthGap === 0 ? 1 : monthGap <= 1 ? 0.8 : 0.55;

  const raw =
    WEIGHTS.requiredSkills * requiredCoverage +
    WEIGHTS.evidence * evidence +
    WEIGHTS.preferences * preferenceScore +
    WEIGHTS.preferredSkills * preferredCoverage +
    WEIGHTS.interest * interest +
    WEIGHTS.availability * availability;

  const score = Math.round(raw);

  /* --- the explanation both products render --- */
  const fits: FitFactor[] = [];
  for (const s of requiredMatches) {
    fits.push({ label: s, required: true, reason: fitReason(s, has(s)!, true) });
  }
  for (const s of preferredMatches) {
    fits.push({ label: s, required: false, reason: fitReason(s, has(s)!, false) });
  }

  const evidenceProject = student.projects.find(
    (p) => p.tech.filter((t) => job.requiredSkills.some((r) => r.toLowerCase() === t.toLowerCase())).length >= 2,
  );
  if (evidenceProject) {
    fits.push({
      label: 'Project evidence',
      required: false,
      reason: `${shortName(evidenceProject.name)} shows the ${evidenceProject.tech
        .slice(0, 2)
        .join(' and ')} work this team does daily.`,
    });
  }
  if (modeMatch) {
    fits.push({
      label: 'Work preference',
      required: false,
      reason: `You want ${job.workMode.toLowerCase()} work. This role is ${job.workMode.toLowerCase()} in ${job.location}.`,
    });
  }
  if (monthGap === 0) {
    fits.push({
      label: 'Availability',
      required: false,
      reason: `You are looking for ${job.durationMonths} months. This internship is exactly that.`,
    });
  }

  const gaps: FitFactor[] = [
    ...job.requiredSkills.filter((s) => !has(s)).map((s) => ({ label: s, required: true, reason: gapReason(s, true) })),
    ...job.preferredSkills.filter((s) => !has(s)).map((s) => ({ label: s, required: false, reason: gapReason(s, false) })),
  ];

  const band = score >= 85 ? 'strong' : score >= 70 ? 'good' : 'stretch';

  return {
    score,
    band,
    bandLabel: band === 'strong' ? 'Strong fit' : band === 'good' ? 'Good fit' : 'Stretch',
    breakdown: {
      skills: Math.round(
        ((WEIGHTS.requiredSkills * requiredCoverage + WEIGHTS.preferredSkills * preferredCoverage) /
          (WEIGHTS.requiredSkills + WEIGHTS.preferredSkills)) *
          100,
      ),
      experience: Math.round(evidence * 100),
      interests: Math.round(interest * 100),
      preferences: Math.round(
        ((WEIGHTS.preferences * preferenceScore + WEIGHTS.availability * availability) /
          (WEIGHTS.preferences + WEIGHTS.availability)) *
          100,
      ),
    },
    fits: fits.slice(0, 5),
    gaps: gaps.slice(0, 4),
  };
}

/** Tags for the swipe card: which of this job's skills the student meets and misses. */
export function skillSplit(student: Student, job: Job) {
  const held = heldSkills(student);
  const all = [...job.requiredSkills, ...job.preferredSkills];
  const met: string[] = [];
  const missing: string[] = [];
  for (const s of all) (held.has(s.toLowerCase()) ? met : missing).push(s);
  return { met, missing };
}

export const bandColor = (score: number) =>
  score >= 85 ? '#16A34A' : score >= 70 ? '#4F46E5' : '#6B7280';

/** Gaps across every application, ranked by how many of them want each skill. */
export function learningList(student: Student, jobIds: string[], allJobs: Job[]) {
  const held = heldSkills(student);
  const counts = new Map<string, { count: number; required: number }>();
  for (const id of jobIds) {
    const job = allJobs.find((j) => j.id === id);
    if (!job) continue;
    for (const s of [...job.requiredSkills, ...job.preferredSkills]) {
      if (held.has(s.toLowerCase())) continue;
      const entry = counts.get(s) ?? { count: 0, required: 0 };
      entry.count += 1;
      if (job.requiredSkills.includes(s)) entry.required += 1;
      counts.set(s, entry);
    }
  }
  return [...counts.entries()]
    .map(([skill, v]) => ({
      skill,
      count: v.count,
      required: v.required,
      total: jobIds.length,
      hint: gapHints[skill] ?? 'Not evidenced anywhere in your profile yet.',
    }))
    .sort((a, b) => b.count - a.count || b.required - a.required);
}
