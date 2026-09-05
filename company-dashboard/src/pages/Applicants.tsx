import { useState, useEffect } from "react";
import type { Page } from "../App";
import type { Candidate, Job } from "../data/mock";
import { fitBand } from "../data/mock";
import CandidateDrawer from "../components/CandidateDrawer";
import SelectionModal from "../components/SelectionModal";
import FitScoreRing from "../components/FitScoreRing";
import ResumeViewerModal from "../components/ResumeViewerModal";

interface Props {
  onNavigate: (page: Page) => void;
  candidates: Candidate[];
  jobs: Job[];
  currentJob: Job;
  onSelectCandidate: (id: string) => void;
  onStageChange: (id: string, stage: Candidate["stage"]) => void;
}

// ── Filter chips ───────────────────────────────────────────
type FilterKey = "Skill" | "Availability" | "Work mode" | "University" | "Grad year" | "Min fit";
const FILTER_CHIPS: FilterKey[] = ["Skill", "Availability", "Work mode", "University", "Grad year", "Min fit"];

interface Filters {
  skill: string | null;
  availability: string | null; // "Full-time" | "Part-time"
  workMode: string | null;     // "Remote" | "Hybrid" | "On-site"
  university: string | null;
  gradYear: string | null;
  minFit: number | null;
}
const EMPTY_FILTERS: Filters = { skill: null, availability: null, workMode: null, university: null, gradYear: null, minFit: null };

/** Truncate on a word boundary so a preview snippet never gets cut off mid-word. */
function truncateWords(text: string, max: number) {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return (lastSpace > 12 ? clipped.slice(0, lastSpace) : clipped).trimEnd() + "…";
}

// ── Candidate row card ─────────────────────────────────────
interface CardProps {
  candidate: Candidate;
  onOpen: () => void;
  onSelect: () => void;
  onViewResume: () => void;
  delay: number;
}

