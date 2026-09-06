import { useState, useRef, useEffect } from "react";
import type { Conversation } from "@inswipe/core";
import type { Page } from "../App";
import FitScoreRing from "../components/FitScoreRing";
import { useDashboard } from "../data/store";

interface Props {
  onNavigate?: (p: Page) => void;
  activeConversationId: string | null;
  onActiveConversationChange: (id: string | null) => void;
}

/**
 * Every thread here hangs off a `selections` row — there is no other way for one to
 * exist (CLAUDE.md section 3, rule 2). Nothing on this page is seeded: the list is
 * whatever the database says this company has opened, and a candidate replying from the
 * student app appears on the next poll.
 */
export default function Inbox({ onNavigate, activeConversationId, onActiveConversationChange }: Props) {
  const { conversations, candidateById, jobById, reply, markRead } = useDashboard();
  const [input, setInput] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active: Conversation | undefined =
    conversations.find(c => c.id === activeConversationId) ?? conversations[0];
  const activeCand = active ? candidateById(active.studentId) : undefined;
  const activeJob = active ? jobById(active.jobId) : undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.id, active?.messages.length]);

  // Opening a thread marks the candidate's replies as read, for everyone looking.
  useEffect(() => {
    if (active && active.unread > 0) void markRead(active.id);
  }, [active?.id, active?.unread, markRead]);

  const send = (text: string) => {
    if (!text.trim() || !active) return;
    void reply(active.id, text.trim());
    setInput("");
  };

  const sendSchedule = () => {
    send("I'd like to schedule an interview. Would any of these times work?\n\n• Thursday, 3 Apr · 2:00 PM IST\n• Friday, 4 Apr · 11:00 AM IST\n• Monday, 7 Apr · 10:00 AM IST\n\nLet me know and I'll send a Google Meet invite!");
    setScheduleOpen(false);
  };

  if (!conversations.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-[380px] px-6">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EEF0FF" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.75" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h2 className="text-[15px] font-semibold mb-1.5" style={{ color: "#0F1117" }}>No conversations yet</h2>
          <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#6B7280" }}>
            A thread opens when you select a candidate. They cannot message you first.
          </p>
          <button
            onClick={() => onNavigate?.("applicants")}
            className="btn-press px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "#4F46E5" }}
          >
            Review applicants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 300, background: "#FFFFFF", borderRight: "1px solid #E8E8EF" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E8E8EF" }}>
          <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Inbox</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>{conversations.length} conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map(conv => {
            const cand = candidateById(conv.studentId);
            const job = jobById(conv.jobId);
            const last = conv.messages[conv.messages.length - 1];
            const isActive = active?.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onActiveConversationChange(conv.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left transition-colors"
                style={{ background: isActive ? "#EEF0FF" : "transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F7F7FB"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: cand?.avatarColor ?? "#EEF0FF", color: "#4F46E5" }}>{cand?.initials ?? "?"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-medium truncate" style={{ color: "#0F1117" }}>{cand?.name ?? conv.studentId}</span>
                    <span className="text-[12px] flex-shrink-0 ml-2" style={{ color: "#9CA3AF" }}>{conv.lastLabel}</span>
                  </div>
                  <div className="text-[12px] truncate" style={{ color: "#9CA3AF" }}>{job?.title ?? ""}</div>
                  <div className="text-[12px] mt-0.5 truncate" style={{ color: conv.unread > 0 ? "#0F1117" : "#9CA3AF", fontWeight: conv.unread > 0 ? 500 : 400 }}>
                    {last?.text}
                  </div>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: "#4F46E5" }}>{conv.unread}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ background: "#FFFFFF", borderBottom: "1px solid #E8E8EF" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ background: activeCand?.avatarColor ?? "#EEF0FF", color: "#4F46E5" }}>{activeCand?.initials ?? "?"}</div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>{activeCand?.name ?? active.studentId}</div>
              <div className="text-[12px]" style={{ color: "#9CA3AF" }}>{activeJob?.title ?? ""}</div>
            </div>
            <button
              onClick={() => setScheduleOpen(true)}
              className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium border"
              style={{ background: "#EEF0FF", borderColor: "#E8E8EF", color: "#4F46E5" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Schedule Interview
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ background: "#F7F7FB" }}>
            {active.messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.fromCompany ? "justify-end" : "justify-start"} anim-fade-up`} style={{ animationDelay: `${i * 0.04}s` }}>
                {!msg.fromCompany && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold mr-2 flex-shrink-0 self-end" style={{ background: activeCand?.avatarColor ?? "#EEF0FF", color: "#4F46E5" }}>{activeCand?.initials ?? "?"}</div>
                )}
                <div style={{ maxWidth: "62%" }}>
                  <div
                    className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                    style={{
                      background: msg.fromCompany ? "#4F46E5" : "#FFFFFF",
                      color: msg.fromCompany ? "#FFFFFF" : "#0F1117",
                      borderRadius: msg.fromCompany ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      boxShadow: "0 1px 3px rgba(15,17,23,0.06)",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className={`text-[12px] mt-1 ${msg.fromCompany ? "text-right" : "text-left"}`} style={{ color: "#9CA3AF" }}>{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 flex-shrink-0" style={{ background: "#FFFFFF", borderTop: "1px solid #E8E8EF" }}>
            <div className="flex items-end gap-3 rounded-2xl border px-4 py-3" style={{ background: "#F7F7FB", borderColor: "#E8E8EF" }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={`Message ${activeCand?.name ?? "candidate"}…`}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-[13px]"
                style={{ color: "#0F1117", maxHeight: 120 }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="btn-press p-2 rounded-xl flex-shrink-0 transition-all duration-150"
                style={{ background: input.trim() ? "#4F46E5" : "#E8E8EF", color: input.trim() ? "#FFFFFF" : "#9CA3AF" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
            <div className="text-[12px] mt-1.5 text-center" style={{ color: "#9CA3AF" }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ color: "#9CA3AF" }}>
          <p className="text-[13px]">Select a conversation</p>
        </div>
      )}

      {/* Candidate context panel */}
      {activeCand && (
        <div className="flex flex-col flex-shrink-0 overflow-y-auto" style={{ width: 300, background: "#FFFFFF", borderLeft: "1px solid #E8E8EF" }}>
          <div className="px-5 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}>Candidate</div>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[13px] font-bold mb-3" style={{ background: activeCand.avatarColor, color: "#4F46E5" }}>{activeCand.initials}</div>
              <div className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>{activeCand.name}</div>
              <div className="text-[12px] mt-0.5 mb-4" style={{ color: "#9CA3AF" }}>{activeCand.school}</div>
              <FitScoreRing score={activeCand.fitScore} size={72} />
            </div>
            <div className="space-y-4 text-[12px]">
              <div>
                <div className="font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: "0.08em" }}>Fits</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCand.fits.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#15803D" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: "0.08em" }}>Lacks</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCand.lacks.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full" style={{ background: "#FFEDD5", color: "#EA580C", border: "1px solid #EA580C" }}>{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1 uppercase tracking-wider" style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: "0.08em" }}>Availability</div>
                <div style={{ color: "#374151" }}>{activeCand.availability}</div>
              </div>
              <div className="pt-1" style={{ borderTop: "1px solid #E8E8EF" }}>
                <div className="flex items-center gap-2 pt-3 mb-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="truncate" style={{ color: "#374151" }}>{activeCand.resumeFile}</span>
                </div>
                <button
                  onClick={() => onNavigate?.("applicants")}
                  className="btn-press w-full py-2 rounded-xl text-[12px] font-semibold border transition-colors"
                  style={{ background: "#FFFFFF", borderColor: "#4F46E5", color: "#4F46E5" }}
                >
                  View full profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop" style={{ background: "rgba(15,17,23,0.4)" }} onClick={() => setScheduleOpen(false)}>
          <div className="anim-scale-spring rounded-[24px] p-6 w-[380px] overflow-y-auto" style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#0F1117" }}>Schedule Interview</h3>
            <p className="text-[12px] mb-4" style={{ color: "#9CA3AF" }}>We'll send the candidate these time options</p>
            <div className="space-y-2 mb-5">
              {["Thursday, 3 Apr · 2:00 PM IST", "Friday, 4 Apr · 11:00 AM IST", "Monday, 7 Apr · 10:00 AM IST"].map(t => (
                <div key={t} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span className="text-[13px]" style={{ color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setScheduleOpen(false)} className="flex-1 py-2.5 rounded-xl text-[13px] border" style={{ borderColor: "#E8E8EF", color: "#6B7280" }}>Cancel</button>
              <button onClick={sendSchedule} className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#4F46E5" }}>Send Options</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
