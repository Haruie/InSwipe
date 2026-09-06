# Brand

The InSwipe artwork, kept once and installed into both apps by
`node scripts/brand.mjs`.

| File | What it is | Where it ends up |
|---|---|---|
| `logo.png` | The square app mark — rounded indigo tile, white S-ribbon, sparkle | Both apps' `public/brand/logo.png`, and `public/favicon.png` |
| `banner.png` | The horizontal lockup — mark, "InSwipe" wordmark, and the AI-POWERED INTERNSHIP MATCHMAKING line | Both apps' `public/brand/banner.png` |

Save the two files here, then run:

```bash
node scripts/brand.mjs
```

The mark appears in the student app's header and auth screen and in the company
dashboard's landing nav and footer; the lockup appears where someone meets the product
for the first time — the intro screens and the landing page. Both are drawn as an
indigo fallback when the file is absent (`Brand.tsx` in each app), so the repo runs
without them.

`logo.png` should be square. `banner.png` is used at roughly 150–200px wide, so
around 900px wide is plenty.
