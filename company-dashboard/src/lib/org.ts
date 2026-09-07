import { db } from "./db";
import type { CompanyInfo, TeamRole } from "./account";

/**
 * The shared hiring team (organization + members + invites), on Supabase.
 *
 * Every write is one of the security-definer RPCs in
 * supabase/migrations/0005_org_and_team.sql. The 6-digit invite code is e-mailed
 * by the send-code Edge Function; with no email provider configured the code is
 * returned in `devCode` and the accept screen shows it, so the flow still works.
 */

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "Active" | "Pending";
  isOwner: boolean;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface OrgSnapshot {
  ok: boolean;
  orgId: string;
  company: CompanyInfo;
  members: OrgMember[];
}

export interface AcceptResult extends OrgSnapshot {
  /** which member row belongs to the browser that just accepted */
  memberId: string;
}

export interface InviteLookup {
  ok: boolean;
  company: { name: string; logo: string | null };
  role: TeamRole;
  toName: string;
  toEmail: string;
  inviterName: string;
}

export interface ChallengeResult {
  ok: boolean;
  sentTo: string;
  emailed: boolean;
  /** present only when no email provider is configured */
  devCode?: string;
}

export interface InviteResult extends OrgSnapshot {
  sentTo: string;
  emailed: boolean;
  inviteLink: string;
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(res.error.message || `${what} failed`);
  if (res.data == null) throw new Error(`${what} returned nothing`);
  return res.data;
}

/** Deliver a code via the send-code function; false (with the code) if it is not set up. */
async function emailCode(input: {
  to: string;
  code: string;
  kind: "invite" | "verify";
  context?: string;
  inviter?: string;
}): Promise<boolean> {
  try {
    const { error } = await db.functions.invoke("send-code", { body: input });
    return !error;
  } catch {
    return false;
  }
}

export async function createOrg(input: {
  orgId: string;
  company: CompanyInfo;
  owner: { name: string; email: string };
}): Promise<OrgSnapshot> {
  return unwrap(
    await db.rpc("create_org", {
      p_org_id: input.orgId,
      p_company: input.company,
      p_owner_name: input.owner.name,
      p_owner_email: input.owner.email,
    }),
    "create_org",
  ) as OrgSnapshot;
}

export async function fetchOrg(orgId: string): Promise<OrgSnapshot | null> {
  try {
    const [orgRes, memberRes] = await Promise.all([
      db.from("organizations").select("id, company").eq("id", orgId).maybeSingle(),
      db.from("org_members").select("*").eq("org_id", orgId),
    ]);
    if (orgRes.error || !orgRes.data) return null;
    const rows = (memberRes.data ?? []) as Record<string, unknown>[];
    const members: OrgMember[] = rows
      .map((m) => ({
        id: m.id as string,
        name: (m.name as string) ?? "",
        email: (m.email as string) ?? "",
        role: (m.role as TeamRole) ?? "Recruiter",
        status: (m.status as "Active" | "Pending") ?? "Pending",
        isOwner: Boolean(m.is_owner),
        invitedAt: (m.invited_at as string) ?? "",
        acceptedAt: (m.accepted_at as string) ?? null,
      }))
      .sort((a, b) => Number(b.isOwner) - Number(a.isOwner) || a.invitedAt.localeCompare(b.invitedAt));
    return {
      ok: true,
      orgId: orgRes.data.id as string,
      company: (orgRes.data.company ?? {}) as CompanyInfo,
      members,
    };
  } catch {
    return null;
  }
}

export async function pushOrgCompany(orgId: string, company: CompanyInfo): Promise<OrgSnapshot> {
  return unwrap(
    await db.rpc("push_org_company", { p_org_id: orgId, p_company: company }),
    "push_org_company",
  ) as OrgSnapshot;
}

export async function inviteToOrg(input: {
  orgId: string;
  toEmail: string;
  toName: string;
  role: TeamRole;
  inviterName: string;
  appUrl: string;
}): Promise<InviteResult> {
  const res = unwrap(
    await db.rpc("invite_to_org", {
      p_org_id: input.orgId,
      p_to_email: input.toEmail,
      p_to_name: input.toName,
      p_role: input.role,
      p_inviter_name: input.inviterName,
    }),
    "invite_to_org",
  ) as { token: string; memberId: string; snapshot: OrgSnapshot };

  const inviteLink = `${input.appUrl}${input.appUrl.includes("?") ? "&" : "?"}invite=${res.token}`;
  return { ...res.snapshot, sentTo: input.toEmail, emailed: false, inviteLink };
}

export async function setOrgMemberRole(orgId: string, memberId: string, role: TeamRole): Promise<OrgSnapshot> {
  return unwrap(
    await db.rpc("set_org_member_role", { p_org_id: orgId, p_member_id: memberId, p_role: role }),
    "set_org_member_role",
  ) as OrgSnapshot;
}

export async function removeOrgMember(orgId: string, memberId: string): Promise<OrgSnapshot> {
  return unwrap(
    await db.rpc("remove_org_member", { p_org_id: orgId, p_member_id: memberId }),
    "remove_org_member",
  ) as OrgSnapshot;
}

export async function lookupInvite(token: string): Promise<InviteLookup> {
  return unwrap(await db.rpc("lookup_invite", { p_token: token }), "lookup_invite") as InviteLookup;
}

export async function challengeInvite(token: string): Promise<ChallengeResult> {
  const res = unwrap(await db.rpc("challenge_invite", { p_token: token }), "challenge_invite") as {
    ok: boolean;
    sentTo: string;
    code: string;
  };
  const emailed = await emailCode({ to: res.sentTo, code: res.code, kind: "invite" });
  return { ok: true, sentTo: res.sentTo, emailed, devCode: emailed ? undefined : res.code };
}

export async function acceptInvite(token: string, input: { code: string; name: string }): Promise<AcceptResult> {
  const res = unwrap(
    await db.rpc("accept_invite", { p_token: token, p_code: input.code, p_name: input.name }),
    "accept_invite",
  ) as { ok: boolean; memberId: string; snapshot: OrgSnapshot };
  return { ...res.snapshot, memberId: res.memberId };
}
