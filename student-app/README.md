# InSwipe — Student App

The student mobile app, wired together from the Figma Make designs into one working
application. Vite + React + TypeScript + Tailwind, mock data only, no backend.

```bash
npm install
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
- **The inbox is genuinely locked** until a selection exists. There is no way to open a
  conversation without one.
- **Sending a message** appends to that conversation and persists across navigation.
- **The learning list** aggregates real gaps across the jobs actually applied to, ranked
  by demand.

State lives in memory, so a page reload resets the demo. That is deliberate for now.

## The demo button

Bottom-right of the window, outside the phone: **Demo: simulate selection**.

This stands in for the company dashboard. It picks the most recent application, marks it
selected, creates the conversation with the company's opening message, unlocks the inbox
and fires the celebration overlay. Without it there is no way to reach the payoff screens,
since nothing else in the student app is allowed to create a selection.

When the two products share a backend, this button is replaced by a `selections` row
written by the company side. Nothing else changes.

## Structure

```
src/
  data/          types, companies, jobs, the student — mock data, no UI
  lib/fit.ts     the fit-score engine (weights from CLAUDE.md §5)
  lib/note.ts    AI note drafting and the company's opening message
  store.tsx      reducer, navigation stack, selectors
  components/    PhoneFrame, BottomNav, AppHeader, Icons, ui primitives
  screens/       one file per flow
```

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

Swapping mock data for a real API means replacing the body of `computeFit` — no component
changes.

## Screens

Splash · intro carousel · sign up/in · profile fork · resume upload → parsing → review ·
manual profile (4 steps) · discover with drag states, empty, filter · job detail · fit
breakdown · application note · applied confirmation · company profile · applications ·
application detail with timeline · saved · locked inbox · inbox · chat · selection
celebration · profile · learning list · notifications.

## Known gaps

- No persistence — reload resets everything.
- The resume upload is simulated; no file is read.
- Profile edit mode toggles but most fields aren't editable inline yet.
- No real auth; any sign-in path lands in the app.
