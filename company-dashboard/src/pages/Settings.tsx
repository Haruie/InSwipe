import { useState } from "react";

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(o => !o)} className="btn-press w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200" style={{ background: on ? "#4F46E5" : "#E8E8EF" }}>
      <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200" style={{ left: on ? "calc(100% - 18px)" : 2 }} />
    </div>
  );
}

/* ─── Team ───────────────────────────────────────────────────────────────── */

type Role = "Admin" | "Recruiter" | "Hiring Manager";
const ROLES: Role[] = ["Admin", "Recruiter", "Hiring Manager"];

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  status: "Active" | "Pending";
  isYou?: boolean;
}

const INITIAL_TEAM: TeamMember[] = [
  { id: "t1", name: "Priya Sharma", initials: "PS", email: "priya@technova.ai", role: "Admin", status: "Active", isYou: true },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function RoleBadge({ role }: { role: Role }) {
  const color = role === "Admin" ? "#4F46E5" : role === "Recruiter" ? "#15803D" : "#EA580C";
  const bg = role === "Admin" ? "#EEF0FF" : role === "Recruiter" ? "#DCFCE7" : "#FFEDD5";
  return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{role}</span>;
}

function InviteModal({ onInvite, onClose }: { onInvite: (name: string, email: string, role: Role) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Recruiter");
  const canSubmit = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  const inputSty = { background: "#F7F7FB", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#0F1117", width: "100%", boxSizing: "border-box" as const };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop" style={{ background: "rgba(15,17,23,0.5)", backdropFilter: "blur(4px)" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {/* max-height + overflow-y-auto so a short viewport scrolls the form instead of
          clipping the submit button below the fold. */}
      <div className="anim-scale-spring rounded-[24px] p-7 w-[420px] mx-4 overflow-y-auto" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }}>
        <h3 className="text-[16px] font-semibold mb-1" style={{ color: "#0F1117" }}>Invite a team member</h3>
        <p className="text-[13px] mb-5" style={{ color: "#9CA3AF" }}>They'll get access to jobs, applicants and conversations.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Verma" style={inputSty} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Work email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@technova.ai" style={inputSty} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Role</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all duration-150"
                  style={{ background: role === r ? "#EEF0FF" : "#F7F7FB", borderColor: role === r ? "#4F46E5" : "#E8E8EF", color: role === r ? "#4F46E5" : "#6B7280" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-medium border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280" }}>
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onInvite(name.trim(), email.trim(), role)}
            disabled={!canSubmit}
            className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity"
            style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
          >
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  // The menu always opened downward, so on a row near the bottom of the screen (the last
  // member, or any row once the list grows) it ran out of room and got clipped by the
  // viewport edge. Decide the direction from the actual space left when it's opened.
  const [menuDirection, setMenuDirection] = useState<"down" | "up">("down");
  const [justInvited, setJustInvited] = useState<string | null>(null);

  const MENU_EST_HEIGHT = 260;
  const toggleMenu = (id: string, anchor: HTMLElement) => {
    if (menuOpenId === id) { setMenuOpenId(null); return; }
    const spaceBelow = window.innerHeight - anchor.getBoundingClientRect().bottom;
    setMenuDirection(spaceBelow < MENU_EST_HEIGHT ? "up" : "down");
    setMenuOpenId(id);
  };

  const handleInvite = (name: string, email: string, role: Role) => {
    const id = `t${Date.now()}`;
    setTeam(prev => [...prev, { id, name, initials: initialsOf(name), email, role, status: "Pending" }]);
    setInviteOpen(false);
    setJustInvited(name);
    setTimeout(() => setJustInvited(null), 3000);
  };

  const changeRole = (id: string, role: Role) => setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  const resend = (id: string) => { setMenuOpenId(null); const m = team.find(t => t.id === id); if (m) { setJustInvited(m.name); setTimeout(() => setJustInvited(null), 3000); } };
  const remove = (id: string) => { setTeam(prev => prev.filter(m => m.id !== id)); setMenuOpenId(null); };

  return (
    // The invite modal is a sibling of (not nested inside) the anim-fade-up card: that
    // animation's `both` fill-mode leaves a non-"none" transform on the card after it
    // finishes, which makes the card a containing block for position:fixed descendants —
    // a nested "fixed inset-0" overlay would then be sized to the card's small box
    // instead of the real viewport, clipping the modal instead of centering it on screen.
    <>
    <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: "0.08s" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Team</h3>
          <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{team.length} member{team.length !== 1 ? "s" : ""} with access to TechNova's hiring</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white"
          style={{ background: "#4F46E5" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add team member
        </button>
      </div>

      <div>
        {team.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-6 py-4 transition-colors relative"
            style={{ borderBottom: i < team.length - 1 ? "1px solid #E8E8EF" : "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: "#EEF0FF", color: "#4F46E5" }}>{m.initials}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{m.name}</span>
                {m.isYou && <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "#F7F7FB", color: "#9CA3AF" }}>You</span>}
                {m.status === "Pending" && <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#92400E" }}>Pending</span>}
              </div>
              <div className="text-[12px] mt-0.5 truncate" style={{ color: "#9CA3AF" }}>{m.email}</div>
            </div>
            <RoleBadge role={m.role} />

            {!m.isYou && (
              <div className="relative">
                <button
                  onClick={e => toggleMenu(m.id, e.currentTarget)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#9CA3AF" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                {menuOpenId === m.id && (
                  <div
                    className={`absolute right-0 w-44 rounded-xl overflow-hidden z-10 anim-scale-spring ${menuDirection === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
                    style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)" }}
                  >
                    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Change role</div>
                    {ROLES.map(r => (
                      <button
                        key={r}
                        onClick={() => { changeRole(m.id, r); setMenuOpenId(null); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-[13px] text-left transition-colors"
                        style={{ color: m.role === r ? "#4F46E5" : "#374151" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {r} {m.role === r && "✓"}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid #E8E8EF" }} />
                    {m.status === "Pending" && (
                      <button
                        onClick={() => resend(m.id)}
                        className="w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors"
                        style={{ color: "#374151" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        Resend invite
                      </button>
                    )}
                    <button
                      onClick={() => remove(m.id)}
                      className="w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors"
                      style={{ color: "#DC2626" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      Remove from team
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {justInvited && (
        <div className="px-6 py-3 flex items-center gap-2 anim-fade-in" style={{ borderTop: "1px solid #E8E8EF", background: "#F0FDF4" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span className="text-[12px] font-medium" style={{ color: "#15803D" }}>Invite sent to {justInvited}</span>
        </div>
      )}
    </div>

    {inviteOpen && <InviteModal onInvite={handleInvite} onClose={() => setInviteOpen(false)} />}
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Settings() {
  return (
    <div className="p-8 max-w-[700px] mx-auto space-y-6">
      <h2 className="text-[18px] font-semibold anim-fade-up" style={{ color: "#0F1117" }}>Settings</h2>

      <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #E8E8EF" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Notifications</h3>
        </div>
        <div>
          {([["New applicant alerts", true], ["Message notifications", true], ["Deadline reminders", true], ["Weekly digest", false]] as [string, boolean][]).map(([label, defaultOn], i, arr) => (
            <div key={label} className="flex items-center justify-between px-6 py-4 transition-colors" style={{ borderBottom: i < arr.length - 1 ? "1px solid #E8E8EF" : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span className="text-[13px]" style={{ color: "#374151" }}>{label}</span>
              <Toggle defaultOn={defaultOn} />
            </div>
          ))}
        </div>
      </div>

      <TeamSection />

      <div className="rounded-[20px] border anim-fade-up" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)", animationDelay: "0.16s" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #E8E8EF" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Integrations</h3>
        </div>
        <div>
          {([["ATS / Greenhouse", false], ["Calendar (Google)", true], ["Slack notifications", false]] as [string, boolean][]).map(([label, defaultOn], i, arr) => (
            <div key={label} className="flex items-center justify-between px-6 py-4 transition-colors" style={{ borderBottom: i < arr.length - 1 ? "1px solid #E8E8EF" : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span className="text-[13px]" style={{ color: "#374151" }}>{label}</span>
              <Toggle defaultOn={defaultOn} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
