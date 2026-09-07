import { useEffect, useState } from "react";
import type { Page } from "../App";
import type { Candidate, Job, Conversation } from "../data/mock";
import { KANBAN_STAGES, fitBand, jobStats } from "../data/mock";
import { useAccount } from "../lib/account";

interface Props {
  onNavigate: (page: Page) => void;
  candidates: Candidate[];
  jobs: Job[];
  conversations: Conversation[];
  onOpenCandidate: (id: string) => void;
  onOpenApplicantsFiltered: (filter: string) => void;
  onSelectJob: (id: string) => void;
}

const STAGE_COLOR: Record<string, string> = {
  "Applied": "#9CA3AF",
  "Reviewed": "#F59E0B",
  "Selected": "#4F46E5",
  "In Conversation": "#16A34A",
  "Interview": "#0EA5E9",
  "Offer": "#EA580C",
  "Hired": "#15803D",
};

/* ── Count-up stat ─────────────────────────────────────────── */

function Stat({ label, value, sub, onClick, delay }: { label: string; value: number; sub: string; onClick: () => void; delay: number }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (typeof document !== "undefined" && document.hidden) { setN(value); return; }
    setN(0);
    let raf = 0, start = 0;
    const t = setTimeout(() => {
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 700, 1);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) raf = requestAnimationFrame(tick); else setN(value);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    const guard = setTimeout(() => setN(value), delay + 900);
    return () => { clearTimeout(t); clearTimeout(guard); cancelAnimationFrame(raf); };
  }, [value, delay]);

  return (
    <button
      onClick={onClick}
      className="card-hover anim-fade-up rounded-[20px] border p-5 flex flex-col gap-1.5 text-left"
      style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF", letterSpacing: "0.07em" }}>{label}</span>
      <span className="text-[34px] font-bold leading-none tabular-nums" style={{ color: "#0F1117" }}>{n}</span>
      <span className="text-[12px]" style={{ color: "#9CA3AF" }}>{sub}</span>
    </button>
  );
}

/* ── Card shell ────────────────────────────────────────────── */

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────── */

