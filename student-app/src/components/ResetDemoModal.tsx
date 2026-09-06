import { useState } from 'react';
import { useStore } from '../store';
import { clearSession } from '../lib/session';
import { Button, Modal } from './ui';

/**
 * Demo tooling. `demo_reset()` truncates every runtime table and rebuilds the dataset a
 * presentation starts from, so the deck refills, applications go back to their opening
 * statuses and the inbox re-locks — here and on the company dashboard, which polls the
 * same tables and reloads itself (see the reset check in `data/store.tsx` there).
 */
export function ResetDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { resetDemo } = useStore();
  const [signOut, setSignOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Cleared first: the dashboard's poll can reload this tab the moment the reset
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
    <Modal open onClose={busy ? undefined : onClose}>
      <h2 className="text-[18px] font-bold leading-snug text-ink-900">Reset the demo?</h2>
      <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-500">
        Every swipe, application, selection and conversation goes back to how it started —
        in this app <em>and</em> on the company dashboard. Both reload onto the restored data.
      </p>

      <ul className="mt-4 space-y-2 rounded-lg bg-canvas p-3.5">
        {[
          'Your swipe deck back to its opening cards',
          'Applications back to their opening statuses',
          'Saved list and the inbox padlock restored',
          'Accounts created during this run-through removed',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-[12.5px] text-ink-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
            {line}
          </li>
        ))}
      </ul>

      <label className="mt-4 flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={signOut}
          onChange={(e) => setSignOut(e.target.checked)}
          style={{ width: 15, height: 15, accentColor: '#4F46E5' }}
        />
        <span className="text-[12.5px] text-ink-700">Sign out too, so onboarding plays again</span>
      </label>

      {error && (
        <p className="mt-4 rounded-md bg-gap-100 px-3 py-2.5 text-[12.5px] leading-[1.45] text-gap-600">
          Could not reach Supabase — {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2.5">
        <Button full onClick={run} disabled={busy}>
          {busy ? 'Restoring…' : 'Reset demo data'}
        </Button>
        <Button variant="secondary" full onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
