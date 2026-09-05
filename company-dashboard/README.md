# InSwipe — Company Dashboard

The company web dashboard: post roles, review a ranked list of everyone who applied, and
see why the AI thinks each candidate fits. Vite + React + TypeScript + Tailwind CSS v4,
mock data only, no backend.

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

## Known gaps against the product spec

Built independently from `student-app/`, so a few things don't line up yet:

- **Not on Next.js.** `CLAUDE.md` calls for Next.js for this surface; this is a Vite SPA.
  Works fine standalone, but would need a migration to match the spec's stack exactly.
- **Own mock data, own fit numbers.** `src/data/mock.ts` has its own candidates, jobs, and
  hand-set fit scores/breakdowns. It does not yet call `student-app/src/lib/fit.ts`, so a
  candidate's score here won't move in sync with the same student's profile in the student
  app. Sharing the fit engine (and the underlying student/job types) is the next real step
  toward one connected product.
- **No selection → inbox wiring across apps.** Selecting a candidate here updates local
  state and drops them into this app's own Inbox; it doesn't reach into `student-app`'s
  data to actually unlock that student's inbox, since the two apps don't share a backend
  yet (see `CLAUDE.md` §9).
- Resume viewing, ATS/Slack/Calendar integrations, and email delivery are all
  simulated — no files are read, no third-party accounts are ever contacted.
