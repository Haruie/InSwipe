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
import { CANDIDATES, JOBS } from "./data/mock";
import type { Candidate, Job } from "./data/mock";

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
  const [topView, setTopView] = useState<TopView>("landing");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>("j1");

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);

  // Switching top-level view is a full page change: start it at the top. Without this you
  // keep the landing page's scroll offset and arrive halfway down the next screen.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [topView]);

  const handleSelectCandidate = (id: string) =>
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: true, stage: "Selected" } : c));

  const handleStageChange = (id: string, stage: Candidate["stage"]) =>
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage } : c));

  const handleJobStatusChange = (id: string, status: Job["status"]) =>
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));

  const handleDuplicateJob = (id: string) =>
    setJobs(prev => {
      const source = prev.find(j => j.id === id);
      if (!source) return prev;
      const copy: Job = { ...source, id: `${source.id}-copy-${Date.now()}`, title: `${source.title} (Copy)`, status: "Paused", applicants: 0, selected: 0, conversations: 0, posted: "Just now" };
      return [copy, ...prev];
    });

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const pageProps = {
    onNavigate: navigate,
    candidates,
    jobs,
    currentJob,
    selectedJobId,
    onSelectJob: setSelectedJobId,
    onSelectCandidate: handleSelectCandidate,
    onStageChange: handleStageChange,
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
      case "dashboard":  return <Dashboard  key="dashboard"  {...pageProps} />;
      case "jobs":       return <MyJobs     key="jobs"       {...pageProps} onOpenPostJob={() => setPostJobOpen(true)} onChangeJobStatus={handleJobStatusChange} onDuplicateJob={handleDuplicateJob} />;
      case "applicants": return <Applicants key="applicants" {...pageProps} />;
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
        <TopBar title={PAGE_LABELS[currentPage]} onOpenPostJob={() => setPostJobOpen(true)} onNavigate={navigate} />
        <main className="flex-1 overflow-auto" style={{ background: "var(--color-page)" }}>
          {renderPage()}
        </main>
      </div>
      {postJobOpen && <PostJobModal onClose={() => setPostJobOpen(false)} />}
    </div>
  );
}
