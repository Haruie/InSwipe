import type { JobListing } from '@inswipe/data';
import type { Candidate } from './candidates';

/**
 * Impressions and apply-rate are not instrumented yet, so those two series stay as
 * illustrative history. Everything derivable from real rows — average fit, the funnel,
 * skill demand — is derived, so the charts cannot disagree with the applicant list.
 */
const IMPRESSIONS = [
  { date: '12 Mar', value: 142 }, { date: '13 Mar', value: 198 },
  { date: '14 Mar', value: 234 }, { date: '15 Mar', value: 189 },
  { date: '16 Mar', value: 267 }, { date: '17 Mar', value: 301 },
  { date: '18 Mar', value: 278 }, { date: '19 Mar', value: 312 },
  { date: '20 Mar', value: 356 }, { date: '21 Mar', value: 289 },
  { date: '22 Mar', value: 398 }, { date: '23 Mar', value: 421 },
];

const APPLY_RATE = [
  { date: '12 Mar', value: 4.2 }, { date: '13 Mar', value: 5.1 },
  { date: '14 Mar', value: 6.3 }, { date: '15 Mar', value: 5.8 },
  { date: '16 Mar', value: 7.2 }, { date: '17 Mar', value: 8.1 },
  { date: '18 Mar', value: 7.6 }, { date: '19 Mar', value: 8.9 },
  { date: '20 Mar', value: 9.2 }, { date: '21 Mar', value: 8.4 },
  { date: '22 Mar', value: 10.1 }, { date: '23 Mar', value: 11.3 },
];

const FUNNEL_STAGES = ['Applied', 'Reviewed', 'Selected', 'In Conversation', 'Interview', 'Offer'] as const;

export interface AnalyticsData {
  impressions: { date: string; value: number }[];
  applyRate: { date: string; value: number }[];
  avgFitScore: { label: string; value: number }[];
  skillDemand: { skill: string; demand: number }[];
  funnel: { stage: string; count: number }[];
}

export function buildAnalytics(jobs: JobListing[], candidates: Candidate[]): AnalyticsData {
  // Only for roles that actually have applicants. Scoring an empty pool would produce a
  // number, but not a true one, and CLAUDE.md rule 4 applies to charts too.
  const avgFitScore = jobs.flatMap((job) => {
    const rows = candidates.filter((c) => c.jobId === job.id);
    if (!rows.length) return [];
    const mean = rows.reduce((sum, c) => sum + c.fitScore, 0) / rows.length;
    return [{ label: job.title, value: Math.round(mean) }];
  });

  // How often each skill is asked for across this company's live postings, weighted by
  // how many applicants are missing it — the input to the "move it to preferred" advice.
  const demand = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.requiredSkills) demand.set(skill, (demand.get(skill) ?? 0) + 3);
    for (const skill of job.preferredSkills) demand.set(skill, (demand.get(skill) ?? 0) + 1);
  }
  for (const candidate of candidates) {
    for (const skill of candidate.lacks) demand.set(skill, (demand.get(skill) ?? 0) + 2);
  }
  const peak = Math.max(1, ...demand.values());
  const skillDemand = [...demand.entries()]
    .map(([skill, weight]) => ({ skill, demand: Math.round((weight / peak) * 100) }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 7);

  // A candidate who has reached a stage has passed every stage before it.
  const reached = (stage: string) => FUNNEL_STAGES.indexOf(stage as never);
  const funnel = FUNNEL_STAGES.map((stage, i) => ({
    stage,
    count: candidates.filter((c) => reached(c.stage) >= i).length,
  }));

  return { impressions: IMPRESSIONS, applyRate: APPLY_RATE, avgFitScore, skillDemand, funnel };
}

export interface AttentionItem {
  id: string;
  type: 'deadline' | 'applicant' | 'message';
  message: string;
  action: string;
  jobId?: string;
  conversationId?: string;
}

/** The "needs your attention" strip, read off the real pipeline rather than typed in. */
export function buildAttention(
  jobs: JobListing[],
  candidates: Candidate[],
  unreadByCandidate: { candidateId: string; name: string; conversationId: string }[],
): AttentionItem[] {
  const items: AttentionItem[] = [];

  const closing = jobs.find((job) => job.status === 'Active' && job.deadline);
  if (closing) {
    items.push({
      id: `deadline-${closing.id}`,
      type: 'deadline',
      message: `${closing.title} closes on ${closing.deadline}`,
      action: 'Extend deadline',
      jobId: closing.id,
    });
  }

  for (const job of jobs) {
    const unreviewed = candidates.filter((c) => c.jobId === job.id && c.stage === 'Applied').length;
    if (unreviewed > 0) {
      items.push({
        id: `applicants-${job.id}`,
        type: 'applicant',
        message: `${unreviewed} applicant${unreviewed > 1 ? 's' : ''} for ${job.title} — none reviewed`,
        action: 'Review now',
        jobId: job.id,
      });
      break;
    }
  }

  const reply = unreadByCandidate[0];
  if (reply) {
    items.push({
      id: `message-${reply.conversationId}`,
      type: 'message',
      message: `${reply.name} replied to your message`,
      action: 'View message',
      conversationId: reply.conversationId,
    });
  }

  return items;
}
