import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Company, Conversation } from "@inswipe/core";
import {
  loadCatalog,
  loadCompanyWorkspace,
  duplicateJob,
  markConversationRead,
  resetDemoData,
  selectCandidate,
  sendMessage,
  setApplicationStage,
  setJobStatus,
  type Catalog,
  type CompanyWorkspace,
  type PipelineStage,
  type RecruiterRow,
} from "@inswipe/data";
import { DEMO_COMPANY_ID, db } from "../lib/db";
import { rankCandidates, type Candidate } from "./candidates";
import { withCounts, type JobPosting } from "./jobs";
import { buildAnalytics, buildAttention, type AnalyticsData, type AttentionItem } from "./analytics";

/** How often the dashboard asks Supabase whether a student has done anything. */
const SYNC_INTERVAL_MS = 4000;

interface DashboardValue {
  company: Company;
  recruiter: RecruiterRow | null;
  jobs: JobPosting[];
  /** every applicant to this company, ranked within their own role */
  candidates: Candidate[];
  conversations: Conversation[];
  analytics: AnalyticsData;
  attention: AttentionItem[];
  candidateById: (id: string) => Candidate | undefined;
  jobById: (id: string) => JobPosting | undefined;
  /** THE GATE — writes the selection that opens a conversation. Returns its id. */
  select: (candidate: Candidate, message?: string) => Promise<string>;
  changeStage: (candidate: Candidate, stage: PipelineStage) => Promise<void>;
  changeJobStatus: (jobId: string, status: JobPosting["status"]) => Promise<void>;
  duplicate: (jobId: string) => Promise<void>;
  reply: (conversationId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  /** Demo only: rebuilds the presentation dataset. See `ResetDemoModal`. */
  resetDemo: () => Promise<string>;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardValue | null>(null);

export interface DashboardBoot {
  catalog: Catalog;
  workspace: CompanyWorkspace;
}

/** Loaded once before the app mounts, in `main.tsx`. */
export async function loadDashboard(): Promise<DashboardBoot> {
  const catalog = await loadCatalog(db);
  const workspace = await loadCompanyWorkspace(db, DEMO_COMPANY_ID, catalog);
  return { catalog, workspace };
}

export function DashboardProvider({
  boot,
  children,
}: {
  boot: DashboardBoot;
  children: React.ReactNode;
}) {
  const [catalog, setCatalog] = useState(boot.catalog);
  const [workspace, setWorkspace] = useState(boot.workspace);

  /**
   * Demo only. `demo_reset()` can be run from Settings here, from the student app or
   * from `scripts/demo.mjs`, and it rebuilds every runtime row. Nothing else deletes an
   * application, so an id that was here a moment ago and is gone now means the dataset
   * was restored underneath this tab — reload onto it, rather than leave the dashboard
   * holding candidates and threads that no longer exist.
   */
  const knownApplications = useRef(
    new Set(boot.workspace.applicants.map((a) => a.application.id)),
  );

  const refresh = useCallback(async () => {
    const next = await loadCatalog(db);
    const nextWorkspace = await loadCompanyWorkspace(db, DEMO_COMPANY_ID, next);

    const ids = new Set(nextWorkspace.applicants.map((a) => a.application.id));
    for (const id of knownApplications.current) {
      if (!ids.has(id)) return window.location.reload();
    }
    knownApplications.current = ids;

    setCatalog(next);
    setWorkspace(nextWorkspace);
  }, []);

  // The student app is a separate process writing to the same tables. Poll, so an
  // application submitted on a phone appears in this list without a reload.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refreshRef.current().catch(() => {});
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const value = useMemo<DashboardValue>(() => {
    const candidates = rankCandidates(workspace.applicants, catalog.jobsById);
    const jobs = withCounts(workspace.jobs, candidates, workspace.conversations);
    const candidateById = (id: string) => candidates.find((c) => c.id === id);
    const jobById = (id: string) => jobs.find((j) => j.id === id);

    const unread = workspace.conversations
      .filter((c) => c.unread > 0)
      .map((c) => ({
        candidateId: c.studentId,
        name: candidateById(c.studentId)?.name ?? c.studentId,
        conversationId: c.id,
      }));

    return {
      company: workspace.company,
      recruiter: workspace.recruiter,
      jobs,
      candidates,
      conversations: workspace.conversations,
      analytics: buildAnalytics(jobs, candidates),
      attention: buildAttention(jobs, candidates, unread),
      candidateById,
      jobById,

      async select(candidate, message) {
        const conversationId = await selectCandidate(db, {
          applicationId: candidate.applicationId,
          recruiterId: workspace.recruiter?.id ?? null,
          message,
        });
        await refresh();
        return conversationId;
      },

      async changeStage(candidate, stage) {
        await setApplicationStage(db, candidate.applicationId, stage);
        await refresh();
      },

      async changeJobStatus(jobId, status) {
        await setJobStatus(db, jobId, status);
        await refresh();
      },

      async duplicate(jobId) {
        await duplicateJob(db, jobId);
        await refresh();
      },

      async reply(conversationId, text) {
        await sendMessage(db, conversationId, true, text);
        await refresh();
      },

      async markRead(conversationId) {
        await markConversationRead(db, conversationId, true);
        await refresh();
      },

      /**
       * Demo only. The caller reloads the page afterwards — every list on screen is a
       * view of rows this call has just replaced.
       */
      resetDemo() {
        return resetDemoData(db);
      },

      refresh,
    };
  }, [catalog, workspace, refresh]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
