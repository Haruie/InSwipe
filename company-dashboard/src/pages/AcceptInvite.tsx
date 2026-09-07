import { useEffect, useState } from "react";
import { useAccount, initialsOf } from "../lib/account";

/**
 * Shown when someone opens an ?invite=<token> link. Confirms who invited them and
 * the role, lets them set their display name, and requires a 6-digit code emailed
 * to the invited address before they can join.
 */
export default function AcceptInvite() {
  const { pendingInvite, joining, sendInviteCode, completeInvite, cancelInvite } = useAccount();

  const [name, setName] = useState(pendingInvite?.toName ?? "");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingInvite && !name) setName(pendingInvite.toName);
  }, [pendingInvite, name]);

  if (!pendingInvite) return null;
  const { company, role, inviterName, toEmail } = pendingInvite;

  const send = async () => {
    setError(null);
    setPhase("sending");
    const res = await sendInviteCode();
    if (!res.ok) {
      setPhase("idle");
      setError("Couldn't send the code. Is the sync server running?");
      return;
    }
    setDevCode(res.devCode ?? null);
    setPhase("sent");
    setNote(
      res.devCode
        ? "No mail server is configured — the code is shown below."
        : `We emailed a 6-digit code to ${res.sentTo}. Check inbox and spam.`,
    );
  };

  const join = async () => {
    setError(null);
    const res = await completeInvite({ name: name.trim(), code: code.trim() });
    if (!res.ok) setError(res.error ?? "That didn't work. Check the code and try again.");
  };

  const inputSty: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E8E8EF", borderRadius: 10, padding: "11px 14px",
    fontSize: 14, color: "#0F1117", background: "#fff", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7FB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: 440, maxWidth: "100%", background: "#fff", border: "1px solid #E8E8EF", borderRadius: 20, padding: 32, boxShadow: "0 8px 24px rgba(15,17,23,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: company.logo ? "#fff" : "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, overflow: "hidden", flexShrink: 0 }}>
            {company.logo
              ? <img src={company.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initialsOf(company.name)[0]}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>You&apos;ve been invited to</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1117" }}>{company.name}</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 24 }}>
          <strong>{inviterName}</strong> invited you to join the hiring team as{" "}
          <span style={{ background: "#EEF0FF", color: "#4F46E5", fontWeight: 600, padding: "1px 8px", borderRadius: 999, fontSize: 12 }}>{role}</span>.
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={{ ...inputSty, marginBottom: 16 }} />

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
        <input value={toEmail} readOnly title="The invite is tied to this address" style={{ ...inputSty, marginBottom: 4, background: "#F7F7FB", color: "#6B7280", cursor: "not-allowed" }} />
        <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>This invite is tied to your email — ask the admin to re-invite if it&apos;s wrong.</p>

        {phase !== "sent" ? (
          <button
            onClick={send}
            disabled={phase === "sending" || name.trim().length < 2}
            style={{ width: "100%", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: name.trim().length < 2 ? "not-allowed" : "pointer", opacity: name.trim().length < 2 ? 0.5 : 1 }}
          >
            {phase === "sending" ? "Sending code…" : "Email me a code"}
          </button>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Verification code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              style={{ ...inputSty, letterSpacing: 4, fontWeight: 700, fontSize: 18, marginBottom: 4 }}
            />
            {devCode && <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Dev code: <strong style={{ color: "#4F46E5", letterSpacing: 2 }}>{devCode}</strong></p>}
            <button onClick={send} style={{ background: "none", border: "none", color: "#4F46E5", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 14 }}>Resend code</button>
            <button
              onClick={join}
              disabled={joining || code.length < 4}
              style={{ width: "100%", background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: code.length < 4 ? "not-allowed" : "pointer", opacity: code.length < 4 ? 0.5 : 1 }}
            >
              {joining ? "Joining…" : `Join ${company.name}`}
            </button>
          </>
        )}

        {note && !error && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 12, lineHeight: 1.5 }}>{note}</p>}
        {error && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 12 }}>{error}</p>}

        <button onClick={cancelInvite} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", marginTop: 16, display: "block", marginInline: "auto" }}>
          Not you? Cancel
        </button>
      </div>
    </div>
  );
}
