import { useEffect, useMemo, useRef, useState } from "react";
import type { Page } from "../App";
import type { Candidate, Job, Conversation } from "../data/mock";
import { jobStats } from "../data/mock";

interface Props {
  title: string;
  onOpenPostJob: () => void;
  onNavigate: (p: Page) => void;
  candidates: Candidate[];
  jobs: Job[];
  conversations: Conversation[];
  onOpenCandidate: (id: string) => void;
  onOpenJob: (id: string) => void;
  onSearch: (q: string) => void;
}

export default function TopBar({
  title, onOpenPostJob, onNavigate, candidates, jobs, conversations, onOpenCandidate, onOpenJob, onSearch,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchWrap = useRef<HTMLDivElement>(null);
  const notifWrap = useRef<HTMLDivElement>(null);

  // Notifications built from real state: unread threads + unreviewed applicants.
  const unreadThreads = conversations.filter((c) => c.unread > 0);
  const unreviewed = candidates.filter((c) => c.stage === "Applied").length;
  const notifs = useMemo(() => {
    const list: { id: string; title: string; desc: string; go: () => void }[] = [];
    unreadThreads.forEach((c) =>
      list.push({
        id: `msg-${c.id}`,
        title: `${c.candidateName} messaged you`,
        desc: c.lastMessage,
        go: () => onNavigate("inbox"),
      }),
    );
    if (unreviewed > 0) {
      list.push({
        id: "unreviewed",
        title: `${unreviewed} applicant${unreviewed === 1 ? "" : "s"} awaiting review`,
        desc: "Open Applicants to go through them",
        go: () => onNavigate("applicants"),
      });
    }
    return list;
  }, [conversations, unreviewed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close popovers on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchWrap.current && !searchWrap.current.contains(e.target as Node)) setFocused(false);
      if (notifWrap.current && !notifWrap.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.trim().toLowerCase();
  const candMatches = q
    ? candidates.filter((c) => c.name.toLowerCase().includes(q) || c.school.toLowerCase().includes(q) || c.fits.some((f) => f.toLowerCase().includes(q))).slice(0, 5)
    : [];
  const jobMatches = q
    ? jobs.filter((j) => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const hasResults = candMatches.length > 0 || jobMatches.length > 0;
  const showResults = focused && q.length > 0;

  const submit = () => {
    if (!q) return;
    onSearch(query.trim());
    setFocused(false);
  };

  return (
    <header
      className="flex items-center gap-4 px-7 flex-shrink-0 relative"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E8E8EF", height: 60, boxShadow: "0 1px 3px rgba(15,17,23,0.06)", zIndex: 30 }}
    >
      <h1 className="text-base font-semibold" style={{ color: "#0F1117" }}>{title}</h1>

      {/* Search */}
      <div ref={searchWrap} className="relative ml-4">
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] transition-all duration-200"
          style={{
            background: "#F7F7FB",
            border: `1px solid ${focused ? "#4F46E5" : "#E8E8EF"}`,
            width: 300,
            boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search candidates, jobs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") { setQuery(""); setFocused(false); }
            }}
            className="bg-transparent border-none outline-none text-[13px] w-full"
            style={{ color: "#0F1117", fontFamily: "Inter, sans-serif" }}
          />
          {query ? (
            <button onClick={() => setQuery("")} className="text-[11px]" style={{ color: "#9CA3AF" }} aria-label="Clear search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          ) : (
            <kbd className="text-[11px] px-1.5 py-0.5 rounded-[6px]" style={{ color: "#9CA3AF", background: "#E8E8EF", fontFamily: "Inter" }}>↵</kbd>
          )}
        </div>

        {showResults && (
          <div
            className="absolute left-0 top-full mt-2 w-[340px] rounded-2xl overflow-hidden anim-scale-spring"
            style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.12)", zIndex: 50 }}
          >
            {!hasResults ? (
              <div className="px-4 py-4 text-[13px]" style={{ color: "#9CA3AF" }}>No matches for “{query}”.</div>
            ) : (
              <>
                {candMatches.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Candidates</div>
                    {candMatches.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onOpenCandidate(c.id); setFocused(false); setQuery(""); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{c.name}</span>
                          <span className="block text-[12px] truncate" style={{ color: "#9CA3AF" }}>{c.school} · {c.fitScore}% fit</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {jobMatches.length > 0 && (
                  <div style={{ borderTop: candMatches.length > 0 ? "1px solid #E8E8EF" : "none" }}>
                    <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Jobs</div>
                    {jobMatches.map((j) => (
                      <button
                        key={j.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onOpenJob(j.id); setFocused(false); setQuery(""); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EEF0FF" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{j.title}</span>
                          <span className="block text-[12px] truncate" style={{ color: "#9CA3AF" }}>{j.department} · {jobStats(j.id, candidates, conversations).applicants} applicants</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={submit}
                  className="w-full px-4 py-2.5 text-[12px] font-medium text-left transition-colors"
                  style={{ borderTop: "1px solid #E8E8EF", color: "#4F46E5" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7FB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  See all applicants matching “{query}” →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div ref={notifWrap} className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="btn-press relative p-2.5 rounded-[10px] border transition-all duration-150"
          style={{ background: notifOpen ? "#EEF0FF" : "#F7F7FB", borderColor: notifOpen ? "#4F46E5" : "#E8E8EF", color: "#6B7280" }}
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifs.length > 0 && (
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#4F46E5" }}>
              {notifs.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden anim-scale-spring"
            style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.12)", zIndex: 50 }}
          >
            <div className="px-4 py-3 text-[13px] font-semibold" style={{ borderBottom: "1px solid #E8E8EF", color: "#0F1117" }}>
              Notifications
            </div>
            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px]" style={{ color: "#9CA3AF" }}>
                You&apos;re all caught up.
              </div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { n.go(); setNotifOpen(false); }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7FB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4F46E5" }} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium" style={{ color: "#0F1117" }}>{n.title}</span>
                    <span className="block text-[12px] mt-0.5 truncate" style={{ color: "#6B7280" }}>{n.desc}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Post Job */}
      <button
        onClick={onOpenPostJob}
        className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-white"
        style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Post a Job
      </button>
    </header>
  );
}
