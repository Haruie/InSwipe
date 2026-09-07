/**
 * Emails a 6-digit code — team invites (0005) and work-email verification (0006).
 *
 * It exists as a function for the same reason as parse-resume: the provider key.
 * The database mints the code (in challenge_invite / verify_domain_start); the
 * client posts it here to be delivered. Nothing is stored.
 *
 * Without RESEND_API_KEY the function answers 503 { error: "not_configured" } and
 * the dashboard falls back to showing the code on screen, so a checkout of this
 * repo with no key still demos the flow.
 *
 *   Project Settings -> Edge Functions -> Secrets -> add RESEND_API_KEY
 *   (optional) SEND_CODE_FROM  e.g. "InSwipe <team@yourdomain.com>"
 *   supabase functions deploy send-code
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

interface Payload {
  to?: string;
  code?: string;
  kind?: "invite" | "verify";
  /** invite: the team name; verify: the company name */
  context?: string;
  /** invite only: who sent it */
  inviter?: string;
}

const FROM = Deno.env.get("SEND_CODE_FROM") ?? "InSwipe <onboarding@resend.dev>";

function body({ code, kind, context, inviter }: Payload) {
  const safe = (code ?? "").replace(/[^0-9]/g, "").slice(0, 6);
  if (kind === "verify") {
    return {
      subject: `Your InSwipe verification code: ${safe}`,
      text: `Confirm this address for ${context || "your company"} on InSwipe.\n\nYour code is ${safe}. It expires when you request a new one.\n\nIf you did not start this, you can ignore this email.`,
    };
  }
  return {
    subject: `Your InSwipe invite code: ${safe}`,
    text: `${inviter || "Someone"} invited you to join ${context || "their team"} on InSwipe.\n\nYour code is ${safe}. Enter it on the invite page to join.\n\nIf you were not expecting this, you can ignore this email.`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return json({ error: "not_configured", message: "RESEND_API_KEY is not set on this project." }, 503);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_request", message: "Expected a JSON body." }, 400);
  }

  const to = (payload.to ?? "").trim();
  if (!to || !to.includes("@")) return json({ error: "bad_request", message: "A recipient email is required." }, 400);
  if (!/^\d{6}$/.test((payload.code ?? "").trim())) {
    return json({ error: "bad_request", message: "A 6-digit code is required." }, 400);
  }

  const { subject, text } = body(payload);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[send-code] provider rejected", res.status, detail);
    return json({ error: "provider_error", message: "The email provider rejected the request." }, 502);
  }

  return json({ ok: true, sentTo: to });
});