function CandidateCard({ candidate: c, onOpen, onSelect, onViewResume, delay }: CardProps) {
  return (
    <div
      className="card-hover anim-lift-in rounded-[20px] border flex gap-0 overflow-hidden"
      style={{
        background: "#FFFFFF",
        borderColor: c.selected ? "#86EFAC" : "#E8E8EF",
        boxShadow: c.selected ? "0 0 0 1px #86EFAC" : "0 1px 3px rgba(15,17,23,0.06)",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Score column */}
      <div
        className="flex flex-col items-center justify-start pt-5 px-4 pb-4 flex-shrink-0"
        style={{ width: 100, background: "#F7F7FB", borderRight: "1px solid #E8E8EF" }}
      >
        <FitScoreRing score={c.fitScore} size={72} strokeWidth={5} showLabel={true} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 p-5">
        {/* Name row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
            style={{ background: c.avatarColor, color: "#4F46E5" }}
          >
            {c.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>{c.name}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "#F7F7FB", color: "#9CA3AF" }}>#{c.rank}</span>
              {c.selected && (
                <span className="chip-selected text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#DCFCE7", color: "#15803D" }}>✓ Selected</span>
              )}
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "#374151" }}>{c.degree} · {c.school}</div>
            <div className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{c.year} · Class of {c.gradYear} · {c.location}</div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-2">
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-[12px] font-medium flex-shrink-0 mt-0.5" style={{ color: "#9CA3AF" }}>Fits:</span>
            <div className="flex flex-wrap gap-1.5">
              {c.fits.slice(0, 5).map(s => (
                <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#DCFCE7", color: "#15803D" }}>✓ {s}</span>
              ))}
            </div>
          </div>
          {c.lacks.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[12px] font-medium flex-shrink-0 mt-0.5" style={{ color: "#9CA3AF" }}>Lacks:</span>
              <div className="flex flex-wrap gap-1.5">
                {c.lacks.map(s => (
                  <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>○ {s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meta line */}
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "#9CA3AF" }}>
          <span>{c.projects.length} project{c.projects.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          {c.githubUrl ? (
            <a href={c.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#4F46E5" }}>GitHub</a>
          ) : (
            <span style={{ color: "#D1D5DB" }} title="Not shared">GitHub</span>
          )}
          <span>·</span>
          {c.portfolioUrl ? (
            <a href={c.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#4F46E5" }}>Portfolio</a>
          ) : (
            <span style={{ color: "#D1D5DB" }} title="Not shared">Portfolio</span>
          )}
          <span>·</span>
          <span>Resume attached</span>
        </div>

        {c.note && (
          <div className="mt-2 flex items-start gap-1.5 text-[12px]" style={{ color: "#374151" }} title={c.note}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
            <em className="leading-relaxed">"{truncateWords(c.note, 90)}"</em>
          </div>
        )}

        {/* AI rationale */}
        <div className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "#6B7280" }}>
          <span className="inline-flex items-center gap-1 mr-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#EEF0FF", color: "#4F46E5" }}>AI</span>
          {c.aiExplain}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between p-5 flex-shrink-0" style={{ borderLeft: "1px solid #E8E8EF" }}>
        <div className="flex flex-col gap-2">
          <button
            onClick={onOpen}
            className="btn-press text-[12px] font-medium px-3 py-2 rounded-lg border transition-all duration-150"
            style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#374151" }}
          >
            View Profile
          </button>
          <button
            onClick={onViewResume}
            className="btn-press text-[12px] font-medium px-3 py-2 rounded-lg border transition-all duration-150"
            style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#374151" }}
          >
            Resume ↗
          </button>
        </div>
        {!c.selected ? (
          <button
            onClick={onSelect}
            className="btn-press text-[12px] font-semibold px-4 py-2 rounded-lg transition-all duration-150 mt-2"
            style={{ background: "#EEF0FF", color: "#4F46E5" }}
          >
            Select
          </button>
        ) : (
          <div className="text-[12px] font-medium px-3 py-2 rounded-lg mt-2" style={{ background: "#DCFCE7", color: "#15803D" }}>
            ✓ Selected
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compare card ───────────────────────────────────────────
function CompareCard({ candidate: c, onOpen }: { candidate: Candidate; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="card-hover anim-lift-in rounded-[20px] border p-5 flex flex-col cursor-pointer"
      style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</div>
        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#F7F7FB", color: "#9CA3AF" }}>#{c.rank}</span>
      </div>
      <div className="mb-1 text-[13px] font-semibold" style={{ color: "#0F1117" }}>{c.name}</div>
      <div className="mb-3 text-[12px]" style={{ color: "#6B7280" }}>{c.school}</div>
      <div className="mb-3 flex justify-center">
        <FitScoreRing score={c.fitScore} size={80} strokeWidth={5} />
      </div>
      <p className="text-[12px] leading-relaxed mb-3 flex-1" style={{ color: "#6B7280" }}>
        {c.aiExplain.slice(0, 90)}…
      </p>
      <div className="space-y-2">
        <div>
          <div className="text-[11px] font-semibold mb-1.5" style={{ color: "#15803D" }}>Fits:</div>
          <div className="flex flex-wrap gap-1">
            {c.fits.slice(0, 3).map(s => <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#15803D" }}>✓ {s}</span>)}
          </div>
        </div>
        {c.lacks.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: "#EA580C" }}>Lacks:</div>
            <div className="flex flex-wrap gap-1">
              {c.lacks.slice(0, 2).map(s => <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>○ {s}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section divider ────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1" style={{ background: "#E8E8EF" }} />
      <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "#F7F7FB", color: "#6B7280", border: "1px solid #E8E8EF" }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "#E8E8EF" }} />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", height: 132 }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 104, borderRight: "1px solid #E8E8EF" }}>
        <div className="shimmer-bg rounded-full" style={{ width: 56, height: 56 }} />
      </div>
      <div className="flex-1 p-5 space-y-3">
        <div className="shimmer-bg rounded" style={{ width: 180, height: 14 }} />
        <div className="shimmer-bg rounded" style={{ width: 240, height: 11 }} />
        <div className="flex gap-2">
          {[64, 80, 56, 72].map((w, i) => <div key={i} className="shimmer-bg rounded-full" style={{ width: w, height: 20 }} />)}
        </div>
        <div className="shimmer-bg rounded" style={{ width: 320, height: 11 }} />
      </div>
      <div className="flex flex-col gap-2 p-5 flex-shrink-0" style={{ borderLeft: "1px solid #E8E8EF" }}>
        <div className="shimmer-bg rounded-lg" style={{ width: 84, height: 30 }} />
        <div className="shimmer-bg rounded-lg" style={{ width: 84, height: 30 }} />
      </div>
    </div>
  );
}

function EmptyApplicants({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: "80px 24px" }}>
      <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 56, height: 56, background: "#EEF0FF" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" />
        </svg>
      </div>
      <h3 className="text-[17px] font-semibold mb-2" style={{ color: "#0F1117" }}>
        {filtered ? "No candidates match these filters" : "No applicants yet"}
      </h3>
      <p className="text-[14px] mb-5" style={{ color: "#6B7280", maxWidth: 380, lineHeight: 1.6 }}>
        {filtered
          ? "Try widening the fit range or clearing a filter to see more of the people who applied."
          : "Students who apply to this role appear here, ranked by how well they fit."}
      </p>
      {filtered && (
        <button
          onClick={onReset}
          className="btn-press px-4 py-2.5 rounded-xl text-[13px] font-semibold border"
          style={{ background: "#FFFFFF", borderColor: "#4F46E5", color: "#4F46E5" }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function Applicants({ onNavigate, candidates, currentJob, onSelectCandidate, onStageChange }: Props) {
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);
  const [selectionCandidate, setSelectionCandidate] = useState<Candidate | null>(null);
  const [resumeCandidate, setResumeCandidate] = useState<Candidate | null>(null);
  const [view, setView] = useState<"list" | "compare">("list");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"fit" | "name" | "school">("fit");
  const [filterStage, setFilterStage] = useState("All");
  const [activeFilterChip, setActiveFilterChip] = useState<FilterKey | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [hasNoteOnly, setHasNoteOnly] = useState(false);

  // Option lists derived from the current candidate pool, so filters always offer real values.
  const skillOptions = [...new Set(candidates.flatMap(c => c.fits))].sort();
  const universityOptions = [...new Set(candidates.map(c => c.school))].sort();
  const gradYearOptions = [...new Set(candidates.map(c => c.gradYear))].sort();
  const workModeOf = (c: Candidate) => {
    const text = c.preferences.join(" ");
    if (/remote/i.test(text)) return "Remote";
    if (/hybrid/i.test(text)) return "Hybrid";
    if (/on-?site/i.test(text)) return "On-site";
    return null;
  };
  const availabilityOf = (c: Candidate) => (/part-?time/i.test(c.availability) ? "Part-time" : "Full-time");
  // Brief skeleton whenever the role changes, so the loading state is reachable in the demo.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, [currentJob.id]);

  const sorted = [...candidates]
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.school.toLowerCase().includes(q) || c.fits.some(f => f.toLowerCase().includes(q));
      const matchStage = filterStage === "All" || c.stage === filterStage;
      const matchNote = !hasNoteOnly || !!c.note;
      const matchSkill = !filters.skill || c.fits.includes(filters.skill);
      const matchAvailability = !filters.availability || availabilityOf(c) === filters.availability;
      const matchWorkMode = !filters.workMode || workModeOf(c) === filters.workMode;
      const matchUniversity = !filters.university || c.school === filters.university;
      const matchGradYear = !filters.gradYear || c.gradYear === filters.gradYear;
      const matchMinFit = filters.minFit === null || c.fitScore >= filters.minFit;
      return matchSearch && matchStage && matchNote && matchSkill && matchAvailability && matchWorkMode && matchUniversity && matchGradYear && matchMinFit;
    })
    .sort((a, b) => {
      if (sortBy === "name")   return a.name.localeCompare(b.name);
      if (sortBy === "school") return a.school.localeCompare(b.school);
      return b.fitScore - a.fitScore; // default: best fit first
    });

  const handleSelect = (id: string) => {
    const c = candidates.find(c => c.id === id);
    if (c && !c.selected) setSelectionCandidate(c);
  };

  const handleConfirmSelection = () => {
    if (selectionCandidate) {
      onSelectCandidate(selectionCandidate.id);
      onStageChange(selectionCandidate.id, "In Conversation");
      setSelectionCandidate(null);
      setTimeout(() => onNavigate("inbox"), 400);
    }
  };

  // Inject section dividers for list view
  const renderListWithDividers = () => {
    const els: React.ReactNode[] = [];
    let shownStrong = false;
    let shownAlso = false;

    sorted.forEach((c, i) => {
      const { label } = fitBand(c.fitScore);
      if (label === "Strong fit" && !shownStrong) {
        els.push(<Divider key="strong" label="Strong fits" />);
        shownStrong = true;
      } else if (label === "Stretch" && !shownAlso) {
        els.push(<Divider key="also" label="Also applied" />);
        shownAlso = true;
      }
      els.push(
        <CandidateCard
          key={c.id}
          candidate={c}
          onOpen={() => setDrawerCandidate(c)}
          onSelect={() => handleSelect(c.id)}
          onViewResume={() => setResumeCandidate(c)}
          delay={i * 0.05}
        />
      );
    });
    return els;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex-shrink-0" style={{ background: "#FFFFFF", borderBottom: "1px solid #E8E8EF" }}>
        {/* Top row */}
        <div className="flex items-center gap-3 px-7 py-3">
          <div className="flex items-center gap-2 pr-4" style={{ borderRight: "1px solid #E8E8EF" }}>
            <span className="text-[12px]" style={{ color: "#9CA3AF" }}>Role:</span>
            <span className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{currentJob.title}</span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF", width: 220 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search candidates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full"
              style={{ color: "#0F1117" }}
            />
          </div>

          {/* Stage filter */}
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="rounded-[10px] px-3 py-2 text-[13px] outline-none"
            style={{ background: "#F7F7FB", border: "1px solid #E8E8EF", color: "#374151" }}
          >
            {["All", "Applied", "Reviewed", "Selected", "In Conversation"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-[10px] px-3 py-2 text-[13px] outline-none"
            style={{ background: "#F7F7FB", border: "1px solid #E8E8EF", color: "#374151" }}
          >
            <option value="fit">Sort: Best fit</option>
            <option value="name">Sort: Name</option>
            <option value="school">Sort: School</option>
          </select>

          <div className="flex-1" />

          <span className="text-[12px]" style={{ color: "#9CA3AF" }}>{sorted.length} candidates</span>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
            {(["list", "compare"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 capitalize"
                style={{ background: view === v ? "#FFFFFF" : "transparent", color: view === v ? "#0F1117" : "#9CA3AF", boxShadow: view === v ? "0 1px 3px rgba(15,17,23,0.06)" : "none" }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips row. Wraps instead of scrolling — an overflow-x:auto row would force
            overflow-y to clip too (per spec, "visible" can't pair with a non-visible axis),
            which hides each chip's dropdown panel below it. */}
        <div className="flex items-center flex-wrap gap-2 px-7 pb-3">
          {FILTER_CHIPS.map(chip => {
            const activeValue: string | null =
              chip === "Skill" ? filters.skill :
              chip === "Availability" ? filters.availability :
              chip === "Work mode" ? filters.workMode :
              chip === "University" ? filters.university :
              chip === "Grad year" ? filters.gradYear :
              filters.minFit !== null ? `${filters.minFit}%+` : null;
            const isOpen = activeFilterChip === chip;
            const isSet = activeValue !== null;

            const options: { label: string; onSelect: () => void }[] =
              chip === "Skill" ? skillOptions.map(s => ({ label: s, onSelect: () => setFilters(f => ({ ...f, skill: s })) })) :
              chip === "Availability" ? ["Full-time", "Part-time"].map(s => ({ label: s, onSelect: () => setFilters(f => ({ ...f, availability: s })) })) :
              chip === "Work mode" ? ["Remote", "Hybrid", "On-site"].map(s => ({ label: s, onSelect: () => setFilters(f => ({ ...f, workMode: s })) })) :
              chip === "University" ? universityOptions.map(s => ({ label: s, onSelect: () => setFilters(f => ({ ...f, university: s })) })) :
              chip === "Grad year" ? gradYearOptions.map(s => ({ label: s, onSelect: () => setFilters(f => ({ ...f, gradYear: s })) })) :
              [90, 80, 70, 60].map(n => ({ label: `${n}%+`, onSelect: () => setFilters(f => ({ ...f, minFit: n })) }));

            const clearThis = () => setFilters(f => ({
              ...f,
              skill: chip === "Skill" ? null : f.skill,
              availability: chip === "Availability" ? null : f.availability,
              workMode: chip === "Work mode" ? null : f.workMode,
              university: chip === "University" ? null : f.university,
              gradYear: chip === "Grad year" ? null : f.gradYear,
              minFit: chip === "Min fit" ? null : f.minFit,
            }));

            return (
              <div key={chip} className="relative flex-shrink-0">
                <button
                  onClick={() => setActiveFilterChip(isOpen ? null : chip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: isSet || isOpen ? "#EEF0FF" : "#F7F7FB",
                    border: `1px solid ${isSet || isOpen ? "#4F46E5" : "#E8E8EF"}`,
                    color: isSet || isOpen ? "#4F46E5" : "#6B7280",
                  }}
                >
                  {isSet ? `${chip}: ${activeValue}` : chip}
                  {isSet ? (
                    <span
                      role="button"
                      aria-label={`Clear ${chip} filter`}
                      onClick={e => { e.stopPropagation(); clearThis(); }}
                      className="hover:opacity-70"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </span>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                  )}
                </button>

                {isOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 anim-scale-spring"
                    style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", minWidth: 160, maxHeight: 240, overflowY: "auto" }}
                  >
                    {options.length === 0 ? (
                      <div className="px-4 py-3 text-[12px]" style={{ color: "#9CA3AF" }}>No options</div>
                    ) : options.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => { opt.onSelect(); setActiveFilterChip(null); }}
                        className="w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors"
                        style={{ color: activeValue === opt.label ? "#4F46E5" : "#374151", background: activeValue === opt.label ? "#EEF0FF" : "transparent" }}
                        onMouseEnter={e => { if (activeValue !== opt.label) e.currentTarget.style.background = "#F7F7FB"; }}
                        onMouseLeave={e => { if (activeValue !== opt.label) e.currentTarget.style.background = "transparent"; }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Has note toggle */}
          <button
            onClick={() => setHasNoteOnly(h => !h)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium flex-shrink-0 transition-all duration-150"
            style={{
              background: hasNoteOnly ? "#EEF0FF" : "#F7F7FB",
              border: `1px solid ${hasNoteOnly ? "#4F46E5" : "#E8E8EF"}`,
              color: hasNoteOnly ? "#4F46E5" : "#6B7280",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill={hasNoteOnly ? "#4F46E5" : "#9CA3AF"}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
            Has note
          </button>
        </div>
      </div>

      {/* List / Compare */}
      <div className="flex-1 overflow-y-auto px-7 py-5">
        {loading ? (
          <div className="space-y-3 max-w-[920px]">
            {[0, 1, 2, 3].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyApplicants
            filtered={candidates.length > 0}
            onReset={() => { setSearch(""); setFilterStage("All"); setActiveFilterChip(null); setFilters(EMPTY_FILTERS); setHasNoteOnly(false); }}
          />
        ) : view === "list" ? (
          <div className="space-y-3 max-w-[920px]">
            {renderListWithDividers()}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 max-w-[1100px]">
            {sorted.slice(0, 4).map(c => (
              <CompareCard key={c.id} candidate={c} onOpen={() => setDrawerCandidate(c)} />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerCandidate && (
        <CandidateDrawer
          candidate={drawerCandidate}
          onClose={() => setDrawerCandidate(null)}
          onSelect={id => { handleSelect(id); setDrawerCandidate(null); }}
          onNotFit={id => { onStageChange(id, "Reviewed"); setDrawerCandidate(null); }}
          onViewResume={() => setResumeCandidate(drawerCandidate)}
        />
      )}

      {/* Resume viewer */}
      {resumeCandidate && (
        <ResumeViewerModal
          candidate={resumeCandidate}
          job={currentJob}
          onClose={() => setResumeCandidate(null)}
        />
      )}

      {/* Selection modal */}
      {selectionCandidate && (
        <SelectionModal
          candidate={selectionCandidate}
          onConfirm={handleConfirmSelection}
          onCancel={() => setSelectionCandidate(null)}
        />
      )}
    </div>
  );
}
