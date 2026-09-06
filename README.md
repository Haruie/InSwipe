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
| **Company dashboard (code)** | **Built and running — [`company-dashboard/`](company-dashboard)** |
| **Shared fit engine** | **Both apps read [`packages/core/`](packages/core)** |
| **Database** | **Supabase — one dataset, both apps. [`supabase/`](supabase)** |
| Auth | Not started — one hard-coded student, one hard-coded company |

Both apps are working React apps, not click-throughs, and they now read and write **the
same Supabase database**. A student applying on the phone appears in the recruiter's
ranked list within seconds, and a recruiter selecting them unlocks that student's inbox
for real. Nothing about the flow is simulated any more.

---

## Run it

First time only — install dependencies and point both apps at Supabase:

```bash
npm install --prefix packages/data && npm install --prefix student-app && npm install --prefix company-dashboard
```

Then copy `.env.example` to `.env` in **both** apps and paste the project's publishable
(anon) key into each. Same project, same key, both files — that is the point.

If the database is empty, apply the three files in
[`supabase/migrations/`](supabase/migrations) in order, in the Supabase SQL editor. See
[`supabase/README.md`](supabase/README.md).

On Windows, `start.bat` in the repo root brings up both apps, each in its own window, and
`stop.bat` shuts them both down.

Or run either one on its own:

```bash
cd student-app
npm run dev
```

Open http://localhost:5173. On a laptop it renders in a 390×844 device frame; on a phone
it fills the screen — the terminal prints a Network address you can open on your phone
over the same Wi-Fi.

There is no longer a "simulate selection" button, because there is nothing left to
simulate: the inbox unlocks when a recruiter selects you in the other app. The student app
polls Supabase every four seconds, so the celebration fires while you are watching.

The company dashboard:

```bash
cd company-dashboard
npm run dev
```

Open http://localhost:8443. See [`company-dashboard/README.md`](company-dashboard/README.md).

---

## The demo, end to end

Run both apps side by side.

1. **Student applies.** Swipe right on a TechNova role in the deck. `apply_to_job()`
   writes an `applications` row, with the fit score as it stood.
2. **Dashboard sees the applicant.** Within four seconds Anika Sharma appears in
   TechNova's ranked list for that role, with her *Fits* and *Lacks* computed live.
3. **Recruiter selects.** Open her drawer, hit **Select candidate**, edit the drafted
   opening message and send. One transaction writes the `selections` row, the
   conversation hanging off it, and that first message.
4. **The student's inbox unlocks.** The padlock becomes a thread, the celebration
   overlay fires, and the recruiter's message is already in it.
5. **Both sides talk.** A reply from either app lands in the other within four seconds.

To run it again, restore the dataset — from either app, without leaving the demo:

- **Student app** → Profile tab → *Reset demo data*
- **Company dashboard** → Settings → Demo → *Reset demo*

Both confirmations offer to sign out too, for a run-through that starts from onboarding, and
both apps reload onto the restored data whichever one you use. The same reset from a terminal:

```bash
node scripts/demo.mjs reset
```

`node scripts/demo.mjs check` prints what is in the database without changing anything.

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
supabase/                 the database — start at supabase/README.md
  migrations/0001_...       tables, and the two rules the database itself enforces
  migrations/0002_...       read-only RLS, and every write as a function
  migrations/0003_...       the demo dataset, and demo_reset() to restore it
packages/core/            the shared domain — read this first
  src/types.ts            domain types both surfaces use
  src/fit.ts              the fit engine, one copy, two voices
packages/data/            the Supabase layer both apps import
  src/queries.ts          loadCatalog / loadStudentWorkspace / loadCompanyWorkspace
  src/mutations.ts        every write, all of them RPCs
  src/map.ts              rows to core types, plus the shared time formatting
student-app/              the working student app
  src/lib/db.ts           the client, and which student is signed in
  src/data/catalog.ts     companies and jobs, loaded once at boot
  src/lib/fit.ts          student-voiced adapter over packages/core
  src/store.tsx           reducer, plus the write each action fires
  src/screens/            one file per flow
company-dashboard/        the working company dashboard
  src/lib/db.ts           the client, and which company is signed in
  src/data/store.tsx      the workspace, the polling, and the selection gate
  src/data/candidates.ts  applicant rows derived by running computeFit()
  src/lib/fit.ts          company-voiced adapter over packages/core
  src/pages/              one file per screen (Dashboard, Applicants, Pipeline, ...)
```

Read [`CLAUDE.md`](CLAUDE.md) first — especially **§3 Hard rules** and **§5 The fit score**.
Those are the decisions everything else follows from.

---

## Next up

1. **Auth** — one student and one company are hard-coded. RLS is read-for-everyone until
   there is a signed-in user to scope it to; every query is already scoped by id.
2. **Real AI** — resume parsing, the fit reasoning and the resume summary are still
   generated from the profile rather than by a model. The shapes will not move: the API
   returns `FitScore` from `packages/core` unchanged.
3. **Realtime instead of polling** — both apps poll every four seconds. Supabase realtime
   on `conversations` and `applications` would make it instant.
4. **Next.js for the dashboard** — `CLAUDE.md` §10 calls for it; this is still a Vite SPA.

## Known gaps

Things that look interactive but are not wired up yet — worth knowing before you demo it:

- No authentication; the student and the company are both hard-coded.
- Profile edits in the student app stay local; they are not written back to Supabase.
- Posting a job from the dashboard modal does not create a row yet.
- Resume upload is simulated — no file is actually read.
- Impressions and apply rate on the analytics page are illustrative. Every other number
  on that page is derived from real rows.
- No typing indicator in chat, and the company never auto-replies.
