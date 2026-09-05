import type { Page } from "../App";
import { RECRUITER } from "../data/mock";

const Icon = ({ path, size = 17 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const NAV: { id: Page; label: string; badge?: number; icon: string }[] = [
  { id: "dashboard",  label: "Dashboard",       icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
  { id: "jobs",       label: "My Jobs",          icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" },
  { id: "applicants", label: "Applicants",       icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
  { id: "pipeline",   label: "Pipeline",         icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
  { id: "inbox",      label: "Inbox", badge: 1,  icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
  { id: "analytics",  label: "Analytics",        icon: "M18 20V10 M12 20V4 M6 20v-6" },
];

const BOTTOM: { id: Page; label: string; icon: string }[] = [
  { id: "profile",  label: "Company Profile", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "settings", label: "Settings",        icon: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" },
];

interface Props { currentPage: Page; onNavigate: (p: Page) => void; onOpenPostJob: () => void; }

export default function Sidebar({ currentPage, onNavigate, onOpenPostJob }: Props) {
  return (
    <aside
      className="flex flex-col w-[220px] flex-shrink-0"
      style={{ background: "#FFFFFF", borderRight: "1px solid #E8E8EF", boxShadow: "1px 0 0 #E8E8EF" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-[18px]" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "#4F46E5" }}
        >
          T
        </div>
        <div>
          <div className="text-[13px] font-semibold leading-tight" style={{ color: "#0F1117" }}>TechNova</div>
          <div className="text-[12px]" style={{ color: "#6B7280" }}>Company</div>
        </div>
      </div>

      {/* Post Job */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onOpenPostJob}
          className="btn-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white"
          style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Post a Job
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 relative"
              style={{
                background: active ? "#EEF0FF" : "transparent",
                color:      active ? "#4F46E5" : "#374151",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "#4F46E5" }}
                />
              )}
              <span style={{ color: active ? "#4F46E5" : "#6B7280" }}>
                <Icon path={item.icon} />
              </span>
              {item.label}
              {item.badge && (
                <span
                  className="ml-auto text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "#4F46E5" }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 space-y-0.5" style={{ borderTop: "1px solid #E8E8EF" }}>
        {BOTTOM.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150"
              style={{ background: active ? "#EEF0FF" : "transparent", color: active ? "#4F46E5" : "#6B7280" }}
            >
              <Icon path={item.icon} />
              {item.label}
            </button>
          );
        })}

        {/* Recruiter */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-[10px]" style={{ background: "#F7F7FB" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: "#4F46E5" }}
          >
            PS
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-medium truncate" style={{ color: "#0F1117" }}>{RECRUITER.name}</div>
            <div className="text-[12px] truncate" style={{ color: "#9CA3AF" }}>{RECRUITER.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
