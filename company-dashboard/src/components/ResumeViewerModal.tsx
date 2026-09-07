import { useState } from "react";
import type { Candidate, Job } from "../data/mock";

interface Props {
  candidate: Candidate;
  job: Job;
  onClose: () => void;
}

const REQ_SKILLS = ["React", "TypeScript", "Figma", "Design Systems"];
const PREF_SKILLS = ["GraphQL", "Storybook", "Web Performance", "Node.js"];

function ResumePageMock({ candidate }: { candidate: Candidate }) {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: "40px 48px", background: "#FFFFFF", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #0F1117", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1117" }}>{candidate.name}</div>
        <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>{candidate.school} · {candidate.degree} · Class of {candidate.gradYear}</div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, display: "flex", gap: 16 }}>
          <span>📧 {candidate.name.toLowerCase().replace(" ", ".")}@student.edu</span>
          <span>📱 +91 98765 43210</span>
          <span>📍 {candidate.location}</span>
          <span>💼 github.com/{candidate.name.toLowerCase().replace(" ", "")}</span>
        </div>
      </div>

      {/* GPA */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Academic</div>
        <div style={{ fontSize: 13, color: "#374151" }}>GPA: {candidate.gpa} · {candidate.year}</div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[...candidate.fits, ...candidate.lacks].map(s => (
            <span key={s} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#F7F7FB", border: "1px solid #E8E8EF", color: "#374151" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Experience</div>
        {candidate.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1117" }}>{exp.role}</span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{exp.duration}</span>
            </div>
            <div style={{ fontSize: 12, color: "#4F46E5", marginBottom: 4 }}>{exp.company}</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{exp.description}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Projects</div>
        {candidate.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117", marginBottom: 2 }}>{proj.name}</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>{proj.description}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {proj.tech.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EEF0FF", color: "#4F46E5" }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Education</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1117" }}>{candidate.school}</div>
        <div style={{ fontSize: 12, color: "#374151" }}>{candidate.degree} · Class of {candidate.gradYear} · GPA {candidate.gpa}</div>
      </div>
    </div>
  );
}

/** Build a standalone, printable HTML résumé from the candidate data and hand
 *  the browser a real file to save. */
function downloadResume(c: Candidate) {
  const esc = (s: string) => s.replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]!));
  const section = (title: string, body: string) =>
    `<h2 style="font:600 11px/1 Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#9CA3AF;margin:22px 0 8px">${title}</h2>${body}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.name)} — Résumé</title></head>
<body style="font:13px/1.6 Inter,Arial,sans-serif;color:#374151;max-width:760px;margin:40px auto;padding:0 24px">
  <div style="border-bottom:2px solid #0F1117;padding-bottom:14px">
    <div style="font:700 22px Inter,Arial,sans-serif;color:#0F1117">${esc(c.name)}</div>
    <div style="margin-top:4px;color:#6B7280">${esc(c.school)} · ${esc(c.degree)} · Class of ${esc(c.gradYear)}${c.gpa ? ` · GPA ${esc(c.gpa)}` : ""}</div>
    <div style="margin-top:2px;color:#6B7280">${esc(c.location)}${c.githubUrl ? ` · ${esc(c.githubUrl)}` : ""}${c.portfolioUrl ? ` · ${esc(c.portfolioUrl)}` : ""}</div>
  </div>
  ${section("Skills", `<div>${[...c.fits, ...c.lacks].map(esc).join(" · ") || "—"}</div>`)}
  ${c.experience.length ? section("Experience", c.experience.map((e) => `<div style="margin-bottom:12px"><strong style="color:#0F1117">${esc(e.role)}</strong> — ${esc(e.company)} <span style="color:#9CA3AF">(${esc(e.duration)})</span><div>${esc(e.description)}</div></div>`).join("")) : ""}
  ${c.projects.length ? section("Projects", c.projects.map((p) => `<div style="margin-bottom:12px"><strong style="color:#0F1117">${esc(p.name)}</strong><div>${esc(p.description)}</div><div style="color:#4F46E5">${p.tech.map(esc).join(" · ")}</div></div>`).join("")) : ""}
  ${section("Availability", `<div>${esc(c.availability)}${c.preferences.length ? ` · ${c.preferences.map(esc).join(" · ")}` : ""}</div>`)}
  ${c.note ? section("Note to the team", `<div style="font-style:italic">"${esc(c.note)}"</div>`) : ""}
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.name.replace(/\s+/g, "_")}_Resume.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ResumeViewerModal({ candidate, job, onClose }: Props) {
  const [zoom, setZoom] = useState(100);
  const [downloaded, setDownloaded] = useState(false);
  const fitsSet = new Set(candidate.fits);
  const lacksSet = new Set(candidate.lacks);

  const checkSkill = (skill: string): "fit" | "lack" | "unknown" => {
    if (fitsSet.has(skill)) return "fit";
    if (lacksSet.has(skill)) return "lack";
    return "unknown";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,17,23,0.5)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          width: "min(1200px, 95vw)",
          height: "min(860px, 92vh)",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(15,17,23,0.25)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #E8E8EF" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0"
              style={{ background: "#EEF0FF", color: "#4F46E5" }}
            >
              {candidate.initials}
            </div>
            <div>
              <div className="text-[15px] font-semibold" style={{ color: "#0F1117" }}>{candidate.name}</div>
              <div className="text-[12px]" style={{ color: "#6B7280" }}>{candidate.resumeFile}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { downloadResume(candidate); setDownloaded(true); setTimeout(() => setDownloaded(false), 2500); }}
              className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium border"
              style={{ background: downloaded ? "#DCFCE7" : "#F7F7FB", borderColor: downloaded ? "#86EFAC" : "#E8E8EF", color: downloaded ? "#15803D" : "#374151", cursor: "pointer" }}
            >
              {downloaded ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              )}
              {downloaded ? "Saved" : "Download"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#F7F7FB", color: "#6B7280" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#E8E8EF")}
              onMouseLeave={e => (e.currentTarget.style.background = "#F7F7FB")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF viewer — 65% */}
          <div className="flex flex-col overflow-hidden" style={{ flex: "0 0 65%", borderRight: "1px solid #E8E8EF" }}>
            {/* Page controls */}
            <div
              className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
              style={{ background: "#F7F7FB", borderBottom: "1px solid #E8E8EF" }}
            >
              <div className="flex items-center gap-3">
                {/* One-page resume, so both arrows are genuinely disabled rather than dead. */}
                <button disabled aria-label="Previous page" className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", color: "#9CA3AF", cursor: "not-allowed" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span className="text-[12px]" style={{ color: "#374151" }}>Page <strong>1</strong> of 1</span>
                <button disabled aria-label="Next page" className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", color: "#9CA3AF", cursor: "not-allowed" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(z => Math.min(200, z + 25))}
                  disabled={zoom >= 200}
                  aria-label="Zoom in"
                  className="btn-press w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", color: zoom >= 200 ? "#9CA3AF" : "#6B7280", cursor: zoom >= 200 ? "not-allowed" : "pointer" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                </button>
                <span className="text-[12px] tabular-nums" style={{ color: "#374151", minWidth: 36, textAlign: "center" }}>{zoom}%</span>
                <button
                  onClick={() => setZoom(z => Math.max(50, z - 25))}
                  disabled={zoom <= 50}
                  aria-label="Zoom out"
                  className="btn-press w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", color: zoom <= 50 ? "#9CA3AF" : "#6B7280", cursor: zoom <= 50 ? "not-allowed" : "pointer" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
                </button>
              </div>
            </div>

            {/* Page content */}
            <div
              className="flex-1 overflow-auto p-6"
              style={{ background: "#e5e7eb" }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 680,
                  margin: "0 auto",
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.18s ease",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <ResumePageMock candidate={candidate} />
              </div>
            </div>
          </div>

          {/* Requirements rail — 35% */}
          <div className="flex flex-col overflow-hidden" style={{ flex: "0 0 35%" }}>
            <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <div className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Role requirements</div>
              <div className="text-[12px] mt-0.5" style={{ color: "#6B7280" }}>{job.title}</div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Required */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.06em" }}>Required</div>
                <div className="space-y-2">
                  {[...REQ_SKILLS, ...job.requiredSkills.filter(s => !REQ_SKILLS.includes(s))].slice(0, 6).map(skill => {
                    const status = checkSkill(skill);
                    return (
                      <div key={skill} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{
                        background: status === "fit" ? "#DCFCE7" : status === "lack" ? "#FFEDD5" : "#F7F7FB",
                        border: `1px solid ${status === "fit" ? "#86EFAC" : status === "lack" ? "#FED7AA" : "#E8E8EF"}`,
                      }}>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                          style={{ background: status === "fit" ? "#16A34A" : status === "lack" ? "#FFFFFF" : "#F7F7FB", color: status === "fit" ? "#FFFFFF" : "#EA580C", border: status === "lack" ? "1.5px solid #EA580C" : "none" }}
                        >
                          {status === "fit" ? "✓" : status === "lack" ? "○" : "?"}
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: status === "fit" ? "#15803D" : status === "lack" ? "#EA580C" : "#374151" }}>{skill}</span>
                        <span className="ml-auto text-[11px]" style={{ color: status === "fit" ? "#16A34A" : status === "lack" ? "#EA580C" : "#9CA3AF" }}>
                          {status === "fit" ? "Has this" : status === "lack" ? "Missing" : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#9CA3AF", letterSpacing: "0.06em" }}>Preferred</div>
                <div className="space-y-2">
                  {[...PREF_SKILLS, ...job.preferredSkills.filter(s => !PREF_SKILLS.includes(s))].slice(0, 5).map(skill => {
                    const status = checkSkill(skill);
                    return (
                      <div key={skill} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{
                        background: status === "fit" ? "#DCFCE7" : status === "lack" ? "#FFEDD5" : "#F7F7FB",
                        border: `1px solid ${status === "fit" ? "#86EFAC" : status === "lack" ? "#FED7AA" : "#E8E8EF"}`,
                      }}>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                          style={{ background: status === "fit" ? "#16A34A" : "#FFFFFF", color: status === "fit" ? "#FFFFFF" : "#EA580C", border: status !== "fit" ? "1.5px solid #EA580C" : "none" }}
                        >
                          {status === "fit" ? "✓" : "○"}
                        </div>
                        <span className="text-[13px]" style={{ color: status === "fit" ? "#15803D" : "#EA580C" }}>{skill}</span>
                        <span className="ml-auto text-[11px]" style={{ color: "#9CA3AF" }}>Preferred</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl p-4" style={{ background: "#EEF0FF", border: "1px solid #E8E8EF" }}>
                <div className="text-[12px] font-medium mb-1" style={{ color: "#4F46E5" }}>AI summary</div>
                <div className="text-[12px] leading-relaxed" style={{ color: "#374151" }}>{candidate.resumeSummary}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
