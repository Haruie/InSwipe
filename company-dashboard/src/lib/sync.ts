/**
 * Base URL for the legacy local sync server. Team invites (lib/org.ts) and work-email
 * verification (lib/verify.ts) still call it; both fail gracefully when it is not
 * running. These two flows move onto Supabase RPCs + an email Edge Function in a
 * follow-up — see supabase/migrations/0005_org_and_team.sql (planned).
 *
 * The live-candidate bridge this file used to hold is gone: the dashboard now reads
 * real student applications straight from Supabase (data/store.tsx).
 */
export const SYNC_URL = `${window.location.protocol}//${window.location.hostname}:4400`;
