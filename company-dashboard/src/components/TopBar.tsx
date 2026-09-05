import { useState } from "react";
import type { Page } from "../App";

interface Props { title: string; onOpenPostJob: () => void; onNavigate: (p: Page) => void; }

export default function TopBar({ title, onOpenPostJob, onNavigate }: Props) {
  const [focused, setFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { title: "Arjun Mehta replied", desc: "Thursday at 2pm IST works!", time: "2m ago", unread: true },
    { title: "14 new applicants", desc: "Product Design Intern", time: "1h ago", unread: true },
    { title: "Deadline approaching", desc: "Frontend Eng closes in 2 days", time: "3h ago", unread: false },
  ]);
  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <header
      className="flex items-center gap-4 px-7 flex-shrink-0"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E8E8EF",
        height: 60,
        boxShadow: "0 1px 3px rgba(15,17,23,0.06)",
      }}
    >
      <h1 className="text-base font-semibold" style={{ color: "#0F1117" }}>{title}</h1>

      {/* Search */}
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] ml-4 transition-all duration-200"
        style={{
          background: "#F7F7FB",
          border: `1px solid ${focused ? "#4F46E5" : "#E8E8EF"}`,
          width: 256,
          boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search candidates, jobs…"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="bg-transparent border-none outline-none text-[13px] w-full"
          style={{ color: "#0F1117", fontFamily: "Inter, sans-serif" }}
        />
        <kbd className="text-[11px] px-1.5 py-0.5 rounded-[6px]" style={{ color: "#9CA3AF", background: "#E8E8EF", fontFamily: "Inter" }}>⌘K</kbd>
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="btn-press relative p-2.5 rounded-[10px] border transition-all duration-150"
          style={{ background: notifOpen ? "#EEF0FF" : "#F7F7FB", borderColor: notifOpen ? "#4F46E5" : "#E8E8EF", color: "#6B7280" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot" style={{ background: "#4F46E5" }} />
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden anim-scale-spring z-50"
            style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)" }}
          >
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF" }}>
              <span className="text-[13px] font-semibold" style={{ color: "#0F1117" }}>Notifications</span>
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="text-[12px] font-medium"
                style={{ color: unreadCount === 0 ? "#9CA3AF" : "#4F46E5", cursor: unreadCount === 0 ? "default" : "pointer" }}
              >
                Mark all read
              </button>
            </div>
            {notifications.map((n, i) => (
              <button
                key={i}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F7F7FB")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => {
                  setNotifications(prev => prev.map((x, xi) => xi === i ? { ...x, unread: false } : x));
                  setNotifOpen(false);
                  onNavigate("inbox");
                }}
              >
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.unread ? "#4F46E5" : "#E8E8EF" }} />
                <div>
                  <div className="text-[13px] font-medium" style={{ color: "#0F1117" }}>{n.title}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: "#6B7280" }}>{n.desc}</div>
                  <div className="text-[12px] mt-1" style={{ color: "#9CA3AF" }}>{n.time}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Job */}
      <button
        onClick={onOpenPostJob}
        className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-white"
        style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Post a Job
      </button>
    </header>
  );
}
