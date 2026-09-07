/**
 * Emails a 6-digit code — team invites (0005) and work-email verification (0006).
 *
 * It exists as a function for the same reason as parse-resume: the provider
 * credential. The database mints the code (in challenge_invite / verify_domain_start);
 * the client posts it here to be delivered. Nothing is stored.
 *
 * Delivery is plain SMTP (nodemailer-style), so a normal mailbox — a Gmail
 * account with 2FA and an App Password — can send the code to ANY recipient on
 * ANY domain. No sending-domain verification, no email-provider account.
 *
 * Without SMTP_USER / SMTP_PASS the function answers 503 { error: "not_configured" }
 * and the dashboard falls back to showing the code on screen, so a checkout of
 * this repo with no secrets still demos the flow.
 *
 *   Project Settings -> Edge Functions -> Secrets -> add:
 *     SMTP_HOST   smtp.gmail.com            (default; any SMTP host works)
 *     SMTP_PORT   465                       (default; 587 also works — STARTTLS)
 *     SMTP_USER   you@gmail.com
 *     SMTP_PASS   your 16-char App Password  https://myaccount.google.com/apppasswords
 *     SMTP_FROM   "InSwipe <you@gmail.com>" (optional; defaults to SMTP_USER)
 *   supabase functions deploy send-code
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
  /** invite only: the join link, e-mailed straight to the invitee */
  link?: string;
  kind?: "invite" | "verify";
  /** invite: the team name; verify: the company name */
  context?: string;
  /** invite only: who sent it */
  inviter?: string;
}

const HOST = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
const PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
const USER = Deno.env.get("SMTP_USER") ?? "";
// App passwords are often shown in "abcd efgh ijkl mnop" groups — strip the spaces.
const PASS = (Deno.env.get("SMTP_PASS") ?? "").replace(/\s+/g, "");
const FROM = Deno.env.get("SMTP_FROM") || USER;

function message({ code, link, kind, context, inviter }: Payload) {
  const safe = (code ?? "").replace(/[^0-9]/g, "").slice(0, 6);
  if (kind === "verify") {
    return {
      subject: `Your InSwipe verification code: ${safe}`,
      text: `Confirm this address for ${context || "your company"} on InSwipe.\n\nYour code is ${safe}. It expires when you request a new one.\n\nIf you did not start this, you can ignore this email.`,
    };
  }

  const team = context || "their team";
  const who = inviter || "Someone";

  // Invite with a join link — the primary path. The link opens the accept page,
  // which e-mails a fresh 6-digit code to confirm the address.
  if (link) {
    const codeLine = safe ? `\n\nYour code, if the page asks for one: ${safe}` : "";
    return {
      subject: `${who} invited you to join ${team} on InSwipe`,
      text: `${who} invited you to join ${team} on InSwipe.\n\nOpen this link to join:\n${link}${codeLine}\n\nIf you were not expecting this, you can ignore this email.`,
    };
  }

  return {
    subject: `Your InSwipe invite code: ${safe}`,
    text: `${who} invited you to join ${team} on InSwipe.\n\nYour code is ${safe}. Enter it on the invite page to join.\n\nIf you were not expecting this, you can ignore this email.`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!USER || !PASS) {
    return json({ error: "not_configured", message: "SMTP_USER / SMTP_PASS are not set on this project." }, 503);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad_request", message: "Expected a JSON body." }, 400);
  }

  const to = (payload.to ?? "").trim();
  if (!to || !to.includes("@")) return json({ error: "bad_request", message: "A recipient email is required." }, 400);

  const hasLink = typeof payload.link === "string" && /^https?:\/\//.test(payload.link);
  if (!hasLink && !/^\d{6}$/.test((payload.code ?? "").trim())) {
    return json({ error: "bad_request", message: "A 6-digit code or an invite link is required." }, 400);
  }

  const { subject, text } = message(payload);

  const client = new SMTPClient({
    connection: {
      hostname: HOST,
      port: PORT,
      // 465 = implicit TLS; anything else (e.g. 587) upgrades with STARTTLS.
      tls: PORT === 465,
      auth: { username: USER, password: PASS },
    },
  });

  try {
    await client.send({ from: FROM, to, subject, content: text });
    await client.close();
  } catch (err) {
    console.error("[send-code] SMTP send failed", err instanceof Error ? err.message : err);
    try {
      await client.close();
    } catch {
      /* already closed */
    }
    return json({ error: "provider_error", message: "The mail server rejected the request." }, 502);
  }

  return json({ ok: true, sentTo: to });
});
