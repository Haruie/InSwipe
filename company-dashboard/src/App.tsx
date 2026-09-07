import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";
import Pipeline from "./pages/Pipeline";
import Inbox from "./pages/Inbox";
import Analytics from "./pages/Analytics";
import CompanyProfile from "./pages/CompanyProfile";
import Settings from "./pages/Settings";
import PostJobModal from "./components/PostJobModal";
import type { Candidate, Job } from "./data/mock";
import { useDashboard } from "./data/store";
import { useAccount } from "./lib/account";
import { sendNotification } from "./lib/notify";

const Landing = lazy(() => import("./pages/Landing"));
const CompanyOnboarding = lazy(() => import("./pages/CompanyOnboarding"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));

export type TopView = "landing" | "company-onboarding" | "company";
export type Page = "dashboard" | "jobs" | "applicants" | "pipeline" | "inbox" | "analytics" | "profile" | "settings";

export const PAGE_LABELS: Record<Page, string> = {
  dashboard:  "Dashboard",
  jobs:       "My Jobs",
  applicants: "Applicants",
  pipeline:   "Pipeline",
  inbox:      "Inbox",
  analytics:  "Analytics",
  profile:    "Company Profile",
  settings:   "Settings",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full" style={{ background: "#F7F7FB" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#4F46E5" }} />
        <span className="text-[13px]" style={{ color: "#9CA3AF" }}>Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  const { account, joining, joinError, pendingInvite, removedFrom, dismissRemoved } = useAccount();
  const dash = useDashboard();
  const { candidates, jobs, conversations } = dash;

  const settingsRef = useRef(account.settings);
  settingsRef.current = account.settings;

  const [topView, setTopView] = useState<TopView>(account.membership === "member" ? "company" : "landing");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [focusCandidateId, setFocusCandidateId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [applicantsFilter, setApplicantsFilter] = useState<string | null>(null);

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);

  // Default the job selector to the first posting once the catalogue loads.
  useEffect(() => {
    if (!selectedJobId && jobs[0]) setSelectedJobId(jobs[0].id);
  }, [jobs, selectedJobId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [topView]);

  useEffect(() => {
    if (account.membership === "member" && account.onboarded) setTopView("company");
  }, [account.membership, account.onboarded]);

  /* Desktop notifications, derived from the Supabase-backed lists rather than a
     separate poll: a new unreviewed applicant, or a new inbound message. */
  const seenApplicants = useRef<Set<string> | null>(null);
  const seenMessages = useRef<Set<string> | null>(null);
  useEffect(() => {
    const applied = candidates.filter((c) => c.stage === "Applied");
    if (seenApplicants.current === null) {
      seenApplicants.current = new Set(applied.map((c) => c.id));
    } else {
      for (const c of applied) {
        if (!seenApplicants.current.has(c.id)) {
          seenApplicants.current.add(c.id);
          if (settingsRef.current.newApplicantAlerts) {
            sendNotification("New applicant", `${c.name} applied — ${c.fitScore}% fit`);
          }
        }
      }
    }
  }, [candidates]);
  useEffect(() => {
    const inbound = conversations.flatMap((cv) =>
      cv.messages.filter((m) => m.sender === "candidate").map((m) => ({ id: m.id, name: cv.candidateName, text: m.text })),
    );
    if (seenMessages.current === null) {
      seenMessages.current = new Set(inbound.map((m) => m.id));
    } else {
      for (const m of inbound) {
        if (!seenMessages.current.has(m.id)) {
          seenMessages.current.add(m.id);
          if (settingsRef.current.messageNotifications) {
            sendNotification(`New message from ${m.name}`, m.text);
          }
        }
      }
    }
  }, [conversations]);

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const openCandidate = (id: string) => {
    setFocusCandidateId(id);
    navigate("applicants");
  };
  const openApplicantsFiltered = (filter: string) => {
    setApplicantsFilter(filter);
    navigate("applicants");
  };
  const runGlobalSearch = (q: string) => {
    setGlobalSearch(q);
    navigate("applicants");
  };
  const handleCreateJob = (job: Job) => {
    void dash.createJob(job).catch(() => {}).finally(() => {
      setPostJobOpen(false);
      navigate("jobs");
    });
  };

  const pageProps = {
    onNavigate: navigate,
    candidates,
    jobs,
    conversations,
    currentJob,
    selectedJobId,
    onSelectJob: setSelectedJobId,
    onSelectCandidate: (id: string) => void dash.select(id),
    onSelectWithMessage: (candidate: Candidate, message: string) => void dash.selectWithMessage(candidate, message),
    onUnselectCandidate: (id: string) => void dash.unselect(id),
    onSaveCandidate: (id: string) => dash.toggleSaved(id),
    onNotFit: (id: string) => dash.markNotFit(id),
    onReconsider: (id: string) => dash.reconsider(id),
    onStageChange: (id: string, stage: Candidate["stage"]) => void dash.changeStage(id, stage),
    onLiveSelect: (message: string) => {
      if (currentJob) void dash.selectWithMessage(candidates.find((c) => c.jobId === currentJob.id)!, message);
    },
    onOpenCandidate: openCandidate,
    onOpenApplicantsFiltered: openApplicantsFiltered,
  };

  // The owner removed this member from the team.
  if (removedFrom) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#F7F7FB" }}>
        <div className="flex flex-col items-center gap-4 text-center px-6" style={{ maxWidth: 420 }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#EEF0FF" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </div>
          <div className="text-[15px] font-semibold" style={{ color: "#0F1117" }}>
            You no longer have access to {removedFrom}
          </div>
          <div className="text-[13px]" style={{ color: "#6B7280" }}>
            An admin removed you from the team. Ask them to invite you again if this was a mistake.
          </div>
          <button
            onClick={() => { dismissRemoved(); setTopView("landing"); }}
            className="text-[13px] font-semibold mt-1"
            style={{ color: "#4F46E5", background: "none", border: "none", cursor: "pointer" }}
          >
            Go to InSwipe
          </button>
        </div>
      </div>
    );
  }

  // Opening a team invite link (?invite=…) — show the accept screen (name + code).
  if (pendingInvite) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AcceptInvite />
      </Suspense>
    );
  }

  // Looking the invite up, or it was invalid.
  if ((joining && !account.onboarded) || joinError) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#F7F7FB" }}>
        <div className="flex flex-col items-center gap-4 text-center px-6" style={{ maxWidth: 420 }}>
          {joinError ? (
            <>
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>
              </div>
              <div className="text-[15px] font-semibold" style={{ color: "#0F1117" }}>Couldn&apos;t join the team</div>
              <div className="text-[13px]" style={{ color: "#6B7280" }}>{joinError}</div>
              <a href={window.location.pathname} className="text-[13px] font-semibold mt-1" style={{ color: "#4F46E5" }}>Go to InSwipe</a>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#4F46E5" }} />
              <div className="text-[13px]" style={{ color: "#6B7280" }}>Joining the team…</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Landing and other top-level views
  if (topView === "landing" && account.membership !== "member") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div key="landing" className="anim-fade-in">
          <Landing
            onHiring={() => setTopView("company-onboarding")}
            onSignIn={() => setTopView("company")}
          />
        </div>
      </Suspense>
    );
  }

  if (topView === "company-onboarding") {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div key="company-onboarding" className="anim-fade-in">
          <CompanyOnboarding
            onComplete={() => setTopView("company")}
            onBack={() => setTopView("landing")}
          />
        </div>
      </Suspense>
    );
  }

  // Company dashboard
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":  return <Dashboard  key="dashboard"  {...pageProps} />;
      case "jobs":       return <MyJobs     key="jobs"       {...pageProps} onOpenPostJob={() => setPostJobOpen(true)} onChangeJobStatus={(id: string, status: Job["status"]) => void dash.changeJobStatus(id, status)} onDuplicateJob={(id: string) => void dash.duplicate(id)} />;
      case "applicants": return <Applicants key="applicants" {...pageProps} focusCandidateId={focusCandidateId} onClearFocus={() => setFocusCandidateId(null)} globalSearch={globalSearch} onClearGlobalSearch={() => setGlobalSearch("")} initialFilter={applicantsFilter} onClearInitialFilter={() => setApplicantsFilter(null)} />;
      case "pipeline":   return <Pipeline   key="pipeline"   {...pageProps} />;
      case "inbox":      return <Inbox      key="inbox"      {...pageProps} />;
      case "analytics":  return <Analytics  key="analytics"  />;
      case "profile":    return <CompanyProfile key="profile" />;
      case "settings":   return <Settings   key="settings"   />;
      default:           return <Dashboard  key="dashboard"  {...pageProps} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-page)" }}>
      <Sidebar currentPage={currentPage} onNavigate={navigate} onOpenPostJob={() => setPostJobOpen(true)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title={PAGE_LABELS[currentPage]}
          onOpenPostJob={() => setPostJobOpen(true)}
          onNavigate={navigate}
          candidates={candidates}
          jobs={jobs}
          conversations={conversations}
          onOpenCandidate={openCandidate}
          onOpenJob={(id) => { setSelectedJobId(id); navigate("applicants"); }}
          onSearch={runGlobalSearch}
        />
        <main className="flex-1 overflow-auto" style={{ background: "var(--color-page)" }}>
          {renderPage()}
        </main>
      </div>
      {postJobOpen && <PostJobModal onClose={() => setPostJobOpen(false)} onCreate={handleCreateJob} />}
    </div>
  );
}
