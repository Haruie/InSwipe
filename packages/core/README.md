# @inswipe/core

Domain types and the fit engine. The student app and the company dashboard both read this
package and nothing else in common — it is the only place a `Student`, a `Job` or a
`FitScore` is defined.

Consumed as TypeScript source through a Vite alias and a `tsconfig` path in each app, so
there is no build step and no `npm install` here. Both apps list `../packages/core/src` in
their `tsconfig` `include`, so `npm run typecheck` in either one checks this package too. When the backend lands, the
API should return `FitScore` from here unchanged and neither UI has to move.

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
