# InSwipe

> AI-powered internship matchmaking. Students swipe. Companies choose. The AI explains why.

An internship platform with two surfaces: a **student mobile app** and a **company web
dashboard**. Students discover roles by swiping through a deck ordered best-fit-first.
Companies post jobs and review a ranked list of everyone who applied. An AI scores every
student–job pair and explains the score in both directions — what the student brings, and
what they lack.

**A student's inbox stays locked until a company selects them.** That rule is the spine of
the product.

---

## Where we stand

| Piece | Status |
|---|---|
| Product spec | Done — [`CLAUDE.md`](CLAUDE.md) |
| Student app designs | Done — [Figma Make](https://dun-rival-31434366.figma.site) |
| Company designs | Dashboard screen only — [Figma Make](https://chisel-thumb-04330911.figma.site) |
| **Student app (code)** | **Built and running — [`student-app/`](student-app)** |
| **Company dashboard (code)** | **Built and running (mock data) — [`company-dashboard/`](company-dashboard)** |
| **Shared fit engine** | **Both apps read [`packages/core/`](packages/core)** |
| Backend / database | Not started |

The student app is a working React app, not a click-through. State is real: the deck
re-ranks itself, applying writes an application, the inbox genuinely locks and unlocks.

---

## Run it

```bash
cd student-app
npm install
npm run dev
```

Open http://localhost:5173. On a laptop it renders in a 390×844 device frame; on a phone
it fills the screen — the terminal prints a Network address you can open on your phone
over the same Wi-Fi.

**Bottom-right of the window there's a "Demo: simulate selection" button.** It stands in
for the company dashboard: it marks your most recent application as selected, writes the
company's opening message, unlocks the inbox and fires the celebration. Without it the
payoff screens are unreachable, because nothing else in the student app is allowed to
create a selection.

To run the company dashboard instead:

```bash
cd company-dashboard
npm install
npm run dev
```

Open http://localhost:8443. See [`company-dashboard/README.md`](company-dashboard/README.md).

---

## The fit score is real, and there is only one of it

[`packages/core/src/fit.ts`](packages/core/src/fit.ts) computes every percentage from the
student's profile against the job. Nothing is hardcoded — change a skill and every score in
**both apps** moves. The company dashboard no longer carries fit numbers of its own; its
applicant rows are derived from the same `computeFit()` call the student app runs.

| Dimension | Weight |
|---|---:|
| Required skills coverage | 40% |
| Project & experience evidence | 20% |
| Preferences (mode, location, stipend) | 15% |
| Preferred skills coverage | 10% |
| Role interest | 10% |
| Availability | 5% |

Required-skill coverage is weighted by **evidence strength**: a skill shipped in a project
counts full, a self-declared one with nothing behind it counts 0.6. Skills are also derived
from project tech, so PostgreSQL counts for our test student because her MediTrack project
uses it even though she never listed it. That's the defence against padded skill lists, and
it's why projects matter to the product.

`computeFit()` returns the object **both products** read: score, four-part breakdown,
matched factors with plain-language reasons, and gaps with actionable hints.

The two apps differ only in voice. `createFitEngine({ voice })` picks the wording; the score
is identical either way. Each app builds one engine and passes its own per-skill hints:

| | Student app | Company dashboard |
|---|---|---|
| Fit row | *React — used in MediTrack and SketchSync. It is a core requirement here.* | *React — 2 shipped projects using it. Core requirement, evidenced.* |
| Gap row | *Docker — preferred, not required. A weekend project would cover it.* | *Docker — not evidenced. Listed as preferred, so it is low risk.* |

---

## Repo layout

```
CLAUDE.md               product spec, hard rules, fit rubric, data model
figma-prompts.md        screen-by-screen design spec
figma-build-guide.md    paste-by-paste Figma Make prompts
packages/core/          the shared layer — read this first
  src/types.ts          domain types both surfaces use
  src/fit.ts            the fit engine, one copy, two voices
student-app/            the working student app
  src/data/             companies, jobs, the student — mock data, no UI
  src/lib/fit.ts        student-voiced adapter over packages/core
  src/lib/note.ts       AI note drafting, company opening message
  src/store.tsx         reducer, navigation stack, selectors
  src/components/       PhoneFrame, BottomNav, Icons, ui primitives
  src/screens/          one file per flow
company-dashboard/      the working company dashboard
  src/data/students.ts   applicants as real Student profiles — no fit numbers
  src/data/jobs.ts       TechNova and its three postings
  src/data/mock.ts       derives applicant rows by running computeFit()
  src/lib/fit.ts         company-voiced adapter over packages/core
  src/pages/             one file per screen (Dashboard, Applicants, Pipeline, ...)
  src/components/        cards, drawers, modals shared across pages
```

Read [`CLAUDE.md`](CLAUDE.md) first — especially **§3 Hard rules** and **§5 The fit score**.
Those are the decisions everything else follows from.

---

## Next up

1. **Persistence** — state is in memory, so a reload resets the demo.
2. **Backend** — schema, auth, and the selection gate. See `CLAUDE.md` §9. The rule to
   enforce at the database level: a conversation cannot exist without a `selections` row.
   The API should return `FitScore` from `packages/core` unchanged, so neither UI moves.
3. **One selection, both apps** — selecting in the dashboard still only updates its own
   state. Unlocking the student's inbox for real needs the backend above.
4. **Next.js for the dashboard** — `CLAUDE.md` §10 calls for it; this is still a Vite SPA.

## Known gaps in the student app

Things that look interactive but aren't yet — worth knowing before you demo it:

- No persistence; a reload resets everything.
- Resume upload is simulated — no file is actually read.
- The "Add a photo" control on onboarding does nothing.
- No typing indicator in chat, and the company never auto-replies.
