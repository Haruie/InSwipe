import type {
  EvidenceStrength,
  FitBand,
  FitFactor,
  FitScore,
  Job,
  Student,
} from './types';

/**
 * Weights come straight from CLAUDE.md section 5. Keep them here and nowhere else —
 * when the real matching API lands it should return this same shape.
 */
export const WEIGHTS = {
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

export interface Held {
  evidence: EvidenceStrength;
  projects: string[];
  fromExperience: boolean;
}

/** Who the reasons are written for. The score itself is voice-independent. */
export type Voice = 'student' | 'company';

export interface FitEngineOptions {
  voice: Voice;
  /**
   * Per-skill copy appended to a gap's reason. Phrased for the voice — a next step for
   * a student, a risk read for a recruiter. Unlisted skills fall back to a generic line.
   */
  hints?: Record<string, string>;
  /** How many rows each list is trimmed to. The dashboard shows more than a card does. */
  limits?: { fits?: number; gaps?: number };
}

const DEFAULT_LIMITS = { fits: 5, gaps: 4 };

const shortName = (full: string) => full.split('—')[0].trim();

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

/* --------------------------- reasons, one per voice --------------------------- */

function studentFitReason(held: Held, required: boolean): string {
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

function companyFitReason(held: Held, required: boolean): string {
  if (held.projects.length) {
    const names = held.projects.map(shortName);
    const n = names.length;
    const list = n > 1 ? `${names[0]} and ${names[1]}` : names[0];
    return required
      ? `${n} shipped project${n > 1 ? 's' : ''} using it — ${list}. Core requirement, evidenced.`
      : `Shipped in ${list}. Covers a preferred skill.`;
  }
  if (held.fromExperience) {
    return 'Used in prior work experience, not just claimed on the profile.';
  }
  if (held.evidence === 'weak') {
    return 'Self-declared with nothing behind it. Worth probing in the screen.';
  }
  return required
    ? 'Named against a core requirement for this role.'
    : 'Named against a preferred skill for this role.';
}

function studentGapReason(hint: string, required: boolean): string {
  return required ? `Required for this role. ${hint}` : `Preferred, not required. ${hint}`;
}

function companyGapReason(hint: string, required: boolean): string {
  return required
    ? `No evidence in the profile, and you require it. ${hint}`
    : `Not evidenced. Listed as preferred, so it is low risk. ${hint}`;
}

const GENERIC_HINT: Record<Voice, string> = {
  student: 'Not evidenced anywhere in your profile yet.',
  company: 'Worth a direct question if it matters to the team.',
};

/* --------------------------------- the engine --------------------------------- */

export interface LearningItem {
  skill: string;
  count: number;
  required: number;
  total: number;
  hint: string;
}

export interface FitEngine {
  computeFit(student: Student, job: Job): FitScore;
  skillSplit(student: Student, job: Job): { met: string[]; missing: string[] };
  learningList(student: Student, jobIds: string[], allJobs: Job[]): LearningItem[];
}

/**
 * Each app builds one engine at startup and calls it with (student, job). The score is
 * identical either way; only the wording of `fits` and `gaps` changes. That is the whole
 * point of CLAUDE.md section 5 — one object, two readings.
 */
export function createFitEngine(options: FitEngineOptions): FitEngine {
  const { voice } = options;
  const hints = options.hints ?? {};
  const limits = { ...DEFAULT_LIMITS, ...options.limits };

  const fitReason = voice === 'company' ? companyFitReason : studentFitReason;
  const gapReasonFor = voice === 'company' ? companyGapReason : studentGapReason;
  const hintFor = (skill: string) => hints[skill] ?? GENERIC_HINT[voice];

  function computeFit(student: Student, job: Job): FitScore {
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
      fits.push({ label: s, required: true, reason: fitReason(has(s)!, true) });
    }
    for (const s of preferredMatches) {
      fits.push({ label: s, required: false, reason: fitReason(has(s)!, false) });
    }

    const evidenceProject = student.projects.find(
      (p) =>
        p.tech.filter((t) => job.requiredSkills.some((r) => r.toLowerCase() === t.toLowerCase()))
          .length >= 2,
    );
    if (evidenceProject) {
      const stack = evidenceProject.tech.slice(0, 2).join(' and ');
      fits.push({
        label: 'Project evidence',
        required: false,
        reason: `${shortName(evidenceProject.name)} shows the ${stack} work this team does daily.`,
      });
    }
    if (modeMatch) {
      const mode = job.workMode.toLowerCase();
      fits.push({
        label: 'Work preference',
        required: false,
        reason: `${voice === 'company' ? 'Wants' : 'You want'} ${mode} work. This role is ${mode} in ${job.location}.`,
      });
    }
    if (monthGap === 0) {
      fits.push({
        label: 'Availability',
        required: false,
        reason: `${voice === 'company' ? 'Looking' : 'You are looking'} for ${job.durationMonths} months. This internship is exactly that.`,
      });
    }

    const gaps: FitFactor[] = [
      ...job.requiredSkills
        .filter((s) => !has(s))
        .map((s) => ({ label: s, required: true, reason: gapReasonFor(hintFor(s), true) })),
      ...job.preferredSkills
        .filter((s) => !has(s))
        .map((s) => ({ label: s, required: false, reason: gapReasonFor(hintFor(s), false) })),
    ];

    const band = bandOf(score);

    return {
      score,
      band,
      bandLabel: BAND_LABEL[band],
      breakdown: {
        skills: Math.round(
          ((WEIGHTS.requiredSkills * requiredCoverage +
            WEIGHTS.preferredSkills * preferredCoverage) /
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
      fits: fits.slice(0, limits.fits),
      gaps: gaps.slice(0, limits.gaps),
    };
  }

  /** Tags for the swipe card: which of this job's skills the student meets and misses. */
  function skillSplit(student: Student, job: Job) {
    const held = heldSkills(student);
    const all = [...job.requiredSkills, ...job.preferredSkills];
    const met: string[] = [];
    const missing: string[] = [];
    for (const s of all) (held.has(s.toLowerCase()) ? met : missing).push(s);
    return { met, missing };
  }

  /** Gaps across every application, ranked by how many of them want each skill. */
  function learningList(student: Student, jobIds: string[], allJobs: Job[]): LearningItem[] {
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
        hint: hintFor(skill),
      }))
      .sort((a, b) => b.count - a.count || b.required - a.required);
  }

  return { computeFit, skillSplit, learningList };
}

/* ----------------------------------- bands ----------------------------------- */

const BAND_LABEL: Record<FitBand, string> = {
  strong: 'Strong fit',
  good: 'Good fit',
  stretch: 'Stretch',
};

/** CLAUDE.md section 5: >=85 strong (green), 70-84 good (indigo), <70 stretch (grey). */
export const bandOf = (score: number): FitBand =>
  score >= 85 ? 'strong' : score >= 70 ? 'good' : 'stretch';

export const BAND_COLOR: Record<FitBand, string> = {
  strong: '#16A34A',
  good: '#4F46E5',
  stretch: '#6B7280',
};

export const bandColor = (score: number) => BAND_COLOR[bandOf(score)];

export const fitBand = (score: number): { color: string; label: string } => {
  const band = bandOf(score);
  return { color: BAND_COLOR[band], label: BAND_LABEL[band] };
};
