import { useState } from "react";
import { COMPANY } from "../data/mock";

interface Details {
  description: string;
  website: string;
  linkedin: string;
  founded: string;
  stage: string;
  industry: string;
  size: string;
  location: string;
}

const INITIAL_DETAILS: Details = {
  description:
    "TechNova builds the infrastructure layer that powers next-generation AI applications. Our platform enables Indian and global developers to ship AI features 10× faster with built-in reliability, security, and scale.",
  website: "technova.ai",
  linkedin: "linkedin.com/company/technova",
  founded: "2021, Bangalore",
  stage: "Series B",
  industry: COMPANY.industry,
  size: COMPANY.size,
  location: COMPANY.location,
};

const inputSty = { background: "#F7F7FB", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#0F1117", width: "100%", boxSizing: "border-box" as const };

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <div className="text-[12px] mb-1" style={{ color: "#9CA3AF" }}>{label}</div>
      {multiline ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} style={{ ...inputSty, resize: "vertical", fontFamily: "inherit" }} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputSty} />
      )}
    </div>
  );
}

export default function CompanyProfile() {
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState<Details>(INITIAL_DETAILS);
  const [draft, setDraft] = useState<Details>(INITIAL_DETAILS);
  const [justSaved, setJustSaved] = useState(false);

  const startEditing = () => { setDraft(details); setEditing(true); };
  const saveChanges = () => {
    setDetails(draft);
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };
  const cancelEditing = () => { setDraft(details); setEditing(false); };
  const set = (k: keyof Details) => (v: string) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div className="p-8 max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold" style={{ color: "#0F1117" }}>Company Profile</h2>
        <div className="flex items-center gap-3">
          {justSaved && (
            <span className="anim-fade-in text-[12px] font-medium flex items-center gap-1.5" style={{ color: "#15803D" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
              Saved
            </span>
          )}
          {editing && (
            <button
              onClick={cancelEditing}
              className="btn-press px-4 py-2 rounded-xl text-[13px] font-medium border"
              style={{ background: "#FFFFFF", borderColor: "#E8E8EF", color: "#6B7280" }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={editing ? saveChanges : startEditing}
            className="btn-press px-4 py-2 rounded-xl text-[13px] font-medium border"
            style={{ background: editing ? "#4F46E5" : "#F7F7FB", borderColor: editing ? "#4F46E5" : "#E8E8EF", color: editing ? "#FFFFFF" : "#374151" }}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="rounded-[20px] border p-6 anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}>
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ background: "#4F46E5" }}>T</div>
          <div className="flex-1 space-y-3">
            <div className="text-[18px] font-semibold" style={{ color: "#0F1117" }}>{COMPANY.name}</div>
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Industry" value={draft.industry} onChange={set("industry")} />
                <Field label="Company size" value={draft.size} onChange={set("size")} />
                <Field label="Location" value={draft.location} onChange={set("location")} />
              </div>
            ) : (
              <div className="text-[13px]" style={{ color: "#374151" }}>{details.industry} · {details.size} · {details.location}</div>
            )}
            {editing ? (
              <Field label="Description" value={draft.description} onChange={set("description")} multiline />
            ) : (
              <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{details.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 anim-fade-up" style={{ animationDelay: "0.1s" }}>
        {([
          { key: "website", label: "Website" },
          { key: "linkedin", label: "LinkedIn" },
          { key: "founded", label: "Founded" },
          { key: "stage", label: "Stage" },
        ] as { key: keyof Details; label: string }[]).map(item => (
          <div key={item.key} className="rounded-xl border p-4" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}>
            {editing ? (
              <Field label={item.label} value={draft[item.key]} onChange={set(item.key)} />
            ) : (
              <>
                <div className="text-[12px] mb-1" style={{ color: "#9CA3AF" }}>{item.label}</div>
                <div className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{details[item.key]}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
