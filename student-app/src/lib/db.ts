import { createInswipeClient } from '@inswipe/data';

/**
 * The demo has one student. When authentication lands this becomes the signed-in user,
 * and nothing else in the app has to change — every query is already scoped by id.
 */
export const DEMO_STUDENT_ID = 'anika-sharma';

export const db = createInswipeClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
