import { db } from "./db";

/**
 * Work-email (domain) verification, on Supabase.
 *
 * verify_domain_start / verify_domain_check are the security-definer RPCs in
 * supabase/migrations/0006_domain_verification.sql. The 6-digit code is e-mailed
 * by the send-code Edge Function; with no email provider configured it comes back
 * in `devCode` and the onboarding screen shows it, so the flow still works.
 */

export interface StartResult {
  ok: boolean;
  /** present only when no email provider is configured */
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
    const { data, error } = await db.rpc("verify_domain_start", { p_email: email, p_company: company });
    if (error) return { ok: false, sentTo: "", error: error.message || "Could not start verification." };
    const res = data as { sentTo: string; code: string };

    let emailed = false;
    try {
      const invoke = await db.functions.invoke("send-code", {
        body: { to: email, code: res.code, kind: "verify", context: company },
      });
      emailed = !invoke.error;
    } catch {
      emailed = false;
    }

    return { ok: true, sentTo: res.sentTo, devCode: emailed ? undefined : res.code };
  } catch {
    return { ok: false, sentTo: "", error: "Could not reach the verification service." };
  }
}

export async function checkDomainVerification(email: string, code: string): Promise<CheckResult> {
  try {
    const { data, error } = await db.rpc("verify_domain_check", { p_email: email, p_code: code });
    if (error) return { ok: false, verified: false, error: error.message || "That code didn't match." };
    return { ok: true, verified: Boolean((data as { verified: boolean }).verified) };
  } catch {
    return { ok: false, verified: false, error: "Could not reach the verification service." };
  }
}
