# @inswipe/data

The Supabase layer. Supabase owns runtime data; `@inswipe/core` owns the domain types
and the fit engine. Nothing in here computes a fit score, and nothing in `core` talks
to a database.

Both products import this package, which is the point: the student app and the company
dashboard read the same rows and disagree about nothing.

```
client.ts     one Supabase client per app, built from VITE_SUPABASE_* env vars
rows.ts       the tables, exactly as they come back (snake_case)
map.ts        rows -> @inswipe/core shapes, plus the shared time formatting
queries.ts    loadCatalog / loadStudentWorkspace / loadCompanyWorkspace
mutations.ts  every write, all of them RPCs
```

## Why every write is an RPC

The tables carry a read policy and nothing else — a client cannot insert or update
anything directly. Writes go through the security-definer functions in
`supabase/migrations/0002_rls_and_rpcs.sql`.

That is what makes CLAUDE.md section 3 rule 2 hold: `conversations.selection_id` is
`NOT NULL`, and `select_candidate()` is the only function that writes to either table.
There is no path from either app to a conversation that does not pass through a
selection first.
