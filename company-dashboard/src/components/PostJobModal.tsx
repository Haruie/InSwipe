import { useState } from "react";
import type { Job } from "../data/mock";

interface Props { onClose: () => void; onCreate?: (job: Job) => void; }

const STEPS = ["Role Basics", "Requirements", "Logistics", "Review & Publish"];

const SKILL_OPTIONS = ["React", "TypeScript", "JavaScript", "Python", "Figma", "Node.js", "Vue.js", "GraphQL", "CSS", "Tailwind CSS", "Testing", "Git", "REST APIs", "SQL", "AWS", "Docker", "UX Research", "Accessibility"];

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 220 }}>
      {/* Phone shell */}
      <div className="relative rounded-[32px] overflow-hidden" style={{ background: "#1A1A2E", padding: "12px 8px", boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
        {/* Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full z-10" style={{ background: "#1A1A2E" }} />
        {/* Screen */}
        <div className="rounded-[24px] overflow-hidden" style={{ background: "#F7F7FB", minHeight: 380 }}>
          <div className="pt-6 px-0 pb-2">
            {children}
          </div>
        </div>
        {/* Home bar */}
        <div className="flex justify-center mt-3">
          <div className="w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
        </div>
      </div>
    </div>
  );
}

function StudentCard({ form }: { form: any }) {
  const hasRequired = form.requiredSkills.length > 0;
  const studFits = form.requiredSkills.slice(0, 3);
  const studLacks = form.preferredSkills.slice(0, 2);

  return (
    <div className="mx-2 rounded-[20px] overflow-hidden" style={{ background: "#FFFFFF", boxShadow: "0 4px 12px rgba(15,17,23,0.08)", border: "1px solid #E8E8EF" }}>
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 relative">
        {/* 92% fit pill */}
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: "#DCFCE7", color: "#15803D" }}>
          92% fit
        </div>
        {/* Company */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "#4F46E5" }}>T</div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "#0F1117" }}>TechNova</div>
            <div className="text-[10px]" style={{ color: "#9CA3AF" }}>AI Infrastructure</div>
          </div>
        </div>
        <h4 className="text-[13px] font-bold mb-1 pr-16" style={{ color: "#0F1117" }}>{form.title || "Role Title"}</h4>
        <div className="flex flex-wrap gap-1 mb-2">
          {form.location && <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{form.location}</span>}
          {form.stipend && <span className="text-[10px] font-semibold" style={{ color: "#4F46E5" }}>· {form.stipend}</span>}
        </div>
      </div>

      {/* Skills */}
      {(studFits.length > 0 || studLacks.length > 0) && (
        <div className="px-4 pb-4 space-y-2">
          {studFits.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold mb-1" style={{ color: "#15803D" }}>You have:</div>
              <div className="flex flex-wrap gap-1">
                {studFits.map((s: string) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#DCFCE7", color: "#15803D" }}>✓ {s}</span>)}
              </div>
            </div>
          )}
          {studLacks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold mb-1" style={{ color: "#EA580C" }}>To learn:</div>
              <div className="flex flex-wrap gap-1">
                {studLacks.map((s: string) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>○ {s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <div className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-center" style={{ background: "#F7F7FB", color: "#9CA3AF", border: "1px solid #E8E8EF" }}>Pass</div>
          <div className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-center text-white" style={{ background: "#4F46E5" }}>Apply →</div>
        </div>
      </div>
    </div>
  );
}

function formatDeadline(iso: string): string {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostJobModal({ onClose, onCreate }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: "", department: "", description: "", requiredSkills: [] as string[], preferredSkills: [] as string[], location: "", type: "Hybrid", duration: "", stipend: "", deadline: "" });
  const [published, setPublished] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleSkill = (skill: string, type: "req" | "pref") => {
    if (type === "req") set("requiredSkills", form.requiredSkills.includes(skill) ? form.requiredSkills.filter(s => s !== skill) : [...form.requiredSkills, skill]);
    else set("preferredSkills", form.preferredSkills.includes(skill) ? form.preferredSkills.filter(s => s !== skill) : [...form.preferredSkills, skill]);
  };

  const canPublish = form.title.trim().length > 1;

  const publish = () => {
    if (!canPublish) return;
    const job: Job = {
      id: `j-${Date.now()}`,
      title: form.title.trim(),
      department: form.department || "General",
      location: `${form.location || "Remote"}${form.type ? ` · ${form.type}` : ""}`,
      type: form.duration || "Internship",
      status: "Active",
      applicants: 0,
      selected: 0,
      conversations: 0,
      posted: "Just now",
      deadline: formatDeadline(form.deadline),
      requiredSkills: form.requiredSkills,
      preferredSkills: form.preferredSkills,
      description: form.description || "No description added yet.",
      stipend: form.stipend || "Unpaid",
    };
    setPublished(true);
    setTimeout(() => { onCreate?.(job); onClose(); }, 1400);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all duration-200";
  const inputSty = { background: "#F7F7FB", border: "1px solid #E8E8EF", color: "#0F1117" };

  if (published) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop" style={{ background: "rgba(15,17,23,0.5)" }}>
      <div className="flex flex-col items-center gap-4 text-center anim-success">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #4F46E5, #16A34A)", boxShadow: "0 8px 24px rgba(79,70,229,0.3)" }}>✓</div>
        <div className="text-[20px] font-semibold" style={{ color: "#FFFFFF" }}>Job Published!</div>
        <div className="text-[14px]" style={{ color: "rgba(255,255,255,0.7)" }}>Students will start discovering it now.</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop" style={{ background: "rgba(15,17,23,0.5)", backdropFilter: "blur(4px)" }}>
      <div
        className="anim-scale-spring flex rounded-[28px] overflow-hidden"
        style={{ width: 940, height: 660, maxHeight: "90vh", background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)" }}
      >
        {/* Left: form */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div>
              <h2 className="text-[16px] font-semibold" style={{ color: "#0F1117" }}>Post a Job</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: "#9CA3AF" }} onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Progress steps */}
          <div className="flex flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF" }}>
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i <= step && setStep(i)}
                className="flex-1 py-3 text-[12px] font-medium transition-all duration-200 relative"
                style={{ color: i === step ? "#4F46E5" : i < step ? "#16A34A" : "#9CA3AF" }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: i < step ? "#DCFCE7" : i === step ? "#EEF0FF" : "#F7F7FB", color: i < step ? "#15803D" : i === step ? "#4F46E5" : "#9CA3AF" }}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i === step && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#4F46E5" }} />}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {step === 0 && (
              <div className="space-y-5 anim-fade-up">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Job Title *</label>
                  <input type="text" placeholder="e.g. Frontend Engineering Intern" value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} style={inputSty} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Department</label>
                  <select value={form.department} onChange={e => set("department", e.target.value)} className={inputCls} style={inputSty}>
                    <option value="">Select department</option>
                    {["Engineering", "Design", "Marketing", "Product", "Data Science", "Operations"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Description</label>
                  <textarea rows={5} placeholder="What will this intern work on? What will they learn?" value={form.description} onChange={e => set("description", e.target.value)} className={inputCls + " resize-none"} style={inputSty} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 anim-fade-up">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>Required Skills</label>
                    <span className="text-[12px]" style={{ color: "#9CA3AF" }}>Must-haves · marked green for students</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.requiredSkills.map(s => (
                      <span key={s} onClick={() => toggleSkill(s, "req")} className="chip-selected text-[12px] px-3 py-1.5 rounded-full cursor-pointer font-medium" style={{ background: "#DCFCE7", color: "#15803D" }}>{s} ✕</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.filter(s => !form.requiredSkills.includes(s) && !form.preferredSkills.includes(s)).map(s => (
                      <span key={s} onClick={() => toggleSkill(s, "req")} className="text-[12px] px-3 py-1.5 rounded-full cursor-pointer border transition-all duration-150" style={{ background: "#F7F7FB", color: "#6B7280", borderColor: "#E8E8EF" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4F46E5"; (e.currentTarget as HTMLElement).style.color = "#4F46E5"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8EF"; (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
                      >+ {s}</span>
                    ))}
                  </div>
                </div>
                <div className="h-px" style={{ background: "#E8E8EF" }} />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>Preferred Skills</label>
                    <span className="text-[12px]" style={{ color: "#9CA3AF" }}>Nice-to-have · shown as orange gaps for students</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.preferredSkills.map(s => (
                      <span key={s} onClick={() => toggleSkill(s, "pref")} className="chip-selected text-[12px] px-3 py-1.5 rounded-full cursor-pointer font-medium" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>○ {s} ✕</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.filter(s => !form.requiredSkills.includes(s) && !form.preferredSkills.includes(s)).map(s => (
                      <span key={s} onClick={() => toggleSkill(s, "pref")} className="text-[12px] px-3 py-1.5 rounded-full cursor-pointer border transition-all duration-150" style={{ background: "#F7F7FB", color: "#6B7280", borderColor: "#E8E8EF" }}>+ {s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 anim-fade-up">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Location</label>
                    <input type="text" placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} style={inputSty} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Work Type</label>
                    <div className="flex gap-2">
                      {["On-site", "Hybrid", "Remote"].map(t => (
                        <button key={t} onClick={() => set("type", t)} className="flex-1 py-3 rounded-xl text-[12px] font-medium border transition-all duration-150"
                          style={{ background: form.type === t ? "#EEF0FF" : "#F7F7FB", borderColor: form.type === t ? "#4F46E5" : "#E8E8EF", color: form.type === t ? "#4F46E5" : "#6B7280" }}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Duration</label>
                    <input type="text" placeholder="e.g. 10 weeks, Full-time" value={form.duration} onChange={e => set("duration", e.target.value)} className={inputCls} style={inputSty} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Stipend</label>
                    <input type="text" placeholder="e.g. ₹35,000/month" value={form.stipend} onChange={e => set("stipend", e.target.value)} className={inputCls} style={inputSty} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "#374151" }}>Application Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className={inputCls} style={inputSty} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 anim-fade-up">
                <div className="rounded-2xl p-5 border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF" }}>
                  <h3 className="text-[14px] font-semibold mb-1" style={{ color: "#0F1117" }}>{form.title || "Untitled Role"}</h3>
                  <div className="text-[12px] mb-3" style={{ color: "#9CA3AF" }}>{form.department} · {form.type} · {form.location}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{form.description || "No description added."}</p>
                </div>
                <div className="rounded-2xl p-5 border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF" }}>
                  <div className="text-[11px] font-semibold mb-2" style={{ color: "#9CA3AF" }}>REQUIRED SKILLS</div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {form.requiredSkills.length > 0 ? form.requiredSkills.map(s => <span key={s} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "#DCFCE7", color: "#15803D" }}>{s}</span>) : <span className="text-[12px]" style={{ color: "#9CA3AF" }}>None</span>}
                  </div>
                  <div className="text-[11px] font-semibold mb-2" style={{ color: "#9CA3AF" }}>PREFERRED SKILLS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.preferredSkills.length > 0 ? form.preferredSkills.map(s => <span key={s} className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>{s}</span>) : <span className="text-[12px]" style={{ color: "#9CA3AF" }}>None</span>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "Stipend", value: form.stipend || "—" }, { label: "Duration", value: form.duration || "—" }, { label: "Deadline", value: form.deadline || "—" }].map(item => (
                    <div key={item.label} className="rounded-xl p-4 border text-center" style={{ background: "#F7F7FB", borderColor: "#E8E8EF" }}>
                      <div className="text-[12px]" style={{ color: "#9CA3AF" }}>{item.label}</div>
                      <div className="text-[13px] font-medium mt-1" style={{ color: "#0F1117" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderTop: "1px solid #E8E8EF" }}>
            <button onClick={() => step > 0 && setStep(s => s - 1)} className="btn-press px-5 py-2.5 rounded-xl text-[13px] font-medium border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280", opacity: step === 0 ? 0.4 : 1, pointerEvents: step === 0 ? "none" : "auto" }}>
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-press px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}>
                Continue →
              </button>
            ) : (
              <button onClick={publish} disabled={!canPublish} className="btn-press flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#16A34A", boxShadow: "0 4px 12px rgba(22,163,74,0.28)", opacity: canPublish ? 1 : 0.5, cursor: canPublish ? "pointer" : "not-allowed" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                Publish Job
              </button>
            )}
          </div>
        </div>

        {/* Right: Phone preview */}
        <div className="flex flex-col flex-shrink-0" style={{ width: 280, background: "#F7F7FB", borderLeft: "1px solid #E8E8EF" }}>
          <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Student Preview</div>
            <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>How students see this on InSwipe</p>
          </div>
          <div className="flex-1 flex items-start justify-center pt-6 px-4 overflow-y-auto">
            <PhoneFrame>
              {/* Keyed on step so the card visibly refreshes — not just re-renders silently —
                  each time the recruiter finishes a step and the preview has new data to show. */}
              <div key={step} className="anim-fade-up">
                <StudentCard form={form} />
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
