import { useState } from "react";
import { useDashboard } from "../data/store";
import { clearSession } from "../lib/session";

/**
 * Demo tooling. `demo_reset()` truncates every runtime table and rebuilds the dataset a
 * presentation starts from, so a run-through can be given again from the top: jobs back
 * in the student's deck, applications back to their opening statuses, selections and
 * conversations back to the two seeded threads.
 *
 * It rebuilds rows this tab is holding ids for, so the page is reloaded onto the fresh
 * data rather than patched — and the student app, polling the same tables, reloads too
 * (see the reset check in `data/store.tsx`).
 */
export default function ResetDemoModal({ onClose }: { onClose: () => void }) {
  const { resetDemo } = useDashboard();
  const [signOut, setSignOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Cleared first: the student app's poll can reload this tab the moment the reset
      // lands, and a session left behind would come back signed in.
      if (signOut) clearSession();
      await resetDemo();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overlay-backdrop"
      style={{ background: "rgba(15,17,23,0.5)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        className="anim-scale-spring rounded-[24px] p-7 w-[440px] mx-4 overflow-y-auto"
        style={{ background: "#FFFFFF", border: "1px solid #E8E8EF", boxShadow: "0 8px 24px rgba(15,17,23,0.10)", maxHeight: "90vh" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EEF0FF", color: "#4F46E5" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
          </svg>
        </div>

        <h3 className="text-[17px] font-semibold mb-1.5" style={{ color: "#0F1117" }}>Reset the demo?</h3>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#6B7280" }}>
          Every swipe, application, selection and conversation goes back to how it started —
          on this dashboard <em>and</em> in the student app. Both will reload onto the restored data.
        </p>

        <ul className="rounded-2xl px-4 py-3.5 mb-5 space-y-2" style={{ background: "#F7F7FB", border: "1px solid #E8E8EF" }}>
          {[
            "12 companies, 8 students and every job posting, restored",
            "Applicants back to their opening pipeline stages",
            "Selections and inbox threads back to the two seeded conversations",
            "Jobs you posted or paused during the run are cleared",
          ].map(line => (
            <li key={line} className="flex items-start gap-2.5 text-[12.5px]" style={{ color: "#374151" }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4F46E5" }} />
              {line}
            </li>
          ))}
        </ul>

        <label className="flex items-center gap-2.5 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={signOut}
            onChange={e => setSignOut(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#4F46E5" }}
          />
          <span className="text-[12.5px]" style={{ color: "#374151" }}>
            Sign out too, so the run starts from the landing page
          </span>
        </label>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-4 text-[12.5px]" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
            Could not reach Supabase — {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-medium border"
            style={{ background: "#F7F7FB", borderColor: "#E8E8EF", color: "#6B7280", opacity: busy ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button
            onClick={run}
            disabled={busy}
            className="btn-press flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "#4F46E5", boxShadow: "0 4px 12px rgba(79,70,229,0.28)", opacity: busy ? 0.7 : 1, cursor: busy ? "wait" : "pointer" }}
          >
            {busy && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {busy ? "Restoring…" : "Reset demo data"}
          </button>
        </div>
      </div>
    </div>
  );
}
