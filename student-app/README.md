# InSwipe — Student App

The student mobile app, wired together from the Figma Make designs into one working
application. Vite + React + TypeScript + Tailwind, reading and writing the same Supabase
database as the company dashboard.

```bash
npm install
cp .env.example .env   # then paste the project's publishable (anon) key
npm run dev
```

Then open http://localhost:5173. On a laptop it renders inside a 390×844 device frame;
on a phone it fills the screen. The terminal prints a Network address you can open on
your phone if it's on the same Wi-Fi.

## What actually works

This is not a click-through of static screens. State is real:

- **The deck is sorted by a computed fit score**, not a hardcoded number. Change Anika's
  skills in the profile and every score in the app moves.
- **Swipe or tap** — drag past 100px either way, or use the Pass / Save / Apply buttons.
- **Applying** opens the note sheet, adds a real application, removes the job from the
  deck and updates every counter.
- **Saving** adds to the Saved tab; removing it there brings back the empty state.
- **The inbox is genuinely locked** until a selection exists — and the lock is the
  database's, not this app's. No client can create a conversation without one.
- **Sending a message** writes it, and the recruiter sees it in the other app.
- **The learning list** aggregates real gaps across the jobs actually applied to, ranked
  by demand.

Everything survives a reload, because none of it lives in this process.

## There is no demo button any more

There used to be a "simulate selection" control here, standing in for the company
dashboard. It is gone, because the company dashboard is now real: open it at
http://localhost:8443, find Anika Sharma in TechNova's applicant list and select her.

This app polls Supabase every four seconds, so within a few seconds of that the padlock
becomes a thread, the celebration overlay fires, and the recruiter's opening message is
already waiting in it.

## Structure

```
src/
  lib/db.ts        the Supabase client, and which student is signed in
  data/catalog.ts  companies and jobs, loaded once before the app mounts
  data/student.ts  gap hints — copy, not data
  lib/fit.ts       the student-voiced adapter over the shared engine
  lib/note.ts      AI note drafting
  store.tsx        reducer, navigation stack, and the write each action fires
  components/      PhoneFrame, BottomNav, AppHeader, Icons, ui primitives
  screens/         one file per flow
```

Every read and write goes through [`packages/data`](../packages/data). The reducer stays
pure: `dispatch` applies the optimistic state change, fires the matching RPC, then re-reads
the workspace so the screen and the database agree.

### The fit engine

`lib/fit.ts` computes every score from the student and the job. Weights:

| Dimension | Weight |
|---|---:|
| Required skills coverage | 40% |
| Project & experience evidence | 20% |
| Preferences (mode, location, stipend) | 15% |
| Preferred skills coverage | 10% |
| Role interest | 10% |
| Availability | 5% |

Required-skill coverage is weighted by **evidence strength** — a skill demonstrated in a
project counts full, a declared one with nothing behind it counts 0.6. `heldSkills()`
also derives skills from project tech and internship summaries, so PostgreSQL counts for
Anika because MediTrack uses it, even though she never listed it.

`computeFit()` returns the object both products are meant to read: score, four-part
breakdown, matched factors with plain-language reasons, and gaps with actionable hints.
The student app renders it as *what you bring / what to work on*. The company app will
render the same rows as *what they bring / what they lack*.

Profiles and jobs come from Supabase; the score never does. Swapping the heuristic for a
real model means replacing the body of `computeFit` — no component changes, and no schema
changes either, because no score is stored.

## Screens

Splash · intro carousel · sign up/in · profile fork · resume upload → parsing → review ·
manual profile (4 steps) · discover with drag states, empty, filter · job detail · fit
breakdown · application note · applied confirmation · company profile · applications ·
application detail with timeline · saved · locked inbox · inbox · chat · selection
celebration · profile · learning list · notifications.

## Known gaps

- No real auth; any sign-in path lands in the app as `anika-sharma`.
- Profile edits stay in this process — they are not written back to Supabase, so the
  recruiter still sees the stored profile.
- The resume upload is simulated; no file is read.
- Polling, not realtime: a selection can take up to four seconds to show up.
