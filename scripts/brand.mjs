/**
 * Installs the InSwipe artwork into both apps.
 *
 * The originals live once, in `brand/`. This copies them into each app's `public/`
 * folder, which is the only place a Vite app can serve a file from by URL. Run it after
 * changing the artwork:
 *
 *   node scripts/brand.mjs
 *
 * Both apps fall back to a drawn mark when a file is missing (see `Brand.tsx` in each),
 * so a repo without the artwork still runs — it just does not carry the logo.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'brand');

/** Where each file has to land, and what it is for. */
const TARGETS = [
  { file: 'logo.png', to: 'public/brand/logo.png', what: 'the square mark' },
  { file: 'logo.png', to: 'public/favicon.png', what: 'the browser tab icon' },
  { file: 'banner.png', to: 'public/brand/banner.png', what: 'the full lockup' },
];

const APPS = ['student-app', 'company-dashboard'];

let copied = 0;
const missing = new Set();

for (const target of TARGETS) {
  const from = join(source, target.file);
  if (!existsSync(from)) {
    missing.add(target.file);
    continue;
  }
  for (const app of APPS) {
    const to = join(root, app, target.to);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
    copied += 1;
    console.log(`  ${app}/${target.to.padEnd(24)} ${target.what}`);
  }
}

if (missing.size) {
  console.log('');
  console.log('Missing from brand/:');
  for (const file of missing) console.log(`  ${file}`);
  console.log('');
  console.log('Save the artwork there and run this again:');
  console.log('  brand/logo.png    the square app mark');
  console.log('  brand/banner.png  the horizontal lockup with the tagline');
}

if (copied) console.log(`\n${copied} file${copied === 1 ? '' : 's'} installed.`);