export default function Dashboard({ onNavigate, candidates, jobs, conversations, onOpenCandidate, onOpenApplicantsFiltered, onSelectJob }: Props) {
  const { account } = useAccount();
  const firstName = account.user.name.split(" ")[0] || "there";

  const activeJobs = jobs.filter(j => j.status === "Active");
  const awaitingReview = candidates.filter(c => c.stage === "Applied").length;
  const selectedCount = candidates.filter(c => c.selected).length;
  const savedCount = candidates.filter(c => c.saved && !c.selected).length;
  const unreadMsgs = conversations.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0);

  // Funnel from real candidate stages.
  const stageCounts = KANBAN_STAGES.map(s => ({ stage: s, count: candidates.filter(c => c.stage === s).length }));
  const funnelMax = Math.max(1, ...stageCounts.map(s => s.count));

  const strongest = [...candidates]
    .filter(c => !c.notFit)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 4);

  const rowHover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = "#F7F7FB"),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = "transparent"),
  };

  return (
    <div className="p-8 max-w-[1120px] mx-auto space-y-6">
      {/* Greeting */}
      <div className="anim-fade-up">
        <h2 className="text-[20px] font-bold" style={{ color: "#0F1117" }}>Good to see you, {firstName}</h2>
        <p className="text-[13px] mt-0.5" style={{ color: "#9CA3AF" }}>Here&apos;s where your hiring stands today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Active roles" value={activeJobs.length} sub="accepting applications" onClick={() => onNavigate("jobs")} delay={0} />
        <Stat label="Awaiting review" value={awaitingReview} sub="applied, no decision" onClick={() => onOpenApplicantsFiltered("Applied")} delay={60} />
        <Stat label="Selected" value={selectedCount} sub="moved forward" onClick={() => onOpenApplicantsFiltered("Selected")} delay={120} />
        <Stat label="Conversations" value={conversations.length} sub={unreadMsgs > 0 ? `${unreadMsgs} unread` : "all caught up"} onClick={() => onNavigate("inbox")} delay={180} />
      </div>

      <div className="grid grid-cols-[1.35fr_1fr] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Hiring funnel */}
          <Card title="Hiring funnel" action={<span className="text-[12px]" style={{ color: "#9CA3AF" }}>{candidates.length} candidates</span>}>
            <div className="px-6 py-5 space-y-2.5">
              {stageCounts.map(({ stage, count }) => (
                <button
                  key={stage}
                  onClick={() => onNavigate("pipeline")}
                  className="w-full flex items-center gap-3 group"
                >
                  <span className="text-[12px] w-28 text-right flex-shrink-0" style={{ color: "#6B7280" }}>{stage}</span>
                  <span className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: "#F7F7FB" }}>
                    <span
                      className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-700 ease-out"
                      style={{ width: `${Math.max(count ? 6 : 0, (count / funnelMax) * 100)}%`, background: STAGE_COLOR[stage] }}
                    />
                    <span className="absolute inset-0 flex items-center px-2.5 text-[11px] font-semibold" style={{ color: count / funnelMax > 0.2 ? "#FFFFFF" : "#374151" }}>
                      {count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Open roles */}
          <Card title="Open roles" action={<button onClick={() => onNavigate("jobs")} className="text-[12px] font-medium" style={{ color: "#4F46E5" }}>Manage →</button>}>
            {activeJobs.length === 0 ? (
              <div className="px-6 py-8 text-center text-[13px]" style={{ color: "#9CA3AF" }}>
                No active roles. <button onClick={() => onNavigate("jobs")} className="font-medium" style={{ color: "#4F46E5" }}>Post one →</button>
              </div>
            ) : (
              activeJobs.slice(0, 4).map((j, i) => {
                const n = jobStats(j.id, candidates, conversations).applicants;
                return (
                  <button
                    key={j.id}
                    onClick={() => { onSelectJob(j.id); onNavigate("applicants"); }}
                    className="w-full flex items-center gap-4 px-6 py-3.5 text-left transition-colors"
                    style={{ borderBottom: i < Math.min(activeJobs.length, 4) - 1 ? "1px solid #E8E8EF" : "none" }}
                    {...rowHover}
                  >
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EEF0FF" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{j.title}</span>
                      <span className="block text-[12px]" style={{ color: "#9CA3AF" }}>{j.department} · closes {j.deadline}</span>
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className="block text-[14px] font-bold" style={{ color: "#0F1117" }}>{n}</span>
                      <span className="block text-[11px]" style={{ color: "#9CA3AF" }}>{n === 1 ? "applicant" : "applicants"}</span>
                    </span>
                  </button>
                );
              })
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Strongest applicants */}
          <Card
            title="Strongest applicants"
            action={<button onClick={() => onNavigate("applicants")} className="text-[12px] font-medium" style={{ color: "#4F46E5" }}>View all →</button>}
          >
            {strongest.length === 0 ? (
              <div className="px-6 py-8 text-center text-[13px]" style={{ color: "#9CA3AF" }}>No applicants yet.</div>
            ) : (
              strongest.map((c, i) => {
                const { color, label } = fitBand(c.fitScore);
                return (
                  <button
                    key={c.id}
                    onClick={() => onOpenCandidate(c.id)}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors"
                    style={{ borderBottom: i < strongest.length - 1 ? "1px solid #E8E8EF" : "none" }}
                    {...rowHover}
                  >
                    <span className="text-[12px] font-bold w-4 flex-shrink-0" style={{ color: "#C7C7D1" }}>{i + 1}</span>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{c.name}</span>
                      <span className="block text-[12px] truncate" style={{ color: "#9CA3AF" }}>{c.school}</span>
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className="block text-[14px] font-bold" style={{ color }}>{c.fitScore}%</span>
                      <span className="block text-[11px]" style={{ color }}>{label}</span>
                    </span>
                  </button>
                );
              })
            )}
          </Card>

          {/* Shortcuts */}
          <Card title="Shortcuts">
            <div className="p-3">
              {[
                { label: "Review applicants", value: awaitingReview, run: () => onOpenApplicantsFiltered("Applied") },
                { label: "Saved for later", value: savedCount, run: () => onOpenApplicantsFiltered("Saved") },
                { label: "Not a fit", value: candidates.filter(c => c.notFit).length, run: () => onOpenApplicantsFiltered("Not a fit") },
                { label: "Open conversations", value: conversations.length, run: () => onNavigate("inbox") },
              ].map((s, i, arr) => (
                <button
                  key={s.label}
                  onClick={s.run}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
                  style={{ marginBottom: i < arr.length - 1 ? 2 : 0 }}
                  {...rowHover}
                >
                  <span className="text-[13px]" style={{ color: "#374151" }}>{s.label}</span>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F7F7FB", color: "#6B7280" }}>{s.value}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
