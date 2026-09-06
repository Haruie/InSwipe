# Supabase

Supabase is the source of truth for the demo. Both products read and write these tables:
the student app as `anika-sharma`, the company dashboard as `technova`.

`packages/core` still owns the domain types and the fit engine — no scores are stored,
both apps compute them from the same profile and job rows.

## Applying it

Run these in order, in the SQL editor of the project
(https://supabase.com/dashboard/project/cddbmhperspefefyibwz):

| File | What it does |
|---|---|
| `migrations/0001_schema.sql` | Tables, indexes and the two rules the database enforces |
| `migrations/0002_rls_and_rpcs.sql` | Read-only RLS plus every write, as a function |
| `migrations/0003_demo_dataset.sql` | Defines `demo_reset()` and calls it once |

They are idempotent — re-running any of them is safe.

## Resetting the demo

One call restores the exact state a presentation starts from:

```sql
select public.demo_reset();
```

or, from the repo root:

```bash
node scripts/demo.mjs reset
```

During a presentation it is easier to press the button: the student app's Profile tab and the
dashboard's Settings → Demo both call this function, and both apps reload onto the result.

## Company cover art

`companies.cover_url` is the image every job card leads with. It holds a path both apps
serve — `/covers/<id>.svg` — and `company.gradient` stays painted underneath it, so a
missing or slow file degrades to the card's previous look rather than to a hole.

The files themselves are generated from the company rows:

```bash
node scripts/covers.mjs
```

Palette from the row's `color` and `gradient`, motif from its `industry`, composition
seeded by its `id`. Add a company and re-run it; the covers land in both
`student-app/public/covers/` and `company-dashboard/public/covers/`. A company that
later supplies a real photograph replaces one column value and nothing else changes.

`node scripts/demo.mjs check` prints the row counts and TechNova's ranked applicant list
without changing anything.

## The two rules the database enforces

These are not conventions. They hold even against a client that tries to break them.

1. **A conversation cannot exist without a selection.** `conversations.selection_id` is
   `NOT NULL UNIQUE` and references `selections`. There is no application code involved.
2. **The company sends the first message.** A trigger on `messages` rejects the first
   row in any thread if it did not come from the company.

Both of these are CLAUDE.md section 3 — rules 2 and 3.

## Why every write is a function

No table has an insert, update or delete policy. Reads are public; writes go through
`security definer` functions granted to `anon`. That is what makes the gate above
airtight: `select_candidate()` is the only code path that writes to `selections` and
`conversations`, and it writes both in one transaction along with the opening message.

## No authentication yet

Deliberate, and the reason the policies are as blunt as they are. The demo has one
student and one company, both hard-coded (`student-app/src/lib/db.ts`,
`company-dashboard/src/lib/db.ts`). When auth lands, those constants become the signed-in
user and the RLS policies get a `where` clause — every query is already scoped by id.

`demo_reset()` is executable by `anon` so a presenter can restore the dataset without
credentials. Revoke that before the project holds anything real.
