import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  acceptInvite,
  challengeInvite,
  createOrg,
  fetchOrg,
  inviteToOrg,
  lookupInvite,
  removeOrgMember,
  setOrgMemberRole,
  type ChallengeResult,
  type InviteLookup,
  type OrgMember,
} from "./org";

/**
 * The one place the signed-in company + user live for the whole dashboard.
 *
 * Single-user data (company details, your profile) is kept in localStorage.
 * When an account has an `orgId`, the company + team are also mirrored on
 * Supabase (see lib/org.ts and supabase/migrations/0005_org_and_team.sql) so an
 * invited teammate on another device/tab can accept a link and see the same
 * company and the same team list. The owner's browser is the source of truth;
 * a member's browser reads the org back and polls it.
 */

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  website: string;
  linkedin: string;
  founded: string;
  stage: string;
  industry: string;
  size: string;
  location: string;
  /** data: URL of an uploaded logo, or null to fall back to the initial badge. */
  logo: string | null;
}

export interface UserInfo {
  name: string;
  email: string;
  role: string;
  /** data:/https: URL of an avatar (e.g. from Google), or null for initials. */
  picture: string | null;
}

export type TeamRole = "Admin" | "Recruiter" | "Hiring Manager";
export const TEAM_ROLES: TeamRole[] = ["Admin", "Recruiter", "Hiring Manager"];

export interface AppSettings {
  /** desktop notification when a live applicant arrives */
  newApplicantAlerts: boolean;
  /** desktop notification when a matched candidate messages */
  messageNotifications: boolean;
}

/** Off by default — turning one on prompts the browser for notification permission. */
export const DEFAULT_SETTINGS: AppSettings = {
  newApplicantAlerts: false,
  messageNotifications: false,
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "Active" | "Pending";
  isOwner?: boolean;
  invitedAt: string;
  acceptedAt?: string | null;
}

export interface Account {
  company: CompanyInfo;
  user: UserInfo;
  authMethod: "password" | "google";
  domainVerified: boolean;
  /** Teammates other than "you" (the "you" row is derived from `user`). */
  team: TeamMember[];
  settings: AppSettings;
  /** false until the user finishes signup — the seed is a "logged-in TechNova" demo default. */
  onboarded: boolean;
  /** Set once the org is mirrored on Supabase; null for the local-only seed. */
  orgId: string | null;
  membership: "owner" | "member";
  /** This browser's row in the org (m-owner for the owner). */
  memberId: string | null;
}

const STORAGE_KEY = "inswipe.account.v1";

/** The seed: keeps the existing TechNova / Priya Sharma setup intact for anyone
 *  who signs straight in without going through onboarding. */
export const SEED_ACCOUNT: Account = {
  company: {
    name: "TechNova",
    tagline: "AI infrastructure for developers",
    description:
      "TechNova builds the infrastructure layer that powers next-generation AI applications. Our platform enables Indian and global developers to ship AI features 10× faster with built-in reliability, security, and scale.",
    website: "technova.ai",
    linkedin: "linkedin.com/company/technova",
    founded: "2021, Bangalore",
    stage: "Series B",
    industry: "AI Infrastructure",
    size: "200–400 employees",
    location: "Bangalore, Karnataka",
    logo: null,
  },
  user: {
    name: "Priya Sharma",
    email: "priya@technova.ai",
    role: "Admin",
    picture: null,
  },
  authMethod: "password",
  domainVerified: true,
  team: [],
  settings: DEFAULT_SETTINGS,
  onboarded: false,
  orgId: null,
  membership: "owner",
  memberId: null,
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** "priya@technova.ai" -> "technova.ai" */
export function domainOf(email: string): string {
  return email.trim().split("@")[1]?.toLowerCase() ?? "";
}

function toTeamMember(m: OrgMember): TeamMember {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: m.status,
    isOwner: m.isOwner,
    invitedAt: m.invitedAt,
    acceptedAt: m.acceptedAt,
  };
}

