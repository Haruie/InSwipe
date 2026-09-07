# Supabase

Supabase is the source of truth for the demo. Both products read and write these tables:
the student app as whoever is signed in, the company dashboard as `technova`.

Signing up in the student app writes a real `students` row (`create_student()`) and the
app runs as it \u2014 every read and write is already scoped by id. Signing in matches on email.
No password is stored: the demo has no authentication yet and a credential it cannot
protect is worse than none. The Google and LinkedIn buttons are demo shortcuts into
`anika-sharma`, the account the seeded dataset is built around.

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
| `migrations/0004_accounts_and_profile.sql` | Student accounts, and the write behind every profile edit |
| `migrations/0005_org_and_team.sql` | Hiring teams — organizations, members, and email-code invites (company dashboard only) |
| `migrations/0006_domain_verification.sql` | Work-email verification for company onboarding |

They are idempotent — re-running any of them is safe.

`0005`/`0006` are additive: no existing table, function or policy changes, and the
student app imports none of it. The invite and verification codes live in tables with
RLS on and no read policy — the only way to reach one is through the functions.

## Resetting the demo

One call restores the exact state a presentation starts from:

```sql
select public.demo_reset();
```

This includes accounts created during a run-through \u2014 `students` is one of the tables it
rebuilds \u2014 so a session pointing at an account that no longer exists signs itself out on
the next load rather than failing to start.

Or, from the repo root:

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

## The Edge Function

`functions/parse-resume` reads a student's resume PDF into a structured profile
(CLAUDE.md section 8). It exists as a function rather than a call from the app because of
the key: the anon key in both bundles can only read, but a model provider's key is a spend
credential, so this is the only code that ever sees one.

It writes nothing. The parse comes back, the student confirms it on the review screen, and
the ordinary `save_student_profile()` call stores it.

**Setting it up**

1. Project Settings → Edge Functions → Secrets → add `GEMINI_API_KEY`.
2. Deploy the function: `supabase functions deploy parse-resume`, or use the Supabase MCP.

Without the secret the function answers `503 not_configured`, and the student app falls
back to the scripted stand-in it used before — the seeded profile, applied to whoever is
signing up, with a toast saying so. A checkout of this repo with no key still demos.

`functions/send-code` e-mails the 6-digit code for a team invite or work-email
verification (the code itself is minted in `challenge_invite()` / `verify_domain_start()`
— this only delivers it). It exists as a function for the same key reason.

1. Project Settings → Edge Functions → Secrets → add `RESEND_API_KEY` (a
   [Resend](https://resend.com) key), and optionally `SEND_CODE_FROM`
   (e.g. `"InSwipe <team@yourdomain.com>"`).
2. Deploy: `supabase functions deploy send-code`.

Without the secret it answers `503 not_configured` and the dashboard shows the code on
screen instead, so the invite and verification flows still work end to end.

**Reading a failure.** The function logs the provider's own response before answering, so
Edge Function logs in the dashboard say whether a parse failed on the key, the file or the
model. The app only ever shows the student a sentence.

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
