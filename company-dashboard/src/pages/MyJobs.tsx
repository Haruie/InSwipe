import { useState } from "react";
import type { Page } from "../App";
import type { JobPosting as Job } from "../data/jobs";
import { useDashboard } from "../data/store";
import { locationLabel, stipendLabel } from "../data/jobs";

interface Props {
  onNavigate: (page: Page) => void;
  jobs: Job[];
  onOpenPostJob: () => void;
  onSelectJob: (id: string) => void;
}

const StatusBadge = ({ status }: { status: Job["status"] }) => {
  const map = {
    Active: { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
    Paused: { bg: "#FFEDD5", color: "#EA580C",  dot: "#EA580C" },
    Closed: { bg: "#F3F4F6", color: "#6B7280",  dot: "#9CA3AF" },
  };
  const s = map[status];
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

function JobCard({ job, onNavigate, onSelectJob, onOpenPostJob, onChangeJobStatus, onDuplicateJob, delay }: {
  job: Job; onNavigate: (p: Page) => void; onSelectJob: (id: string) => void; onOpenPostJob: () => void;
  onChangeJobStatus: (id: string, status: Job["status"]) => void; onDuplicateJob: (id: string) => void; delay: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const MENU_ACTIONS: { label: string; run: () => void }[] = [
    { label: "Edit", run: () => { onSelectJob(job.id); onOpenPostJob(); } },
    { label: "Duplicate", run: () => onDuplicateJob(job.id) },
    { label: job.status === "Paused" ? "Resume" : "Pause", run: () => onChangeJobStatus(job.id, job.status === "Paused" ? "Active" : "Paused") },
    { label: job.status === "Closed" ? "Reopen" : "Close", run: () => onChangeJobStatus(job.id, job.status === "Closed" ? "Active" : "Closed") },
  ];

  return (
    <div
      className="card-hover anim-fade-up rounded-[20px] border p-6 relative"
      style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={job.status} />
            <span className="text-[12px]" style={{ color: "#9CA3AF" }}>{job.department}</span>
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: "#0F1117" }}>{job.title}</h3>
          <div className="flex items-center gap-4">
            <span className="text-[12px] flex items-center gap-1" style={{ color: "#6B7280" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {locationLabel(job)}
            </span>
            <span className="text-[12px]" style={{ color: "#6B7280" }}>{job.type}</span>
            <span className="text-[12px] font-semibold" style={{ color: "#4F46E5" }}>{stipendLabel(job)}</span>
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "#9CA3AF" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-10 anim-scale-spring" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)" }}>
              {MENU_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => { a.run(); setMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors"
                  style={{ color: a.label === "Close" ? "#DC2626" : "#374151" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#6B7280" }}>{job.about}</p>

      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-medium" style={{ color: "#9CA3AF" }}>Required:</span>
          {job.requiredSkills.map(s => <span key={s} className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: "#EEF0FF", color: "#4F46E5" }}>{s}</span>)}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-medium" style={{ color: "#9CA3AF" }}>Preferred:</span>
          {job.preferredSkills.slice(0, 3).map(s => <span key={s} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "#F7F7FB", color: "#6B7280", border: "1px solid #E8E8EF" }}>{s}</span>)}
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4" style={{ borderTop: "1px solid #E8E8EF" }}>
        {[
          { label: "Applicants",     value: job.applicants,     accent: "#0F1117" },
          { label: "Selected",       value: job.selected,       accent: job.selected > 0 ? "#16A34A" : "#0F1117" },
          { label: "Conversations",  value: job.conversations,  accent: job.conversations > 0 ? "#4F46E5" : "#0F1117" },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-[18px] font-bold" style={{ color: stat.accent }}>{stat.value}</div>
            <div className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{stat.label}</div>
          </div>
        ))}
        <div className="ml-auto text-[12px]" style={{ color: "#9CA3AF" }}>Closes {job.deadline}</div>
        <button
          onClick={() => { onSelectJob(job.id); onNavigate("applicants"); }}
          className="btn-press text-[12px] font-semibold px-4 py-2 rounded-lg"
          style={{ background: "#EEF0FF", color: "#4F46E5" }}
        >
          View Applicants →
        </button>
      </div>
    </div>
  );
}

export default function MyJobs({ onNavigate, jobs, onOpenPostJob, onSelectJob }: Props) {
  const { changeJobStatus, duplicate } = useDashboard();
  const onChangeJobStatus = (id: string, status: Job["status"]) => void changeJobStatus(id, status);
  const onDuplicateJob = (id: string) => void duplicate(id);
  const [filter, setFilter] = useState<"All" | "Active" | "Paused" | "Closed">("All");
  const filtered = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: "#0F1117" }}>My Jobs</h2>
          <p className="text-[13px] mt-0.5" style={{ color: "#9CA3AF" }}>{jobs.length} positions · {jobs.filter(j => j.status === "Active").length} active</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
            {(["All", "Active", "Paused", "Closed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                style={{ background: filter === f ? "#FFFFFF" : "transparent", color: filter === f ? "#0F1117" : "#9CA3AF", boxShadow: filter === f ? "0 1px 3px rgba(15,17,23,0.06)" : "none" }}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={onOpenPostJob}
            className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Post a Job
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center anim-fade-up" style={{ padding: "80px 24px" }}>
            <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: "#EEF0FF" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold mb-2" style={{ color: "#0F1117" }}>
              {jobs.length === 0 ? "No jobs posted yet" : `No ${filter.toLowerCase()} jobs`}
            </h3>
            <p className="text-[14px] mb-5" style={{ color: "#6B7280", maxWidth: 380, lineHeight: 1.6 }}>
              {jobs.length === 0
                ? "Post a role and students matched to it start appearing here, ranked by fit."
                : "Nothing in this status right now. Try another filter."}
            </p>
            {jobs.length === 0 ? (
              <button
                onClick={onOpenPostJob}
                className="btn-press px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
              >
                Post your first job
              </button>
            ) : (
              <button
                onClick={() => setFilter("All")}
                className="btn-press px-4 py-2.5 rounded-xl text-[13px] font-semibold border"
                style={{ background: "#FFFFFF", borderColor: "#4F46E5", color: "#4F46E5" }}
              >
                Show all jobs
              </button>
            )}
          </div>
        ) : (
          filtered.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              onNavigate={onNavigate}
              onSelectJob={onSelectJob}
              onOpenPostJob={onOpenPostJob}
              onChangeJobStatus={onChangeJobStatus}
              onDuplicateJob={onDuplicateJob}
              delay={i * 0.08}
            />
          ))
        )}
      </div>
    </div>
  );
}
