import { SYNC_URL } from "./sync";
import type { CompanyInfo, TeamRole } from "./account";

/**
 * The shared org (company + team) on the local sync server. The owner's browser
 * creates it and is the source of truth for the company and who's invited;
 * invitees accept a token link and then read the same org back and poll it.
 *
 * Every response that carries the org uses this shape.
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
  /** present only when no mail server is configured */
  devCode?: string;
}

export interface InviteResult extends OrgSnapshot {
  sentTo: string;
  emailed: boolean;
  inviteLink: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${SYNC_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export function createOrg(input: {
  orgId: string;
  company: CompanyInfo;
  owner: { name: string; email: string };
}): Promise<OrgSnapshot> {
  return post<OrgSnapshot>("/api/org/create", input);
}

export async function fetchOrg(orgId: string): Promise<OrgSnapshot | null> {
  try {
    const res = await fetch(`${SYNC_URL}/api/org?id=${encodeURIComponent(orgId)}`);
    if (!res.ok) return null;
    return (await res.json()) as OrgSnapshot;
  } catch {
    return null;
  }
}

export function pushOrgCompany(orgId: string, company: CompanyInfo): Promise<OrgSnapshot> {
  return post<OrgSnapshot>("/api/org/company", { orgId, company });
}

export function inviteToOrg(input: {
  orgId: string;
  toEmail: string;
  toName: string;
  role: TeamRole;
  inviterName: string;
  appUrl: string;
}): Promise<InviteResult> {
  return post<InviteResult>("/api/org/invite", input);
}

export function setOrgMemberRole(orgId: string, memberId: string, role: TeamRole): Promise<OrgSnapshot> {
  return post<OrgSnapshot>("/api/org/member", { orgId, memberId, role });
}

export function removeOrgMember(orgId: string, memberId: string): Promise<OrgSnapshot> {
  return post<OrgSnapshot>("/api/org/member/remove", { orgId, memberId });
}

export function lookupInvite(token: string): Promise<InviteLookup> {
  return post<InviteLookup>("/api/org/invite/lookup", { token });
}

export function challengeInvite(token: string): Promise<ChallengeResult> {
  return post<ChallengeResult>("/api/org/invite/challenge", { token });
}

export function acceptInvite(token: string, input: { code: string; name: string }): Promise<AcceptResult> {
  return post<AcceptResult>("/api/org/accept", { token, code: input.code, name: input.name });
}
