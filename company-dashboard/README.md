# InSwipe — Company Dashboard

The company web dashboard: post roles, review a ranked list of everyone who applied, and
see why the AI thinks each candidate fits. Vite + React + TypeScript + Tailwind CSS v4,
mock data only, no backend.

Fit scores come from [`packages/core`](../packages/core) — the same engine the student app
runs. Nothing on this side hand-sets a percentage.

```bash
npm install
npm run dev
```

Then open http://localhost:8443.

## What's here

Landing page, company sign-up/onboarding, and the full dashboard shell:

`Dashboard` · `My Jobs` · `Applicants` · `Pipeline` · `Inbox` · `Analytics` ·
`Company Profile` · `Settings`

Per **CLAUDE.md §3**, companies never swipe — no card deck anywhere on this side. The
Applicants screen is a ranked, filterable list with a fit score per candidate, a
skill-by-skill "what they bring / what they lack" breakdown, and a select-and-message
flow. Posting a job is a multi-step form with a live phone preview of how the listing
will look to a student. Settings includes a working team-invite flow (add/remove members,
change roles).

## How the data layer works

`src/data/students.ts` holds each applicant as a real `Student` — the same shape the
student app writes. It carries no scores. `src/data/mock.ts` runs `computeFit(student, job)`
over those profiles and builds the rows the pages render, then ranks by the result. Edit a
student's skills or projects and the score, the ordering, the "Fits" and "Lacks" rows and
the breakdown bars all move together.

`src/lib/fit.ts` configures the shared engine for this audience: company voice, recruiter
hints, and more rows than a phone card shows.

## Known gaps against the product spec

- **Not on Next.js.** `CLAUDE.md` calls for Next.js for this surface; this is a Vite SPA.
  Works fine standalone, but would need a migration to match the spec's stack exactly.
- **Styling is half Tailwind, half inline `style` objects** — a leftover from the Figma Make
  export. Worth normalising before this grows.
- **No selection → inbox wiring across apps.** Selecting a candidate here updates local
  state and drops them into this app's own Inbox; it doesn't reach into `student-app`'s
  data to actually unlock that student's inbox, since the two apps don't share a backend
  yet (see `CLAUDE.md` §9).
- **Only the Frontend Engineering Intern role has applicants.** The other two postings show
  counts but have no `Applicant` rows behind them.
- Resume viewing, ATS/Slack/Calendar integrations, and email delivery are all
  simulated — no files are read, no third-party accounts are ever contacted.