function load(): Account {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ACCOUNT;
    const parsed = JSON.parse(raw) as Partial<Account>;
    return {
      ...SEED_ACCOUNT,
      ...parsed,
      company: { ...SEED_ACCOUNT.company, ...(parsed.company ?? {}) },
      user: { ...SEED_ACCOUNT.user, ...(parsed.user ?? {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return SEED_ACCOUNT;
  }
}

function save(account: Account) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* private mode / quota — the in-memory copy still works for the session */
  }
}

export interface InviteOutcome {
  ok: boolean;
  emailed?: boolean;
  inviteLink?: string;
  error?: string;
}

export type PendingInvite = InviteLookup & { token: string };

interface AccountContextValue {
  account: Account;
  /** True while an ?invite= link is being looked up, or the final accept is running. */
  joining: boolean;
  /** Set if an invite link was invalid or already used. */
  joinError: string | null;
  /** The invite waiting on the accept screen (name + code), or null. */
  pendingInvite: PendingInvite | null;
  /** Email a fresh 6-digit code to the invited address. */
  sendInviteCode: () => Promise<ChallengeResult>;
  /** Verify the code, set the display name, and join the org. */
  completeInvite: (input: { name: string; code: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Abandon the invite and go to the normal landing page. */
  cancelInvite: () => void;
  /** Set (to the company name) when the owner removes this member from the org. */
  removedFrom: string | null;
  dismissRemoved: () => void;
  signUp: (input: {
    companyName: string;
    email: string;
    authMethod?: "password" | "google";
    userName?: string;
    picture?: string | null;
    emailVerified?: boolean;
  }) => void;
  signInWithGoogle: (profile: { name: string; email: string; picture?: string | null }) => void;
  updateCompany: (patch: Partial<CompanyInfo>) => void;
  updateUser: (patch: Partial<UserInfo>) => void;
  setLogo: (dataUrl: string | null) => void;
  setDomainVerified: (verified: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  inviteMember: (input: { name: string; email: string; role: TeamRole }) => Promise<InviteOutcome>;
  updateMember: (id: string, patch: { role: TeamRole }) => void;
  removeMember: (id: string) => void;
  resetAccount: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

function randId() {
  return `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(load);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [removedFrom, setRemovedFrom] = useState<string | null>(null);
  const accountRef = useRef(account);
  accountRef.current = account;
  const lookupStartedRef = useRef(false);

  const stripInviteParam = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("invite");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
  };

  useEffect(() => {
    save(account);
  }, [account]);

  // Multiple tabs on the same browser stay in sync via storage events.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setAccount(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // An ?invite=<token> link: look the invite up (without consuming it) and show
  // the accept screen. The token stays in the URL until the invite is completed
  // so a mid-flow reload still works.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    if (lookupStartedRef.current) return; // StrictMode double-run guard
    lookupStartedRef.current = true;

    setJoining(true);
    (async () => {
      try {
        const info = await lookupInvite(token);
        setPendingInvite({ ...info, token });
      } catch (e) {
        setJoinError((e as Error).message || "Could not open this invite.");
        stripInviteParam();
      } finally {
        setJoining(false);
      }
    })();
  }, []);

  // Owner: keep the server copy of the org (company + owner identity) fresh.
  // createOrg is idempotent — it creates the org the first time and updates the
  // company on later calls. Debounced so a burst of edits is one request.
  useEffect(() => {
    if (!account.orgId || account.membership !== "owner") return;
    const t = setTimeout(() => {
      void createOrg({
        orgId: account.orgId!,
        company: account.company,
        owner: { name: account.user.name, email: account.user.email },
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [account.orgId, account.membership, account.company, account.user.name, account.user.email]);

  // Anyone in an org polls it: the owner sees "Pending" flip to "Active" when an
  // invitee accepts; a member sees company + team edits the owner makes.
  useEffect(() => {
    if (!account.orgId) return;
    let alive = true;

    const tick = async () => {
      const snap = await fetchOrg(account.orgId!);
      if (!snap || !alive) return;

      // A member whose row is gone from the org has been removed by the owner —
      // drop them back to a signed-out state.
      if (
        account.membership === "member" &&
        account.memberId &&
        !snap.members.some((m) => m.id === account.memberId)
      ) {
        setRemovedFrom(account.company.name || "the team");
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setAccount(SEED_ACCOUNT);
        return;
      }

      setAccount((prev) => {
        if (prev.orgId !== snap.orgId) return prev;
        const me = snap.members.find((m) => m.id === prev.memberId);
        const others = snap.members.filter((m) => m.id !== prev.memberId).map(toTeamMember);
        return {
          ...prev,
          // The owner owns the company locally; a member takes the owner's copy.
          company: prev.membership === "member" ? { ...prev.company, ...snap.company } : prev.company,
          user:
            prev.membership === "member" && me
              ? { ...prev.user, name: me.name, email: me.email, role: me.role }
              : prev.user,
          team: others,
        };
      });
    };

    tick();
    const iv = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [account.orgId, account.membership, account.memberId]);

  const value = useMemo<AccountContextValue>(() => {
    const derivedName = (email: string) => {
      const local = email.split("@")[0] ?? "";
      return (
        local
          .split(/[._-]+/)
          .filter(Boolean)
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ") || "Recruiter"
      );
    };

    return {
      account,
      joining,
      joinError,
      pendingInvite,
      removedFrom,
      dismissRemoved: () => setRemovedFrom(null),
      sendInviteCode: async () => {
        if (!pendingInvite) return { ok: false, sentTo: "", emailed: false };
        return challengeInvite(pendingInvite.token);
      },
      completeInvite: async ({ name, code }) => {
        if (!pendingInvite) return { ok: false, error: "No invite in progress." };
        setJoining(true);
        try {
          const res = await acceptInvite(pendingInvite.token, { name, code });
          const me = res.members.find((m) => m.id === res.memberId);
          if (!me) throw new Error("This invite link is invalid or was already used.");
          setAccount({
            company: { ...SEED_ACCOUNT.company, ...res.company },
            user: { name: me.name, email: me.email, role: me.role, picture: null },
            authMethod: "password",
            domainVerified: true,
            team: res.members.filter((m) => m.id !== res.memberId).map(toTeamMember),
            settings: DEFAULT_SETTINGS,
            onboarded: true,
            orgId: res.orgId,
            membership: "member",
            memberId: res.memberId,
          });
          setPendingInvite(null);
          stripInviteParam();
          return { ok: true };
        } catch (e) {
          return { ok: false, error: (e as Error).message };
        } finally {
          setJoining(false);
        }
      },
      cancelInvite: () => {
        setPendingInvite(null);
        stripInviteParam();
      },
      signUp: ({ companyName, email, authMethod = "password", userName, picture, emailVerified }) =>
        setAccount((prev) => {
          const name = userName?.trim() || derivedName(email);
          return {
            ...prev,
            company: { ...prev.company, name: companyName.trim() || prev.company.name },
            user: {
              ...prev.user,
              name,
              email: email.trim(),
              // The person who creates the company owns it — they're the Admin.
              role: "Admin",
              picture: picture ?? prev.user.picture,
            },
            authMethod,
            domainVerified: Boolean(emailVerified),
            onboarded: true,
            // A brand-new account starts its shared org here.
            orgId: prev.orgId ?? randId(),
            membership: "owner",
            memberId: "m-owner",
          };
        }),
      signInWithGoogle: ({ name, email, picture }) =>
        setAccount((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            name: name.trim() || prev.user.name,
            email: email.trim() || prev.user.email,
            picture: picture ?? prev.user.picture,
          },
          authMethod: "google",
        })),
      updateCompany: (patch) =>
        setAccount((prev) => ({ ...prev, company: { ...prev.company, ...patch } })),
      updateUser: (patch) => setAccount((prev) => ({ ...prev, user: { ...prev.user, ...patch } })),
      setLogo: (dataUrl) =>
        setAccount((prev) => ({ ...prev, company: { ...prev.company, logo: dataUrl } })),
      setDomainVerified: (verified) => setAccount((prev) => ({ ...prev, domainVerified: verified })),
      updateSettings: (patch) =>
        setAccount((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),

      inviteMember: async ({ name, email, role }) => {
        const a = accountRef.current;
        if (a.membership !== "owner") {
          return { ok: false, error: "Only an admin can invite teammates." };
        }
        try {
          // Someone who signed straight into the demo has no shared org yet — create
          // one on Supabase now, so the invite is real rather than a local placeholder.
          let orgId = a.orgId;
          if (!orgId) {
            orgId = randId();
            await createOrg({
              orgId,
              company: a.company,
              owner: { name: a.user.name, email: a.user.email },
            });
            setAccount((prev) => ({ ...prev, orgId, membership: "owner", memberId: "m-owner" }));
          }

          const res = await inviteToOrg({
            orgId,
            toEmail: email.trim(),
            toName: name.trim(),
            role,
            inviterName: a.user.name,
            appUrl: window.location.origin,
          });
          setAccount((prev) => ({
            ...prev,
            orgId,
            membership: "owner",
            memberId: prev.memberId ?? "m-owner",
            team: res.members.filter((m) => m.id !== (prev.memberId ?? "m-owner")).map(toTeamMember),
          }));
          return { ok: true, emailed: res.emailed, inviteLink: res.inviteLink };
        } catch (e) {
          return { ok: false, error: (e as Error).message };
        }
      },

      updateMember: (id, patch) => {
        setAccount((prev) => ({
          ...prev,
          team: prev.team.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }));
        const a = accountRef.current;
        if (a.orgId && a.membership === "owner") void setOrgMemberRole(a.orgId, id, patch.role).catch(() => {});
      },

      removeMember: (id) => {
        setAccount((prev) => ({ ...prev, team: prev.team.filter((m) => m.id !== id) }));
        const a = accountRef.current;
        if (a.orgId && a.membership === "owner") void removeOrgMember(a.orgId, id).catch(() => {});
      },

      resetAccount: () => {
        const a = accountRef.current;
        // A member leaving also gives up their seat on the shared org.
        if (a.membership === "member" && a.orgId && a.memberId) {
          void removeOrgMember(a.orgId, a.memberId).catch(() => {});
        }
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setAccount(SEED_ACCOUNT);
      },
    };
  }, [account, joining, joinError, pendingInvite, removedFrom]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within <AccountProvider>");
  return ctx;
}
