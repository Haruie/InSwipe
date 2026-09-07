import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Company } from "@inswipe/core";
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
  stipendLabel,
  relativeLabel,
  type ApplicantRecord,
  type Catalog,
  type CompanyWorkspace,
  type Conversation as CoreConversation,
  type JobListing,
  type RecruiterRow,
} from "@inswipe/data";
import { DEMO_COMPANY_ID, db } from "../lib/db";
import { computeFit } from "../lib/fit";
import type { Candidate, Conversation, Job, KanbanStage, Message } from "./mock";

/** How often the dashboard re-reads Supabase (a student applying on a phone shows up here). */
const SYNC_INTERVAL_MS = 4000;

/* ── recruiter-only flags Supabase does not carry ──────────────────────────
   "Saved for later" and "not a fit" are review notes the dashboard keeps for
   itself; there is no column for them, so they live in localStorage keyed by
   student id and are merged onto every candidate on read. */
const SAVED_KEY = "inswipe.savedCandidates.v1";
const NOTFIT_KEY = "inswipe.notFitCandidates.v1";

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function writeIdSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* private mode — the flag just won't survive a reload */
  }
}

/* ── row → local shape mappers ────────────────────────────────────────────── */

function toLocalJob(listing: JobListing, candidates: Candidate[], conversations: Conversation[]): Job {
  const mine = candidates.filter((c) => c.jobId === listing.id);
  const ids = new Set(mine.map((c) => c.id));
  return {
    id: listing.id,
    title: listing.title,
    department: listing.department,
    location: listing.workMode === "Remote" ? "Remote" : `${listing.location} · ${listing.workMode}`,
    type: listing.type,
    status: listing.status,
    applicants: mine.length,
    selected: mine.filter((c) => c.selected).length,
    conversations: conversations.filter((cv) => ids.has(cv.candidateId)).length,
    posted: listing.posted,
    deadline: listing.deadline,
    requiredSkills: listing.requiredSkills,
    preferredSkills: listing.preferredSkills,
    description: listing.about,
    stipend: stipendLabel(listing),
  };
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

function toLocalCandidate({ application, student }: ApplicantRecord, listing: JobListing): Candidate {
  const fit = computeFit(student, listing);
  const jobSkills = new Set(
    [...listing.requiredSkills, ...listing.preferredSkills].map((s) => s.toLowerCase()),
  );
  const skillFits = fit.fits.filter((f) => jobSkills.has(f.label.toLowerCase()));
  const first = student.name.split(" ")[0];
  const blocker = fit.gaps.find((g) => g.required);
  const aiExplain = skillFits.length
    ? `${first} covers ${skillFits.slice(0, 3).map((f) => f.label).join(", ")} with evidence behind it.${
        blocker
          ? ` ${blocker.label} is the gap that matters — it is required here.`
          : " No required skill is missing."
      }`
    : `${first} does not evidence any of this role's required skills.`;

  return {
    id: student.id,
    jobId: application.jobId,
    rank: 0,
    name: student.name,
    initials: initialsOf(student.name),
    avatarColor: student.avatarColor,
    school: student.university,
    degree: student.degree,
    year: student.yearLabel,
    gradYear: student.gradYear,
    fitScore: fit.score,
    aiExplain,
    note: application.note,
    fits: skillFits.map((f) => f.label),
    fitDetails: skillFits.map((f) => ({ skill: f.label, explanation: f.reason })),
    lacks: fit.gaps.map((g) => g.label),
    lackDetails: fit.gaps.map((g) => ({ skill: g.label, explanation: g.reason })),
    fitBreakdown: fit.breakdown,
    projects: student.projects.map((p) => ({ name: p.name, description: p.description, tech: p.tech })),
    experience: student.experience.map((e) => ({
      role: e.role,
      company: e.company,
      duration: e.period,
      description: e.summary,
    })),
    availability: application.availability,
    preferences: application.preferenceNotes,
    stage: application.stage as KanbanStage,
    selected: application.status === "selected",
    gpa: student.gpa,
    location: student.location,
    resumeSummary: application.resumeSummary,
    resumeFile: application.resumeAttached ?? student.resumeFile,
    githubUrl: student.links.github ? `https://${student.links.github}` : undefined,
    portfolioUrl: student.links.portfolio ? `https://${student.links.portfolio}` : undefined,
    isLive: true,
  };
}

/** Ranked best-fit-first within each job — the rank is the score, never stored. */
function rankByJob(cands: Candidate[]): Candidate[] {
  const byJob = new Map<string, Candidate[]>();
  for (const c of cands) {
    const list = byJob.get(c.jobId) ?? [];
    list.push(c);
    byJob.set(c.jobId, list);
  }
  return [...byJob.values()].flatMap((list) =>
    list.sort((a, b) => b.fitScore - a.fitScore).map((c, i) => ({ ...c, rank: i + 1 })),
  );
}

function toLocalConversation(
  conv: CoreConversation,
  candidateName: string,
  candidateInitials: string,
  avatarColor: string,
  jobTitle: string,
): Conversation {
  const messages: Message[] = conv.messages.map((m) => ({
    id: m.id,
    sender: m.fromCompany ? "company" : "candidate",
    text: m.text,
    time: m.time,
  }));
  const last = conv.messages[conv.messages.length - 1];
  return {
    id: conv.id,
    candidateId: conv.studentId,
    candidateName,
    candidateInitials,
    avatarColor,
    jobTitle,
    lastMessage: last?.text ?? "",
    lastTime: conv.lastLabel || relativeLabel(new Date().toISOString()),
    unread: conv.unread,
    messages,
  };
}

/* ── context ─────────────────────────────────────────────────────────────── */

interface DashboardValue {
  company: Company;
  recruiter: RecruiterRow | null;
  jobs: Job[];
  candidates: Candidate[];
  conversations: Conversation[];
  candidateById: (id: string) => Candidate | undefined;
  jobById: (id: string) => Job | undefined;

  /** THE GATE — writes the selection that opens a conversation. */
  selectWithMessage: (candidate: Candidate, message: string) => Promise<void>;
  select: (id: string) => Promise<void>;
  unselect: (id: string) => Promise<void>;
  changeStage: (id: string, stage: KanbanStage) => Promise<void>;
  toggleSaved: (id: string) => void;
  markNotFit: (id: string) => void;
  reconsider: (id: string) => void;
  changeJobStatus: (id: string, status: Job["status"]) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  reply: (conversationId: string, text: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  resetDemo: () => Promise<string>;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardValue | null>(null);

export interface DashboardBoot {
  catalog: Catalog;
  workspace: CompanyWorkspace;
}

export async function loadDashboard(): Promise<DashboardBoot> {
  const catalog = await loadCatalog(db);
  const workspace = await loadCompanyWorkspace(db, DEMO_COMPANY_ID, catalog);
  return { catalog, workspace };
}

export function DashboardProvider({ boot, children }: { boot: DashboardBoot; children: React.ReactNode }) {
  const [catalog, setCatalog] = useState(boot.catalog);
  const [workspace, setWorkspace] = useState(boot.workspace);
  const [saved, setSaved] = useState<Set<string>>(() => readIdSet(SAVED_KEY));
  const [notFit, setNotFit] = useState<Set<string>>(() => readIdSet(NOTFIT_KEY));

  useEffect(() => writeIdSet(SAVED_KEY, saved), [saved]);
  useEffect(() => writeIdSet(NOTFIT_KEY, notFit), [notFit]);

  const refresh = useCallback(async () => {
    const nextCatalog = await loadCatalog(db);
    const nextWorkspace = await loadCompanyWorkspace(db, DEMO_COMPANY_ID, nextCatalog);
    setCatalog(nextCatalog);
    setWorkspace(nextWorkspace);
  }, []);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refreshRef.current().catch(() => {});
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const value = useMemo<DashboardValue>(() => {
    void catalog;
    const companyJobs = workspace.jobs;
    const jobsById = new Map(companyJobs.map((j) => [j.id, j]));

    const candidates = rankByJob(
      workspace.applicants
        .map((a) => {
          const listing = jobsById.get(a.application.jobId);
          return listing ? toLocalCandidate(a, listing) : null;
        })
        .filter((c): c is Candidate => c !== null)
        .map((c) => ({ ...c, saved: saved.has(c.id), notFit: notFit.has(c.id) })),
    );

    const candIndex = new Map(candidates.map((c) => [c.id, c]));
    const conversations = workspace.conversations.map((cv) => {
      const cand = candIndex.get(cv.studentId);
      const listing = jobsById.get(cv.jobId);
      return toLocalConversation(
        cv,
        cand?.name ?? "Candidate",
        cand?.initials ?? "?",
        cand?.avatarColor ?? "#EEF0FF",
        listing?.title ?? "",
      );
    });

    const jobs = companyJobs.map((j) => toLocalJob(j, candidates, conversations));
    const candidateById = (id: string) => candidates.find((c) => c.id === id);
    const jobById = (id: string) => jobs.find((j) => j.id === id);
    const applicationIdOf = (studentId: string) =>
      workspace.applicants.find((a) => a.student.id === studentId)?.application.id ?? null;

    return {
      company: workspace.company,
      recruiter: workspace.recruiter,
      jobs,
      candidates,
      conversations,
      candidateById,
      jobById,

      async selectWithMessage(candidate, message) {
        const appId = applicationIdOf(candidate.id);
        if (!appId) return;
        await selectCandidate(db, {
          applicationId: appId,
          recruiterId: workspace.recruiter?.id ?? null,
          message: message || undefined,
        });
        setNotFit((s) => {
          const n = new Set(s);
          n.delete(candidate.id);
          return n;
        });
        await refresh();
      },
      async select(id) {
        const appId = applicationIdOf(id);
        if (!appId) return;
        await selectCandidate(db, { applicationId: appId, recruiterId: workspace.recruiter?.id ?? null });
        setNotFit((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
        await refresh();
      },
      async unselect(id) {
        const appId = applicationIdOf(id);
        if (!appId) return;
        await setApplicationStage(db, appId, "Reviewed");
        await refresh();
      },
      async changeStage(id, stage) {
        const appId = applicationIdOf(id);
        if (!appId) return;
        await setApplicationStage(db, appId, stage);
        await refresh();
      },
      toggleSaved(id) {
        setSaved((s) => {
          const n = new Set(s);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        });
      },
      markNotFit(id) {
        setNotFit((s) => new Set(s).add(id));
        setSaved((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      },
      reconsider(id) {
        setNotFit((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      },
      async changeJobStatus(id, status) {
        await setJobStatus(db, id, status);
        await refresh();
      },
      async duplicate(id) {
        await duplicateJob(db, id);
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
      resetDemo() {
        return resetDemoData(db);
      },
      refresh,
    };
  }, [catalog, workspace, saved, notFit, refresh]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
