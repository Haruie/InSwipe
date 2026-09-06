# InSwipe — Company Dashboard

The company web dashboard: post roles, review a ranked list of everyone who applied, and
see why the AI thinks each candidate fits. Vite + React + TypeScript + Tailwind CSS v4,
reading and writing the same Supabase database as the student app.

Fit scores come from [`packages/core`](../packages/core) — the same engine the student app
runs, over the same profile rows. Nothing on this side hand-sets a percentage, and nothing
stores one.

```bash
npm install
cp .env.example .env   # then paste the project's publishable (anon) key
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

Nothing in `src/` holds a company, job, student or conversation. `src/data/store.tsx`
loads TechNova's workspace from Supabase through [`packages/data`](../packages/data)
before the app mounts, then re-polls every four seconds so a student applying in the other
app appears here without a reload.

`src/data/candidates.ts` runs `computeFit(student, job)` over each application's profile
and builds the rows the pages render, ranking by the result **within each role** — fit is
always scoped to a job (CLAUDE.md rule 5). Change a student's skills in the database and
the score, the ordering, the "Fits" and "Lacks" rows and the breakdown bars all move
together, here and in the student app.

`src/lib/fit.ts` configures the shared engine for this audience: company voice, recruiter
hints, and more rows than a phone card shows.

### Selecting a candidate is one database write

`select_candidate()` writes the `selections` row, the conversation hanging off it and the
company's opening message in a single transaction. It is the only code path that can
create either row: no table on this project carries a write policy, so a conversation
without a selection is impossible rather than merely discouraged (CLAUDE.md §3, rule 2).

The Inbox has no seeded threads. Every conversation on that page came from a selection.

## Known gaps against the product spec

- **Not on Next.js.** `CLAUDE.md` calls for Next.js for this surface; this is a Vite SPA.
  Works fine standalone, but would need a migration to match the spec's stack exactly.
- **Styling is half Tailwind, half inline `style` objects** — a leftover from the Figma Make
  export. Worth normalising before this grows.
- **No authentication.** The dashboard is hard-coded to `technova` in `src/lib/db.ts`, and
  RLS is read-for-everyone until there is a signed-in recruiter to scope it to.
- **Posting a job doesn't create a row.** The multi-step form and its live preview work;
  the final submit is not wired to Supabase yet.
- **Only Frontend Engineering Intern starts with applicants.** Product Design and Growth
  Marketing are live postings with empty pools — apply to one from the student app and it
  fills up.
- **Polling, not realtime.** Four-second interval; Supabase realtime would make it instant.
- Resume viewing, ATS/Slack/Calendar integrations, and email delivery are all
  simulated — no files are read, no third-party accounts are ever contacted.
