import type { Conversation } from "@inswipe/core";
import type { JobListing } from "@inswipe/data";
import type { Candidate } from "./candidates";

export { stipendLabel, locationLabel } from "@inswipe/data";

/**
 * A posting plus the three counts the job card shows. They are counted off the real
 * applicant and conversation rows rather than stored, so they cannot drift from the
 * lists they link to.
 */
export interface JobPosting extends JobListing {
  applicants: number;
  selected: number;
  conversations: number;
}

export function withCounts(
  jobs: JobListing[],
  candidates: Candidate[],
  conversations: Conversation[],
): JobPosting[] {
  return jobs.map((job) => {
    const pool = candidates.filter((c) => c.jobId === job.id);
    return {
      ...job,
      applicants: pool.length,
      selected: pool.filter((c) => c.selected).length,
      conversations: conversations.filter((c) => c.jobId === job.id).length,
    };
  });
}
