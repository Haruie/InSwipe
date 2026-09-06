import { useState } from "react";
import type { Candidate } from "../data/candidates";
import { useDashboard } from "../data/store";
import FitScoreRing from "./FitScoreRing";
import CandidateAvatar from "./CandidateAvatar";

interface Props {
  candidate: Candidate;
  jobTitle: string;
  companyName: string;
  /**
   * Selecting and sending the first message are one write, not two — the database
   * creates the selection, the conversation and this message together. Passing no
   * message means "use the default opener".
   */
  onConfirm: (message?: string) => void;
  onCancel: () => void;
}

export default function SelectionModal({ candidate: c, jobTitle, companyName, onConfirm, onCancel }: Props) {
  const { company } = useDashboard();
  const [step, setStep] = useState<"confirm" | "success" | "message">("confirm");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${c.name.split(" ")[0]}! Congratulations — you've been selected for the ${jobTitle} role at ${companyName}.\n\nWe were really impressed by your ${c.fits[0]} and ${c.fits[1]} work${c.projects[0] ? `, especially ${c.projects[0].name}` : ""}. I'd love to set up an intro call to walk you through the team and next steps.\n\nAre you available this week?`
  );

  const handleConfirm = () => {
    setStep("success");
    setTimeout(() => setStep("message"), 2200);
  };

  const send = (body?: string) => {
    if (sending) return;
    setSending(true);
    onConfirm(body);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop"
      style={{ background: "rgba(15,17,23,0.5)", backdropFilter: "blur(4px)" }}
    >
      {/* CONFIRM */}
      {step === "confirm" && (
        <div
          className="anim-scale-spring rounded-[28px] p-8 w-[440px] mx-4 overflow-y-auto"
          style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }}
        >
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-14">
              <CandidateAvatar initials={c.initials} color={c.avatarColor} photoUrl={c.photoUrl} size={56} radius={16} fontSize={20} />
            </div>
            <h2 className="text-[18px] font-semibold mb-1" style={{ color: "#0F1117" }}>Select {c.name}?</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>
              You're about to select this candidate for the <strong style={{ color: "#374151" }}>{jobTitle}</strong> role. This unlocks their inbox, and you'll send them the first message next.
            </p>
          </div>

          <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
            <FitScoreRing score={c.fitScore} size={56} strokeWidth={4} showLabel={false} animated={false} />
            <div>
              <div className="font-semibold text-[14px]" style={{ color: "#0F1117" }}>{c.name}</div>
              <div className="text-[13px]" style={{ color: "#374151" }}>{c.school}</div>
              <div className="text-[13px] font-semibold mt-0.5" style={{ color: c.fitScore >= 85 ? "#16A34A" : "#4F46E5" }}>
                {c.fitScore}% fit
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-press flex-1 py-3 rounded-xl text-[13px] font-medium border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280" }}>
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn-press flex-1 py-3 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}>
              Confirm Selection
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS ANIMATION */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex items-center" style={{ gap: 48 }}>
            <div className="anim-success w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ background: "#4F46E5", boxShadow: "0 8px 24px rgba(79,70,229,0.28)", animationDelay: "0s" }}>
              {company.initial}
            </div>
            <div className="anim-fade-in" style={{ animationDelay: "0.4s" }}>
              <svg width="48" height="8" viewBox="0 0 48 8">
                <line x1="0" y1="4" x2="48" y2="4" stroke="url(#lg)" strokeWidth="2"/>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#4F46E5"/><stop offset="1" stopColor="#16A34A"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="anim-success" style={{ boxShadow: "0 8px 24px rgba(79,70,229,0.15)", animationDelay: "0.2s", borderRadius: 16 }}>
              <CandidateAvatar initials={c.initials} color={c.avatarColor} photoUrl={c.photoUrl} size={64} radius={16} fontSize={20} />
            </div>
          </div>
          <div className="anim-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="text-[28px] font-bold mb-2" style={{ color: "#16A34A" }}>{c.fitScore}% fit</div>
            <div className="text-[18px] font-semibold mb-1" style={{ color: "#0F1117" }}>{c.name} selected!</div>
            <div className="text-[14px]" style={{ color: "#6B7280" }}>Preparing your first message…</div>
          </div>
        </div>
      )}

      {/* MESSAGE */}
      {step === "message" && (
        <div
          className="anim-scale-spring rounded-[28px] p-8 w-[540px] mx-4 overflow-y-auto"
          style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EEF0FF" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>AI-drafted first message</h3>
              <p className="text-[12px]" style={{ color: "#9CA3AF" }}>Personalised for {c.name} — edit freely before sending</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-4" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
            <div className="text-[12px] mb-2 flex items-center justify-between" style={{ color: "#9CA3AF" }}>
              <span>To: {c.name}</span>
              <span>{jobTitle}</span>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={7}
              className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed"
              style={{ color: "#0F1117" }}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => send()} disabled={sending} className="btn-press px-5 py-3 rounded-xl text-[13px] font-medium border" style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280" }}>
              Send default
            </button>
            <button
              onClick={() => send(message)}
              disabled={sending}
              className="btn-press flex-1 py-3 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg>
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
