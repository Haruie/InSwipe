import { SYNC_URL } from "./sync";

/**
 * Domain-verification calls against the local sync server. The server sends a
 * real 6-digit code by email when SMTP is configured (see sync-server/.env);
 * with no SMTP set it returns the code in `devCode` and logs it, so the flow
 * still works offline.
 */

export interface StartResult {
  ok: boolean;
  /** present only when the server has no SMTP configured */
  devCode?: string;
  /** address the mail was (or would be) sent to, e.g. verify@technova.ai */
  sentTo: string;
  error?: string;
}

export interface CheckResult {
  ok: boolean;
  verified: boolean;
  error?: string;
}

export async function startDomainVerification(email: string, company: string): Promise<StartResult> {
  try {
    const res = await fetch(`${SYNC_URL}/api/verify/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company }),
    });
    const data = (await res.json()) as StartResult;
    if (!res.ok) return { ok: false, sentTo: "", error: data.error || "Could not send the verification email." };
    return data;
  } catch {
    return {
      ok: false,
      sentTo: "",
      error: `Could not reach the verification service at ${SYNC_URL}. Is the sync server running? (cd sync-server && npm start)`,
    };
  }
}

export async function checkDomainVerification(email: string, code: string): Promise<CheckResult> {
  try {
    const res = await fetch(`${SYNC_URL}/api/verify/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = (await res.json()) as CheckResult;
    if (!res.ok) return { ok: false, verified: false, error: data.error || "That code didn't match." };
    return data;
  } catch {
    return { ok: false, verified: false, error: "Could not reach the verification service." };
  }
}
