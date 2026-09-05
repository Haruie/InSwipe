/**
 * Which screen a reload should land on. Without this, refreshing throws the student back
 * to the splash screen and through onboarding again, which is not what a signed-in app does.
 * Auth is still to come (CLAUDE.md section 10), so this records the demo session only —
 * never profile data, which lives in Supabase.
 */
import type { Tab } from '../store';

const KEY = 'inswipe.student.session';

export interface Session {
  signedIn: boolean;
  tab: Tab;
}

const TABS: Tab[] = ['discover', 'applications', 'saved', 'inbox', 'profile'];

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed?.signedIn) return null;
    return { signedIn: true, tab: TABS.includes(parsed.tab as Tab) ? (parsed.tab as Tab) : 'discover' };
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* private mode — the app still works, it just forgets on reload */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
