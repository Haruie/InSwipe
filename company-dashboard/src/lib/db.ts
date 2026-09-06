import { createInswipeClient } from '@inswipe/data';

/**
 * The demo dashboard is TechNova's. When work-email verification lands this becomes the
 * signed-in recruiter's company, and every query here is already scoped by it.
 */
export const DEMO_COMPANY_ID = 'technova';

export const db = createInswipeClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
