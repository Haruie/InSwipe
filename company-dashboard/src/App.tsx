import { useState, useCallback, useEffect, lazy, Suspense } from "react";
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
import { useDashboard } from "./data/store";
import type { Candidate } from "./data/candidates";
import { clearSession, readSession, writeSession } from "./lib/session";

const Landing = lazy(() => import("./pages/Landing"));
const CompanyOnboarding = lazy(() => import("./pages/CompanyOnboarding"));

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

export function LoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-full" style={{ background: "#F7F7FB" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "#4F46E5" }} />
        <span className="text-[13px]" style={{ color: "#9CA3AF" }}>{label}</span>
      </div>
    </div>
  );
}

export default function App() {
  const { jobs, candidates, conversations } = useDashboard();
  // A reload should not sign the recruiter out: come back to the page they left.
  const [session] = useState(() => readSession());
  const [topView, setTopView] = useState<TopView>(session ? "company" : "landing");
  const [currentPage, setCurrentPage] = useState<Page>(session?.page ?? "dashboard");
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id ?? "");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);

  // Signing out is a session concern only — nothing is written to Supabase, the app
  // simply forgets that anyone was signed in.
  const logout = useCallback(() => {
    clearSession();
    setCurrentPage("dashboard");
    setTopView("landing");
  }, []);

  useEffect(() => {
    if (topView !== "company") return;
    writeSession({ signedIn: true, page: currentPage });
  }, [topView, currentPage]);

  // Switching top-level view is a full page change: start it at the top. Without this you
  // keep the landing page's scroll offset and arrive halfway down the next screen.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [topView]);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Fit is always scoped to a job (CLAUDE.md rule 5), so the applicant list and the
  // pipeline show one role at a time. The dashboard's own stats stay company-wide.
  const jobCandidates = currentJob ? candidates.filter(c => c.jobId === currentJob.id) : [];

  const openConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentPage("inbox");
  };

  const pageProps = {
    onNavigate: navigate,
    candidates,
    jobs,
    currentJob,
    selectedJobId,
    onSelectJob: setSelectedJobId,
  };

  // Landing and other top-level views
  if (topView === "landing") {
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
      case "dashboard":  return <Dashboard  key="dashboard"  {...pageProps} onOpenConversation={openConversation} onSelectJob={setSelectedJobId} />;
      case "jobs":       return <MyJobs     key="jobs"       {...pageProps} onOpenPostJob={() => setPostJobOpen(true)} />;
      case "applicants": return <Applicants key="applicants" {...pageProps} candidates={jobCandidates} onOpenConversation={openConversation} />;
      case "pipeline":   return <Pipeline   key="pipeline"   candidates={jobCandidates} />;
      case "inbox":      return <Inbox      key="inbox"      onNavigate={navigate} activeConversationId={activeConversationId} onActiveConversationChange={setActiveConversationId} />;
      case "analytics":  return <Analytics  key="analytics"  />;
      case "profile":    return <CompanyProfile key="profile" />;
      case "settings":   return <Settings   key="settings"   />;
      default:           return <Dashboard  key="dashboard"  {...pageProps} onOpenConversation={openConversation} onSelectJob={setSelectedJobId} />;
    }
  };

  const inboxBadge = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-page)" }}>
      <Sidebar currentPage={currentPage} onNavigate={navigate} onOpenPostJob={() => setPostJobOpen(true)} inboxBadge={inboxBadge} onLogout={logout} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={PAGE_LABELS[currentPage]} onOpenPostJob={() => setPostJobOpen(true)} onNavigate={navigate} />
        <main className="flex-1 overflow-auto" style={{ background: "var(--color-page)" }}>
          {renderPage()}
        </main>
      </div>
      {postJobOpen && <PostJobModal onClose={() => setPostJobOpen(false)} />}
    </div>
  );
}

export type { Candidate };
