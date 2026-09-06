import { useEffect, useState } from "react";
import type { Candidate } from "../data/candidates";
import FitScoreRing from "./FitScoreRing";
import CandidateAvatar from "./CandidateAvatar";

interface Props {
  candidate: Candidate;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNotFit: (id: string) => void;
  onViewResume?: () => void;
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 200); return () => clearTimeout(t); }, [value]);
  const color = value >= 85 ? "#16A34A" : value >= 70 ? "#4F46E5" : "#9CA3AF";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] w-24 flex-shrink-0" style={{ color: "#6B7280" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#E8E8EF" }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="text-[12px] w-7 text-right font-medium" style={{ color, fontFamily: "Inter" }}>{value}</span>
    </div>
  );
}

export default function CandidateDrawer({ candidate: c, onClose, onSelect, onNotFit, onViewResume }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 320); };

  return (
    <>
      <div className="fixed inset-0 z-40 overlay-backdrop" style={{ background: "rgba(15,17,23,0.3)" }} onClick={close} />
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: 600,
          background: "#FFFFFF",
          borderLeft: "1px solid #E8E8EF",
          boxShadow: "-8px 0 32px rgba(15,17,23,0.10)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.34s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF" }}>
          <span className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>Candidate Profile</span>
          <button onClick={close} className="p-2 rounded-lg transition-colors" style={{ color: "#6B7280" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="flex items-start gap-4">
              <CandidateAvatar initials={c.initials} color={c.avatarColor} photoUrl={c.photoUrl} size={48} radius={12} fontSize={14} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold" style={{ color: "#0F1117" }}>{c.name}</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#F7F7FB", color: "#9CA3AF" }}>#{c.rank}</span>
                </div>
                <div className="text-[13px] mt-0.5" style={{ color: "#374151" }}>{c.degree}</div>
                <div className="text-[12px] mt-0.5" style={{ color: "#6B7280" }}>{c.school} · Class of {c.gradYear}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[12px]" style={{ color: "#9CA3AF" }}>📍 {c.location}</span>
                  <span className="text-[12px]" style={{ color: "#9CA3AF" }}>GPA {c.gpa}</span>
                </div>
              </div>
              <FitScoreRing score={c.fitScore} size={72} strokeWidth={4} />
            </div>

            {/* Student Note */}
            {c.note && (
              <div className="mt-4 rounded-xl p-4" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
                <div className="flex items-start gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                  </svg>
                  <p className="text-[13px] leading-relaxed italic" style={{ color: "#374151" }}>{c.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Fit Breakdown */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Fit Breakdown</div>
            <div className="space-y-2.5">
              <BreakdownBar label="Skills" value={c.fitBreakdown.skills} />
              <BreakdownBar label="Experience" value={c.fitBreakdown.experience} />
              <BreakdownBar label="Interests" value={c.fitBreakdown.interests} />
              <BreakdownBar label="Preferences" value={c.fitBreakdown.preferences} />
            </div>
          </div>

          {/* AI Explanation */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>AI Analysis</div>
            <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(108,92,231,0.06), rgba(167,139,250,0.06))", border: "1px solid rgba(79,70,229,0.15)" }}>
              <div className="flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <p className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>{c.aiExplain}</p>
              </div>
            </div>
          </div>

          {/* What they bring */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>What They Bring</div>
            <div className="space-y-3">
              {c.fitDetails.map(fd => (
                <div key={fd.skill} className="flex items-start gap-3">
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "#DCFCE7", color: "#15803D" }}>
                    ✓ {fd.skill}
                  </span>
                  <p className="text-[12px] leading-relaxed pt-0.5" style={{ color: "#6B7280" }}>{fd.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What they lack */}
          {c.lackDetails.length > 0 && (
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>What They Lack</div>
              <div className="space-y-3">
                {c.lackDetails.map(ld => (
                  <div key={ld.skill} className="flex items-start gap-3">
                    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>
                      ○ {ld.skill}
                    </span>
                    <p className="text-[12px] leading-relaxed pt-0.5" style={{ color: "#6B7280" }}>{ld.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume AI Summary */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Resume Summary · AI</div>
            <p className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>{c.resumeSummary}</p>
          </div>

          {/* Resume File Card */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Resume</div>
            <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
              <div className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#DC2626" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{c.resumeFile}</div>
                <div className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>PDF · Resume</div>
              </div>
              <button onClick={onViewResume} className="btn-press text-[12px] font-semibold px-3 py-2 rounded-lg" style={{ background: "#EEF0FF", color: "#4F46E5" }}>
                View PDF ↗
              </button>
            </div>
          </div>

          {/* Projects */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Projects</div>
            <div className="space-y-3">
              {c.projects.map((p, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
                  <div className="text-[13px] font-semibold mb-1" style={{ color: "#0F1117" }}>{p.name}</div>
                  <div className="text-[12px] leading-relaxed mb-2" style={{ color: "#6B7280" }}>{p.description}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map(t => <span key={t} className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "#E8E8EF", color: "#374151" }}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          {c.experience.length > 0 && (
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Experience</div>
              <div className="space-y-4">
                {c.experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{e.role}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: "#374151" }}>{e.company}</div>
                      </div>
                      <div className="text-[12px]" style={{ color: "#9CA3AF" }}>{e.duration}</div>
                    </div>
                    <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "#6B7280" }}>{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="px-6 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Availability & Preferences</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <span className="text-[13px]" style={{ color: "#374151" }}>{c.availability}</span>
              </div>
              {c.preferences.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  <span className="text-[13px]" style={{ color: "#374151" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #E8E8EF" }}>
          <p className="px-6 pt-3 pb-1 text-[12px] text-center" style={{ color: "#9CA3AF" }}>
            Selecting notifies the candidate and opens a conversation.
          </p>
          <div className="flex items-center gap-3 px-6 pb-4">
            <button
              onClick={() => { onNotFit(c.id); close(); }}
              className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150"
              style={{ background: "#FFFFFF", border: "1px solid #DC2626", color: "#DC2626" }}
            >
              Not a Fit
            </button>
            <button
              onClick={close}
              className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#F59E0B" }}
            >
              ★ Save for Later
            </button>
            {!c.selected ? (
              <button
                onClick={() => { onSelect(c.id); close(); }}
                className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
              >
                Select Candidate
              </button>
            ) : (
              <div className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-center" style={{ background: "#DCFCE7", color: "#15803D" }}>
                ✓ Selected
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
