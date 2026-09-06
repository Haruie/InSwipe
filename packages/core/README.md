# @inswipe/core

Domain types and the fit engine. It is the only place a `Student`, a `Job` or a `FitScore`
is defined, and it is deliberately ignorant of where those rows come from: nothing here
touches a database, and no score is ever stored.

Its sibling [`@inswipe/data`](../data) owns the other half — Supabase holds the runtime
data and returns rows, this package says what they mean and computes fit from them.

Consumed as TypeScript source through a Vite alias and a `tsconfig` path in each app, so
there is no build step and no `npm install` here. Both apps list `../packages/core/src` in
their `tsconfig` `include`, so `npm run typecheck` in either one checks this package too.
When real AI replaces the heuristic, it should return `FitScore` from here unchanged and
neither UI has to move.

## What's in it

| File | What |
|---|---|
| `src/types.ts` | The shapes both surfaces use — `Student`, `Job`, `Company`, `Application`, `FitScore` |
| `src/fit.ts` | `createFitEngine()`, the weights from `CLAUDE.md` §5, and the band thresholds |

## The engine

```ts
const engine = createFitEngine({ voice: 'company', hints: recruiterHints });
const fit = engine.computeFit(student, job);
```

`voice` changes only the wording of `fits` and `gaps`. The score, the breakdown and which
rows appear are identical either way — that is the point of `CLAUDE.md` §5: one object,
read from two sides. `hints` supplies the per-skill copy appended to a gap's reason, which
is where each product's tone lives: a next step for a student, a risk read for a recruiter.

Scoring weights, evidence strengths and band thresholds live in `src/fit.ts` and nowhere
else. If a percentage needs to change, it changes here and both products follow.
