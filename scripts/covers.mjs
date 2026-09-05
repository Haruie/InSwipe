#!/usr/bin/env node
/**
 * Company cover art, generated from the company rows themselves.
 *
 *   node scripts/covers.mjs
 *
 * Every job card carries an image of the company it belongs to. That image is a real
 * file — `companies.cover_url` points at it — so a company that later uploads a photo
 * of its own office replaces one column value and nothing in either app changes.
 *
 * Until then the file is drawn here, and nothing about it is invented: the palette
 * comes from the row's own `color` and `gradient`, the motif is chosen from its
 * `industry`, and the composition is seeded by its `id` — so two fintechs share a
 * visual language without looking like the same card, and a company added to the
 * database tomorrow gets a cover by re-running this, with nothing to keep in sync.
 *
 * Credentials come from student-app/.env, exactly as scripts/demo.mjs reads them.
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Where the two apps serve their static files from. Both get the same set. */
const TARGETS = [
  join(ROOT, 'student-app', 'public', 'covers'),
  join(ROOT, 'company-dashboard', 'public', 'covers'),
];

const WIDTH = 800;
const HEIGHT = 400;

/**
 * The motifs below are drawn against the right of the canvas, but the swipe card is
 * far squarer than 2:1 and crops to its middle. Pulling the whole group left keeps the
 * motif inside that crop on a phone while leaving it comfortably placed on the wide
 * heroes, between the fit pill in one corner and the logo tile in the other.
 */
const MOTIF_X = -180;
const MOTIF_CENTRE = 600 + MOTIF_X;

/* --------------------------------- input --------------------------------- */

function readEnv() {
  const fromProcess = {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY,
  };
  if (fromProcess.url && fromProcess.key) return fromProcess;

  for (const file of ['student-app/.env', 'company-dashboard/.env']) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    const env = Object.fromEntries(
      readFileSync(path, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const at = line.indexOf('=');
          return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^["']|["']$/g, '')];
        }),
    );
    if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
      return { url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_ANON_KEY };
    }
  }

  throw new Error(
    'No Supabase credentials. Copy student-app/.env.example to student-app/.env and fill it in.',
  );
}

