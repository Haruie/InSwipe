#!/usr/bin/env node
/**
 * The demo dataset, from the command line.
 *
 *   node scripts/demo.mjs reset    restore the presentation dataset
 *   node scripts/demo.mjs check    print what is in the database right now
 *
 * `reset` calls `public.demo_reset()`, which is defined in
 * supabase/migrations/0003_demo_dataset.sql and is both the seed and the reset.
 * Credentials come from student-app/.env (or the VITE_SUPABASE_* environment vars).
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

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

async function rpc({ url, key }, fn, body = {}) {
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${fn} failed (${response.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function select({ url, key }, path) {
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GET ${path} failed (${response.status}): ${text}`);
  return JSON.parse(text);
}

const command = process.argv[2] ?? 'reset';
const env = readEnv();

if (command === 'reset') {
  console.log(await rpc(env, 'demo_reset'));
} else if (command === 'check') {
  const [companies, students, jobs, applications, selections, conversations, messages] =
    await Promise.all(
      ['companies', 'students', 'jobs', 'applications', 'selections', 'conversations', 'messages'].map(
        (table) => select(env, `${table}?select=id`),
      ),
    );
  const technova = await select(
    env,
    'applications?select=student_id,status,stage,fit_snapshot,jobs!inner(id,company_id)&jobs.company_id=eq.technova&order=fit_snapshot.desc',
  );

  console.log(
    `companies ${companies.length} · students ${students.length} · jobs ${jobs.length} · ` +
      `applications ${applications.length} · selections ${selections.length} · ` +
      `conversations ${conversations.length} · messages ${messages.length}`,
  );
  console.log('\nTechNova applicants, best fit first:');
  for (const row of technova) {
    console.log(
      `  ${String(row.fit_snapshot).padStart(3)}%  ${row.student_id.padEnd(16)} ${row.jobs.id.padEnd(20)} ${row.stage}`,
    );
  }
} else {
  console.error(`Unknown command "${command}". Use "reset" or "check".`);
  process.exit(1);
}
