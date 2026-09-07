import { useState } from "react";
import { useAccount, initialsOf, type TeamRole } from "../lib/account";
import {
  ensureNotificationPermission,
  notificationPermission,
  notificationsSupported,
  sendNotification,
} from "../lib/notify";

// Admin is the org owner only — teammates are invited/assigned one of these.
const ASSIGNABLE_ROLES: TeamRole[] = ["Recruiter", "Hiring Manager"];

const cardSty = {
  background: "#FFFFFF",
  borderColor: "#E8E8EF",
  boxShadow: "0 1px 3px rgba(15,17,23,0.06)",
} as const;

function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!on)}
      disabled={disabled}
      className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors duration-200 ${disabled ? "cursor-not-allowed opacity-40" : "btn-press cursor-pointer"}`}
      style={{ background: on ? "#4F46E5" : "#E8E8EF", border: "none" }}
      role="switch"
      aria-checked={on}
    >
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200" style={{ left: on ? "calc(100% - 18px)" : 2 }} />
    </button>
  );
}

function Card({ title, action, children, delay = 0 }: { title: string; action?: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <section className="rounded-[20px] border anim-fade-up" style={{ ...cardSty, animationDelay: `${delay}s` }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors"
      style={{ borderBottom: last ? "none" : "1px solid #E8E8EF" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </div>
  );
}

/* ─── Notifications ──────────────────────────────────────────────────────── */

function NotificationsSection() {
  const { account, updateSettings } = useAccount();
  const s = account.settings;
  const [perm, setPerm] = useState(notificationPermission());
  const [tested, setTested] = useState(false);

  const supported = notificationsSupported();
  const allOn = s.newApplicantAlerts && s.messageNotifications;

  const toggle = async (key: "newApplicantAlerts" | "messageNotifications", next: boolean) => {
    if (next) {
      const ok = await ensureNotificationPermission();
      setPerm(notificationPermission());
      if (!ok) return; // permission not granted — leave the toggle off
    }
    updateSettings({ [key]: next });
  };

  const grant = async () => {
    await ensureNotificationPermission();
    setPerm(notificationPermission());
  };

  // Only sends while both alerts are on and permission is granted.
  const canTest = allOn && perm === "granted";
  const test = () => {
    if (!canTest) return;
    sendNotification("InSwipe", "Notifications are working — you'll get alerts like this.");
    setTested(true);
    setTimeout(() => setTested(false), 3000);
  };

  const items: { key: "newApplicantAlerts" | "messageNotifications"; label: string; hint: string }[] = [
    { key: "newApplicantAlerts", label: "New applicant alerts", hint: "When a candidate applies to one of your roles" },
    { key: "messageNotifications", label: "Message notifications", hint: "When a matched candidate sends you a message" },
  ];

  return (
    <Card title="Notifications">
      {!supported ? (
        <Row last>
          <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
            This browser doesn&apos;t support desktop notifications.
          </span>
        </Row>
      ) : (
        <>
          {perm !== "granted" && (
            <div className="px-6 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid #E8E8EF", background: perm === "denied" ? "#FEF2F2" : "#F7F7FB" }}>
              <span className="text-[12px]" style={{ color: perm === "denied" ? "#B91C1C" : "#6B7280" }}>
                {perm === "denied"
                  ? "Notifications are blocked. Enable them for this site in your browser settings, then reload."
                  : "Browser notifications are off. Turn them on to receive alerts."}
              </span>
              {perm === "default" && (
                <button onClick={grant} className="btn-press text-[12px] font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: "#EEF0FF", color: "#4F46E5" }}>
                  Turn on
                </button>
              )}
            </div>
          )}

          {items.map((it) => (
            <Row key={it.key}>
              <div className="min-w-0">
                <div className="text-[13px]" style={{ color: "#374151" }}>{it.label}</div>
                <div className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{it.hint}</div>
              </div>
              <Toggle on={s[it.key] && perm === "granted"} onChange={(next) => toggle(it.key, next)} />
            </Row>
          ))}

          <Row last>
            <span className="text-[12px]" style={{ color: "#9CA3AF" }}>
              {tested
                ? "Sent — check your desktop"
                : canTest
                  ? "Send yourself a test to confirm it works"
                  : "Turn on both alerts above to enable this"}
            </span>
            <button
              onClick={test}
              disabled={!canTest}
              className="btn-press text-[12px] font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: canTest ? "#EEF0FF" : "#F7F7FB", color: canTest ? "#4F46E5" : "#9CA3AF", cursor: canTest ? "pointer" : "not-allowed" }}
            >
              Send test
            </button>
          </Row>

          {(s.newApplicantAlerts || s.messageNotifications) && perm === "granted" && (
            <div className="px-6 py-2.5 text-[11px]" style={{ borderTop: "1px solid #E8E8EF", color: "#9CA3AF" }}>
              Alerts fire while this tab is open.
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ─── Account ────────────────────────────────────────────────────────────── */

function AccountSection() {
  const { account, resetAccount } = useAccount();
  const [confirm, setConfirm] = useState(false);
  const isMember = account.membership === "member";

  const signOut = () => {
    resetAccount();
    // Full reload so every screen resets to the signed-out landing state.
    window.location.assign(window.location.pathname);
  };

  return (
    <Card title="Account" delay={0.16}>
      <Row>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 overflow-hidden" style={{ background: "#EEF0FF", color: "#4F46E5" }}>
            {account.user.picture
              ? <img src={account.user.picture} alt="" className="w-full h-full object-cover" />
              : initialsOf(account.user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{account.user.name}</div>
            <div className="text-[12px] truncate" style={{ color: "#9CA3AF" }}>{account.user.email}</div>
          </div>
        </div>
        <span className="text-[12px]" style={{ color: "#6B7280" }}>
          {isMember ? account.user.role : "Admin"} · {account.company.name}
        </span>
      </Row>
      <Row last>
        <div className="min-w-0">
          <div className="text-[13px]" style={{ color: "#374151" }}>{isMember ? "Leave this team" : "Sign out of this demo"}</div>
          <div className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>
            {isMember ? "Removes this browser's access to the team." : "Clears the account on this browser and returns to the start."}
          </div>
        </div>
        {confirm ? (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setConfirm(false)} className="btn-press text-[12px] font-medium px-3 py-1.5 rounded-lg border" style={{ borderColor: "#E8E8EF", color: "#6B7280", background: "#fff" }}>
              Cancel
            </button>
            <button onClick={signOut} className="btn-press text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "#DC2626" }}>
              Confirm
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="btn-press text-[12px] font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            {isMember ? "Leave" : "Sign out"}
          </button>
        )}
      </Row>
    </Card>
  );
}

/* ─── Team ───────────────────────────────────────────────────────────────── */

interface TeamRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: TeamRole;
  status: "Active" | "Pending";
  isYou?: boolean;
}

function RoleBadge({ role }: { role: TeamRole }) {
  const color = role === "Admin" ? "#4F46E5" : role === "Recruiter" ? "#15803D" : "#EA580C";
  const bg = role === "Admin" ? "#EEF0FF" : role === "Recruiter" ? "#DCFCE7" : "#FFEDD5";
  return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: bg, color }}>{role}</span>;
}

function InviteModal({ onInvite, onClose }: { onInvite: (name: string, email: string, role: TeamRole) => Promise<string | null>; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Recruiter");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && !sending;

  const inputSty = { background: "#F7F7FB", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#0F1117", width: "100%", boxSizing: "border-box" as const };

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    const err = await onInvite(name.trim(), email.trim(), role);
    if (err) {
      setError(err);
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop" style={{ background: "rgba(15,17,23,0.5)", backdropFilter: "blur(4px)" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="anim-scale-spring rounded-[24px] p-7 w-[420px] mx-4 overflow-y-auto" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }}>
        <h3 className="text-[16px] font-semibold mb-1" style={{ color: "#0F1117" }}>Invite a team member</h3>
        <p className="text-[13px] mb-5" style={{ color: "#9CA3AF" }}>You&apos;ll get a join link to send them; they confirm with an e-mailed code.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Verma" style={inputSty} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Work email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@company.com" style={inputSty} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#374151" }}>Role</label>
            <div className="flex gap-2">
              {ASSIGNABLE_ROLES.map(r => (
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

        {error && <p className="text-[12px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-medium border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280" }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity"
            style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
          >
            {sending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  const { account, inviteMember, updateMember, removeMember } = useAccount();
  const isOwner = account.membership === "owner";

  const ALL_ROLES: TeamRole[] = ["Admin", ...ASSIGNABLE_ROLES];
  const myRole: TeamRole = isOwner
    ? "Admin"
    : (ALL_ROLES.includes(account.user.role as TeamRole) ? (account.user.role as TeamRole) : "Recruiter");

  const you: TeamRow = {
    id: account.memberId ?? "you",
    name: account.user.name,
    initials: initialsOf(account.user.name),
    email: account.user.email,
    role: myRole,
    status: "Active",
    isYou: true,
  };
  const others: TeamRow[] = account.team.map((m) => ({
    id: m.id,
    name: m.name,
    initials: initialsOf(m.name),
    email: m.email,
    role: m.role,
    status: m.status,
  }));
  const rows: TeamRow[] = [you, ...others];

  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuDirection, setMenuDirection] = useState<"down" | "up">("down");
  const [flash, setFlash] = useState<string | null>(null);
  /** The join link from the last invite, shown to copy when it wasn't emailed. */
  const [inviteLink, setInviteLink] = useState<{ url: string; who: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 3500); };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — the link is still selectable in the field */ }
  };

  const MENU_EST_HEIGHT = 190;
  const toggleMenu = (id: string, anchor: HTMLElement) => {
    if (menuOpenId === id) { setMenuOpenId(null); return; }
    const spaceBelow = window.innerHeight - anchor.getBoundingClientRect().bottom;
    setMenuDirection(spaceBelow < MENU_EST_HEIGHT ? "up" : "down");
    setMenuOpenId(id);
  };

  const handleInvite = async (name: string, email: string, role: TeamRole): Promise<string | null> => {
    const res = await inviteMember({ name, email, role });
    if (!res.ok) return res.error ?? "Could not send the invite.";
    setInviteOpen(false);
    if (res.emailed === false && res.inviteLink) {
      setInviteLink({ url: res.inviteLink, who: name });
      showFlash(`Invite created for ${name} — send them the link below`);
    } else {
      setInviteLink(null);
      showFlash(`Invite emailed to ${email}`);
    }
    return null;
  };

  const changeRole = (id: string, role: TeamRole) => { updateMember(id, { role }); setMenuOpenId(null); };

  const resend = async (id: string) => {
    setMenuOpenId(null);
    const m = account.team.find(t => t.id === id);
    if (!m) return;
    const res = await inviteMember({ name: m.name, email: m.email, role: m.role });
    if (!res.ok) { showFlash(res.error ?? "Could not resend the invite."); return; }
    if (res.emailed === false && res.inviteLink) {
      setInviteLink({ url: res.inviteLink, who: m.name });
      showFlash(`New link created for ${m.name} — send it below`);
    } else {
      setInviteLink(null);
      showFlash(`Invite re-sent to ${m.email}`);
    }
  };

  const remove = (id: string) => { removeMember(id); setMenuOpenId(null); };

  return (
    <>
    <section
      className="rounded-[20px] border anim-fade-up"
      style={{ ...cardSty, animationDelay: "0.08s", position: "relative", zIndex: menuOpenId ? 40 : "auto" }}
    >
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Team</h3>
          <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>
            {rows.length} member{rows.length !== 1 ? "s" : ""} with access to {account.company.name}&apos;s hiring
            {!isOwner && " · managed by an admin"}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setInviteOpen(true)}
            className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white flex-shrink-0"
            style={{ background: "#4F46E5" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add team member
          </button>
        )}
      </div>

      <div>
        {rows.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-6 py-4 transition-colors relative"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid #E8E8EF" : "none" }}
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

            {isOwner && !m.isYou && (
              <div className="relative">
                <button
                  onClick={e => toggleMenu(m.id, e.currentTarget)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "#9CA3AF" }}
                  aria-label={`Manage ${m.name}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                {menuOpenId === m.id && (
                  <div
                    className={`absolute right-0 w-44 rounded-xl overflow-hidden anim-scale-spring ${menuDirection === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
                    style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", zIndex: 60 }}
                  >
                    <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Change role</div>
                    {ASSIGNABLE_ROLES.map(r => (
                      <button
                        key={r}
                        onClick={() => changeRole(m.id, r)}
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

      {flash && (
        <div className="px-6 py-3 flex items-center gap-2 anim-fade-in" style={{ borderTop: "1px solid #E8E8EF", background: "#F0FDF4" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span className="text-[12px] font-medium" style={{ color: "#15803D" }}>{flash}</span>
        </div>
      )}

      {inviteLink && (
        <div className="px-6 py-4 anim-fade-in" style={{ borderTop: "1px solid #E8E8EF", background: "#FAFBFF" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold" style={{ color: "#374151" }}>Join link for {inviteLink.who}</span>
            <button
              onClick={() => setInviteLink(null)}
              className="text-[11px]" style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink.url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 text-[12px] px-3 py-2 rounded-lg"
              style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", color: "#4F46E5" }}
            />
            <button
              onClick={copyLink}
              className="btn-press text-[12px] font-semibold px-4 py-2 rounded-lg text-white flex-shrink-0"
              style={{ background: copied ? "#16A34A" : "#4F46E5" }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] mt-2" style={{ color: "#9CA3AF" }}>
            Send this to {inviteLink.who}. They open it, enter a 6-digit code we e-mail them, and join the team.
          </p>
        </div>
      )}
    </section>

    {inviteOpen && <InviteModal onInvite={handleInvite} onClose={() => setInviteOpen(false)} />}
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Settings() {
  return (
    <div className="p-8 max-w-[680px] mx-auto space-y-6">
      <div className="anim-fade-up">
        <h2 className="text-[18px] font-semibold" style={{ color: "#0F1117" }}>Settings</h2>
        <p className="text-[13px] mt-0.5" style={{ color: "#9CA3AF" }}>Notifications, your team, and this account.</p>
      </div>

      <NotificationsSection />
      <TeamSection />
      <AccountSection />
    </div>
  );
}