async function companies({ url, key }) {
  const query = 'select=id,name,color,gradient,industry&order=id';
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/companies?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`Reading companies failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

/* --------------------------------- palette -------------------------------- */

/**
 * The row stores a CSS gradient because that is what the cards already render. It is
 * pulled apart here into the stops an SVG gradient needs. A row without one falls back
 * to its brand colour darkened and lightened, so the art never depends on that string
 * being well formed.
 */
function stops(company) {
  const found = [...String(company.gradient ?? '').matchAll(/(#[0-9a-f]{3,8})\s*(\d+)%/gi)].map(
    (match) => ({ color: match[1], offset: Number(match[2]) }),
  );
  if (found.length >= 2) return found;
  const base = company.color || '#4F46E5';
  return [
    { color: shade(base, -0.28), offset: 0 },
    { color: base, offset: 55 },
    { color: shade(base, 0.34), offset: 100 },
  ];
}

/** Mix a hex colour towards black (amount < 0) or white (amount > 0). */
function shade(hex, amount) {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6);
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const target = amount > 0 ? 255 : 0;
  const mixed = channels.map((c) => Math.round(c + (target - c) * Math.abs(amount)));
  return `#${mixed.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/* ---------------------------------- seed ---------------------------------- */

/** A stable stream of numbers per company, so an id always composes the same way. */
function seed(id) {
  let hash = 2166136261;
  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
}

/* --------------------------------- motifs --------------------------------- */

/**
 * What the company does, drawn as line art. Chosen from the `industry` column rather
 * than the id, so this stays a rule about industries instead of a lookup table that
 * has to grow a row every time a company is added.
 */
function motifFor(industry) {
  const text = String(industry ?? '').toLowerCase();
  if (/design/.test(text)) return MOTIFS.pen;
  if (/quick commerce/.test(text)) return MOTIFS.timer;
  if (/commerce|retail|fashion/.test(text)) return MOTIFS.parcel;
  if (/fintech|payment|bank/.test(text)) return MOTIFS.card;
  if (/consumer|food|delivery/.test(text)) return MOTIFS.route;
  if (/\bai\b|infra|cloud|data/.test(text)) return MOTIFS.nodes;
  return MOTIFS.code;
}

const MOTIFS = {
  /** Developer tools — a terminal, a prompt, some code. */
  code: `
    <rect x="418" y="74" width="330" height="238" rx="20"/>
    <path d="M418 122h330"/>
    <circle cx="448" cy="98" r="6" fill="currentColor" stroke="none"/>
    <circle cx="470" cy="98" r="6" fill="currentColor" stroke="none"/>
    <circle cx="492" cy="98" r="6" fill="currentColor" stroke="none"/>
    <path d="M452 158l30 26-30 26"/>
    <path d="M498 210h86"/>
    <path d="M452 252h242"/>
    <path d="M452 284h158"/>`,

  /** AI infrastructure — services, and the traffic between them. */
  nodes: `
    <path d="M470 118l104-32M574 86l122 44M696 130l-92 88M604 218l-118-70M604 218l58 108M486 148l-30 128M456 276l206 50"/>
    <circle cx="470" cy="118" r="17"/>
    <circle cx="574" cy="86" r="11"/>
    <circle cx="696" cy="130" r="14"/>
    <circle cx="604" cy="218" r="24"/>
    <circle cx="456" cy="276" r="13"/>
    <circle cx="662" cy="326" r="19"/>
    <circle cx="604" cy="218" r="9" fill="currentColor" stroke="none"/>`,

  /** Commerce — what ends up on a doorstep. */
  parcel: `
    <path d="M452 178l128-52 128 52v128l-128 52-128-52z"/>
    <path d="M452 178l128 52 128-52M580 230v128"/>
    <path d="M544 144v66l36-14 36 14v-66"/>
    <path d="M700 92h58M729 63v58"/>`,

  /** Payments — a card, and the rails behind it. */
  card: `
    <rect x="430" y="112" width="300" height="186" rx="22"/>
    <path d="M430 174h300"/>
    <rect x="462" y="216" width="52" height="38" rx="9"/>
    <path d="M488 216v38M462 235h52"/>
    <path d="M648 236a26 26 0 010 34M676 222a48 48 0 010 62M704 208a70 70 0 010 90"/>`,

  /** Delivery and discovery — a route, and the place at the end of it. */
  route: `
    <path d="M436 316c62-8 74-92 140-100s86 66 148 34" stroke-dasharray="16 14"/>
    <circle cx="436" cy="316" r="15"/>
    <path d="M724 154a38 38 0 10-76 0c0 30 38 68 38 68s38-38 38-68z"/>
    <circle cx="686" cy="154" r="14"/>`,

  /** A design studio — the pen tool, mid-curve. */
  pen: `
    <path d="M444 300c46-142 224-142 270-8"/>
    <path d="M444 300l-6-84M714 292l52-58" stroke-dasharray="10 10"/>
    <rect x="428" y="288" width="26" height="26" rx="4"/>
    <rect x="424" y="202" width="26" height="26" rx="4"/>
    <rect x="702" y="280" width="26" height="26" rx="4"/>
    <rect x="754" y="222" width="26" height="26" rx="4"/>
    <circle cx="580" cy="228" r="9" fill="currentColor" stroke="none"/>`,

  /** Ten-minute commerce — the clock everything is measured against. */
  timer: `
    <circle cx="600" cy="216" r="102"/>
    <path d="M576 92h48M600 92V70M600 216v-66M600 216l52 30"/>
    <path d="M600 128v14M688 216h-14M600 304v-14M512 216h14" stroke-linecap="round"/>
    <path d="M690 118l24-24" stroke-linecap="round"/>`,
};

/* ---------------------------------- draw ---------------------------------- */

const escapeXml = (value) => String(value).replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

function cover(company) {
  const random = seed(company.id);
  const palette = stops(company);
  // Nudged rather than free: the logo tile and the fit pill sit over the corners of
  // this image on the swipe card, so the art moves within a range that keeps both
  // of them readable no matter which company it belongs to.
  const shift = Math.round(random() * 70) - 35;
  const lift = Math.round(random() * 44) - 22;
  const tilt = Math.round(random() * 14) - 7;
  const glowX = Math.round(120 + random() * 180);
  const glowY = Math.round(40 + random() * 90);
  const key = company.id.replace(/[^a-z0-9]/gi, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${escapeXml(company.name)}">
  <title>${escapeXml(company.name)}</title>
  <defs>
    <linearGradient id="bg-${key}" x1="0" y1="0" x2="1" y2="1">
${palette.map((stop) => `      <stop offset="${stop.offset}%" stop-color="${stop.color}"/>`).join('\n')}
    </linearGradient>
    <radialGradient id="glow-${key}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid-${key}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0v40" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${key})"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid-${key})"/>
  <ellipse cx="${glowX}" cy="${glowY}" rx="330" ry="250" fill="url(#glow-${key})"/>

  <g transform="translate(${MOTIF_X + shift} ${lift}) rotate(${tilt} ${MOTIF_CENTRE} 200)"
     color="#ffffff" fill="none" stroke="currentColor" stroke-width="2.5"
     stroke-linejoin="round" opacity="0.34">
${motifFor(company.industry).trim()}
  </g>

  <path d="M0 ${HEIGHT}L${WIDTH} ${Math.round(HEIGHT * 0.62)}V${HEIGHT}z" fill="#000000" fill-opacity="0.10"/>
</svg>
`;
}

/* ---------------------------------- run ---------------------------------- */

const rows = await companies(readEnv());
if (rows.length === 0) {
  throw new Error('No companies in the database — run `node scripts/demo.mjs reset` first.');
}

for (const directory of TARGETS) mkdirSync(directory, { recursive: true });

for (const company of rows) {
  const svg = cover(company);
  for (const directory of TARGETS) writeFileSync(join(directory, `${company.id}.svg`), svg);
}

console.log(
  `Wrote ${rows.length} covers to:\n${TARGETS.map((d) => `  ${d}`).join('\n')}\n` +
    `Companies: ${rows.map((row) => row.id).join(', ')}`,
);
