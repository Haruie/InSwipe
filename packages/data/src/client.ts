import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type InswipeClient = SupabaseClient;

export interface ClientConfig {
  url: string;
  key: string;
}

/**
 * One client per app. There is no authentication in the demo — every request goes out
 * as `anon`, which can read everything and write nothing directly; the write path is
 * the security-definer functions in `supabase/migrations/0002_rls_and_rpcs.sql`.
 */
export function createInswipeClient({ url, key }: ClientConfig): InswipeClient {
  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
