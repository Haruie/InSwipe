/**
 * Which view a reload should land on. Without this, refreshing drops the recruiter back
 * on the landing page and out of the dashboard. Auth is still to come (CLAUDE.md section
 * 10), so this records the demo session only — never company or candidate data.
 */
import type { Page } from "../App";

const KEY = "inswipe.company.session";

export interface Session {
  signedIn: boolean;
  page: Page;
}

const PAGES: Page[] = [
  "dashboard",
  "jobs",
  "applicants",
  "pipeline",
  "inbox",
  "analytics",
  "profile",
  "settings",
];

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed?.signedIn) return null;
    return { signedIn: true, page: PAGES.includes(parsed.page as Page) ? (parsed.page as Page) : "dashboard" };
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
