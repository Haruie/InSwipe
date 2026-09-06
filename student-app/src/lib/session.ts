/**
 * Who is signed in, and which screen a reload should land on.
 *
 * Signing up writes a real `students` row (see `supabase/migrations/0004_...`), so this
 * records which one — everything else about the student lives in Supabase and is loaded
 * from that id. No profile data is kept here.
 *
 * `onboarded` is what separates "signed in" from "finished signing up": refreshing
 * halfway through building a profile resumes onboarding rather than dropping the new
 * account back at the splash screen.
 */
import type { Tab } from '../store';

const KEY = 'inswipe.student.session';

export interface Session {
  studentId: string;
  onboarded: boolean;
  tab: Tab;
}

const TABS: Tab[] = ['discover', 'applications', 'saved', 'inbox', 'profile'];

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session> & { signedIn?: boolean };
    // Sessions written before accounts existed recorded only `signedIn`. They belong to
    // the demo student, which is who the app ran as at the time.
    const studentId = parsed.studentId || (parsed.signedIn ? 'anika-sharma' : '');
    if (!studentId) return null;
    return {
      studentId,
      onboarded: parsed.onboarded !== false,
      tab: TABS.includes(parsed.tab as Tab) ? (parsed.tab as Tab) : 'discover',
    };
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
