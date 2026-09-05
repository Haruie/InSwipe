import { useEffect, useState } from "react";
import type { Page } from "../App";
import type { Candidate, Job } from "../data/mock";
import { ATTENTION_ITEMS, ANALYTICS_DATA, fitBand } from "../data/mock";

interface Props {
  onNavigate: (page: Page) => void;
  candidates: Candidate[];
  jobs: Job[];
}

function StatCard({ label, value, sub, accent, delay, onClick }: { label: string; value: number; sub: string; accent?: string; delay: number; onClick?: () => void }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const t = setTimeout(() => {
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 800, 1);
        setDisplayed(Math.floor((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div
      onClick={onClick}
      className={`card-hover anim-fade-up rounded-[20px] border p-6 flex flex-col gap-3 ${onClick ? "cursor-pointer" : ""}`}
      style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: `${delay}s` }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>{label}</div>
      <div className="text-[36px] font-bold leading-none" style={{ color: "#0F1117", fontFamily: "Inter" }}>{displayed}</div>
      <div className="text-[12px]" style={{ color: "#9CA3AF" }}>{sub}</div>
    </div>
  );
}

function FunnelBar({ stage, count, max, delay }: { stage: string; count: number; max: number; delay: number }) {
  const [w, setW] = useState(0);
  const pct = Math.round((count / max) * 100);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300 + delay * 100); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div className="flex items-center gap-3">
      <div className="text-[12px] w-28 text-right flex-shrink-0" style={{ color: "#6B7280" }}>{stage}</div>
      <div className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: "#F7F7FB" }}>
        <div className="h-full rounded-lg transition-all duration-700 ease-out" style={{ width: `${w}%`, background: "#4F46E5" }} />
        <span className="absolute inset-0 flex items-center px-3 text-[12px] font-medium" style={{ color: w > 25 ? "#FFFFFF" : "#374151" }}>{count}</span>
      </div>
      <div className="text-[12px] w-8 text-right" style={{ color: "#9CA3AF" }}>{pct}%</div>
    </div>
  );
}

export default function Dashboard({ onNavigate, candidates, jobs }: Props) {
  const activeJobs = jobs.filter(j => j.status === "Active").length;
  const newApplicants = candidates.filter(c => c.stage === "Applied").length;
  const awaitingReview = candidates.filter(c => c.stage === "Applied" || c.stage === "Reviewed").length;
  const activeConvs = candidates.filter(c => c.stage === "In Conversation").length;
  const topCandidates = [...candidates].sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);

  return (
    <div className="p-8 max-w-[1100px] mx-auto space-y-7">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard label="Active Jobs"           value={activeJobs}       sub="2 accepting applications"   delay={0}    onClick={() => onNavigate("jobs")} />
        <StatCard label="New Applicants"         value={newApplicants}    sub="Since last visit"           accent="#4F46E5" delay={0.08} onClick={() => onNavigate("applicants")} />
        <StatCard label="Awaiting Review"        value={awaitingReview}   sub="Unreviewed candidates"      accent="#EA580C" delay={0.16} onClick={() => onNavigate("applicants")} />
        <StatCard label="Active Conversations"   value={activeConvs}      sub="Open threads"               accent="#16A34A" delay={0.24} onClick={() => onNavigate("inbox")} />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Needs attention */}
          <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: "0.28s" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Needs Your Attention</h2>
              <span className="text-[12px] px-2.5 py-1 rounded-full font-medium border" style={{ background: "#FFFFFF", borderColor: "#DC2626", color: "#DC2626" }}>
                {ATTENTION_ITEMS.length} items
              </span>
            </div>
            <div>
              {ATTENTION_ITEMS.map(item => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4 transition-colors" style={{ borderBottom: "1px solid #E8E8EF" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                    background: item.type === "deadline" ? "#FFEDD5" : item.type === "applicant" ? "#FFEDD5" : "#EEF0FF"
                  }}>
                    {item.type === "deadline" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                    {item.type === "applicant" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                    {item.type === "message"  && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px]" style={{ color: "#0F1117" }}>{item.message}</div>
                  </div>
                  <button
                    onClick={() => onNavigate(item.type === "message" ? "inbox" : item.type === "applicant" ? "applicants" : "jobs")}
                    className="btn-press text-[12px] px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                    style={{ background: "#EEF0FF", color: "#4F46E5" }}
                  >
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Funnel */}
          <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: "0.34s" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Hiring Funnel</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>All active roles combined</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {ANALYTICS_DATA.funnel.map((item, i) => (
                <FunnelBar key={item.stage} stage={item.stage} count={item.count} max={43} delay={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Strongest candidates */}
        <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: "0.3s" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Strongest Applicants</h2>
            <button onClick={() => onNavigate("applicants")} className="text-[12px] font-medium" style={{ color: "#4F46E5" }}>View all →</button>
          </div>
          <div>
            {topCandidates.map((c, i) => {
              const { color, label } = fitBand(c.fitScore);
              return (
                <div
                  key={c.id}
                  onClick={() => onNavigate("applicants")}
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer anim-lift-in transition-colors"
                  style={{ borderBottom: i < 2 ? "1px solid #E8E8EF" : "none", animationDelay: `${0.38 + i * 0.07}s` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="text-[12px] font-semibold w-5 text-center" style={{ color: "#9CA3AF" }}>#{c.rank}</div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{c.name}</div>
                    <div className="text-[12px] mt-0.5 truncate" style={{ color: "#6B7280" }}>{c.school}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold" style={{ color }}>{c.fitScore}%</div>
                    <div className="text-[11px] mt-0.5" style={{ color }}>{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4">
            <button
              onClick={() => onNavigate("applicants")}
              className="btn-press w-full py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150"
              style={{ background: "#EEF0FF", borderColor: "#E8E8EF", color: "#4F46E5" }}
            >
              Review All 7 Applicants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
