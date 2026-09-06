import { createInswipeClient } from '@inswipe/data';

/**
 * The account the demo signs in as when someone takes the Google or LinkedIn shortcut
 * on the auth screen. Anika is the student the seeded dataset is built around, so those
 * two buttons land in a populated app rather than an empty one.
 *
 * Signing up with the form creates a real account instead — `create_student()` — and the
 * app then runs as that student. Every query is scoped by id, so the two paths are the
 * same code with a different id in it.
 */
export const DEMO_STUDENT_ID = 'anika-sharma';

export const db = createInswipeClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
