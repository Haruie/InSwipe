/**
 * Real "Sign in with Google" via Google Identity Services (the OAuth token
 * flow). On button click this opens Google's actual account chooser popup for
 * the origin, then exchanges the returned access token for the user's profile.
 *
 * Setup: put your OAuth client ID in app/.env.local as
 *   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 * and add http://localhost:8443 (and your deployed origin) to the client's
 * "Authorized JavaScript origins" in Google Cloud Console.
 *
 * With no client ID configured, isGoogleConfigured() returns false and callers
 * fall back to the simulated path so the demo still runs.
 *
 * The GIS script and token client are preloaded (call preloadGoogle() on mount)
 * so the click handler can open the popup synchronously — an `await` between the
 * click and requestAccessToken() loses the user gesture and the popup is blocked.
 */

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || "";
const GIS_SRC = "https://accounts.google.com/gsi/client";

export function isGoogleConfigured(): boolean {
  return CLIENT_ID.length > 0;
}

export interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string | null;
  emailVerified: boolean;
}

interface GisTokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

interface GisTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GisError {
  type?: string;
  message?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (resp: GisTokenResponse) => void;
            error_callback?: (err: GisError) => void;
          }) => GisTokenClient;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
      return;
    }
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// One token client, reused across clicks. The pending resolve/reject belong to
// the in-flight signInWithGoogle() call; GIS invokes callback/error_callback on
// the same client instance.
let tokenClient: GisTokenClient | null = null;
let pendingResolve: ((token: string) => void) | null = null;
let pendingReject: ((err: Error) => void) | null = null;

function settle(fn: "resolve" | "reject", value: string | Error) {
  const resolve = pendingResolve;
  const reject = pendingReject;
  pendingResolve = null;
  pendingReject = null;
  if (fn === "resolve" && resolve) resolve(value as string);
  if (fn === "reject" && reject) reject(value as Error);
}

function ensureTokenClient(): GisTokenClient | null {
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) return null;
  if (tokenClient) return tokenClient;

  tokenClient = oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "openid email profile",
    prompt: "",
    callback: (resp) => {
      if (resp.error || !resp.access_token) {
        settle("reject", new Error(resp.error_description || resp.error || "Google sign-in was cancelled."));
        return;
      }
      settle("resolve", resp.access_token);
    },
    error_callback: (err) => {
      settle("reject", new Error(describeGisError(err)));
    },
  });
  return tokenClient;
}

function describeGisError(err: GisError): string {
  switch (err.type) {
    case "popup_failed_to_open":
      return "Google's sign-in popup was blocked. Allow popups for this site, then try again.";
    case "popup_closed":
      return "Google sign-in was cancelled.";
    default:
      return err.message || "Google sign-in didn't complete.";
  }
}

/**
 * Start loading the GIS script and building the token client now, so a later
 * click opens the popup without an intervening await. Safe to call repeatedly.
 */
export function preloadGoogle(): void {
  if (!isGoogleConfigured()) return;
  loadGisScript()
    .then(() => { ensureTokenClient(); })
    .catch(() => { /* surfaced on the actual sign-in attempt */ });
}

/**
 * Opens the real Google account chooser and resolves with the chosen account's
 * profile. Rejects if the popup is blocked, the user closes it, or GIS can't load.
 */
export async function signInWithGoogle(): Promise<GoogleProfile> {
  if (!isGoogleConfigured()) {
    throw new Error("Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).");
  }

  // Preload should have handled this already; only awaits on a cold first click.
  if (!window.google?.accounts?.oauth2) {
    await loadGisScript();
  }

  const client = ensureTokenClient();
  if (!client) throw new Error("Google Identity Services unavailable.");
  if (pendingReject) settle("reject", new Error("Google sign-in was cancelled."));

  const accessToken = await new Promise<string>((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    try {
      client.requestAccessToken();
    } catch {
      settle("reject", new Error("Google's sign-in popup was blocked. Allow popups for this site, then try again."));
    }
  });

  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Could not read your Google profile.");
  const data = (await res.json()) as {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
    email_verified?: boolean;
  };

  return {
    sub: data.sub,
    name: data.name ?? "",
    email: data.email ?? "",
    picture: data.picture ?? null,
    emailVerified: Boolean(data.email_verified),
  };
}
