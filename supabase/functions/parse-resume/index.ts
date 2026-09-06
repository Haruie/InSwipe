/**
 * Resume → structured profile. CLAUDE.md section 8, the first of the five AI touchpoints.
 *
 * This runs on Supabase rather than in the app for one reason: the API key. Both products
 * ship their Supabase anon key to the browser quite deliberately — it can only read, and
 * every write is a security-definer function — but a model provider's key is a spend
 * credential, and there is no version of putting one in a Vite bundle that is acceptable.
 * So the browser posts a PDF here, and this is the only code that knows the key exists.
 *
 * It returns what the model read and nothing else. It writes to no table: the app shows
 * the student what was extracted and saves only once they have confirmed it (CLAUDE.md
 * section 6 — that confirmation screen is not optional, because unreviewed bad data
 * poisons every fit score downstream).
 *
 *   supabase secrets set GEMINI_API_KEY=...
 *   supabase functions deploy parse-resume
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

/** 5 MB, matching what the upload screen promises. */
const MAX_BYTES = 5 * 1024 * 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/* --------------------------------- the schema --------------------------------- */

const str = { type: 'string' } as const;
const strings = { type: 'array', items: str } as const;
const confidence = { type: 'string', enum: ['high', 'medium', 'low'] } as const;

/**
 * The shape the model must return. It mirrors `Student` in `packages/core/src/types.ts`
 * on purpose — what comes out of here is what the fit engine reads, so a parse re-ranks
 * the deck the moment it is saved.
 *
 * Every field is required. One the resume does not mention comes back as an empty string,
 * which is a fact the review screen can show; an absent key is just a hole.
 */
const SCHEMA = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: {
        name: str,
        email: str,
        phone: str,
        university: str,
        degree: str,
        field: str,
        gradYear: str,
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: str,
              evidence: { type: 'string', enum: ['strong', 'moderate', 'weak'] },
            },
            required: ['name', 'evidence'],
          },
        },
        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: str,
              description: str,
              tech: strings,
              github: str,
              demo: str,
              contribution: str,
            },
            required: ['name', 'description', 'tech', 'github', 'demo', 'contribution'],
          },
        },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: str,
              company: str,
              mode: { type: 'string', enum: ['Remote', 'Hybrid', 'On-site'] },
              period: str,
              summary: str,
            },
            required: ['role', 'company', 'mode', 'period', 'summary'],
          },
        },
        education: {
          type: 'object',
          properties: { degree: str, university: str, period: str, cgpa: str },
          required: ['degree', 'university', 'period', 'cgpa'],
        },
        links: {
          type: 'object',
          properties: { github: str, portfolio: str, linkedin: str },
          required: ['github', 'portfolio', 'linkedin'],
        },
      },
      required: [
        'name', 'email', 'phone', 'university', 'degree', 'field', 'gradYear',
        'skills', 'projects', 'experience', 'education', 'links',
      ],
    },
    /**
     * How sure the model is, field by field, for the six the review screen lists as rows.
     * Anything below `high` earns the "Confirm?" chip — which is the point of the review
     * step, and until now was hardcoded onto phone and graduation year.
     */
    confidence: {
      type: 'object',
      properties: {
        name: confidence,
        email: confidence,
        phone: confidence,
        university: confidence,
        degree: confidence,
        gradYear: confidence,
      },
      required: ['name', 'email', 'phone', 'university', 'degree', 'gradYear'],
    },
  },
  required: ['profile', 'confidence'],
};

/* --------------------------------- the prompt --------------------------------- */

/**
 * Evidence strength is the part worth reading twice. CLAUDE.md section 5 makes it the
 * defence against resume padding — required-skill coverage is weighted by it, so a
 * student who *built* something with React outranks one who listed it in a skills row.
 * Only something reading the whole resume can tell those two apart, which is exactly why
 * this is a model's job and not a keyword match.
 */
const INSTRUCTION = `You read a student's resume and return their profile as structured data.

Extract only what the resume says. Never invent a skill, project, employer, date or link.
If the resume does not mention something, return an empty string — do not guess, and do
not fill a gap with something plausible.

For every skill, judge how strongly the resume evidences it:
- "strong"   — used in a project with a live link or repository, or in paid or formal work experience
- "moderate" — used in a project without a verifiable link, or named in prose with real context
- "weak"     — appears only in a list of skills, with nothing behind it

Rules for the rest:
- Skills: technologies, languages, frameworks and tools. Name them as the industry writes
  them ("PostgreSQL", "REST APIs", "Node.js"), not as the resume happens to. Skip soft
  skills — the fit engine scores capabilities, not adjectives.
- Projects: "description" is one sentence on what it does. "contribution" is what this
  student personally did, and stays empty unless the resume says. "github" and "demo" are
  full URLs or empty.
- Experience: internships and jobs only, not coursework. "period" as written, e.g.
  "May 2025 – Jul 2025". "mode" is Remote, Hybrid or On-site; use On-site if unstated.
- Education: the most recent or highest degree. "cgpa" only if a GPA or percentage is
  printed, keeping its original form, e.g. "8.7 CGPA".
- gradYear: the four-digit year of graduation, expected or actual.
- field: the field of study, e.g. "Computer Science".

Then rate your confidence per field. Use "high" when the resume states it plainly,
"medium" when you inferred it from context, "low" when you are unsure or the field came
back empty. Be honest — the student is shown every low-confidence field to confirm, and an
overconfident guess reaches them as a fact they will not think to check.`;

/* ----------------------------------- handler ----------------------------------- */

interface ParseRequest {
  filename?: string;
  mimeType?: string;
  /** the PDF, base64, with no data: prefix */
  data?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) {
    // A missing key is a deployment state, not a bug, and the app has a designed
    // fallback for it — so say so plainly rather than failing as a 500.
    return json(
      {
        error: 'not_configured',
        message: 'Resume parsing is not switched on: GEMINI_API_KEY is not set.',
      },
      503,
    );
  }

  let body: ParseRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request', message: 'Expected a JSON body.' }, 400);
  }

  const { data, mimeType } = body;
  if (!data) return json({ error: 'bad_request', message: 'No file was sent.' }, 400);
  if (mimeType !== 'application/pdf') {
    return json({ error: 'unsupported_type', message: 'Resumes must be PDF files.' }, 415);
  }
  // base64 carries three bytes in every four characters.
  if (Math.floor((data.length * 3) / 4) > MAX_BYTES) {
    return json({ error: 'too_large', message: 'That file is larger than 5 MB.' }, 413);
  }

  const request = JSON.stringify({
    model: MODEL,
    system_instruction: INSTRUCTION,
    input: [
      { type: 'document', mime_type: 'application/pdf', data },
      { type: 'text', text: 'Read this resume and return the profile it describes.' },
    ],
    response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA },
    generation_config: { thinking_level: 'low', max_output_tokens: 8192 },
  });

  let upstream: Response;
  try {
    upstream = await callModel(key, request);
  } catch (error) {
    console.error('[parse-resume] upstream unreachable', error);
    return json({ error: 'upstream_unreachable', message: 'Could not reach the model.' }, 502);
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    console.error('[parse-resume] upstream', upstream.status, detail);

    if (upstream.status === 429) {
      // A quota wall, not a broken resume. The provider says how long it wants, so pass
      // that on rather than inventing a number the student then disproves by retrying.
      const wait = retryAfter(detail);
      return json(
        {
          error: 'model_busy',
          retryAfter: wait,
          message: wait
            ? `The model is over its rate limit. Try again in about ${wait} seconds.`
            : 'The model is over its rate limit. Try again shortly.',
        },
        502,
      );
    }

    return json(
      {
        error: overloaded(upstream.status) ? 'model_busy' : 'upstream_failed',
        message: overloaded(upstream.status)
          ? 'The model is busy right now. Try again in a moment.'
          : upstream.status === 400 || upstream.status === 401 || upstream.status === 403
            ? 'The model provider rejected the request — check GEMINI_API_KEY.'
            : 'The model could not read that resume.',
      },
      502,
    );
  }

  const parsed = readInteraction(await upstream.json());
  if (!parsed) {
    return json({ error: 'unreadable', message: 'The model returned nothing usable.' }, 502);
  }
  return json(parsed);
});

/** The model had a bad second — worth another go. */
const overloaded = (status: number) => status >= 500;

/**
 * How long the provider asked us to wait, in whole seconds, from the text of a 429.
 *
 * The quota error carries its own answer ("Please retry in 43.129254765s"), and that is
 * far better than a number we invent: a free-tier window can be seconds or a minute, and
 * guessing short turns one blocked request into several.
 */
function retryAfter(detail: string): number | null {
  const match = /retry in ([\d.]+)s/i.exec(detail);
  if (!match) return null;
  return Math.max(1, Math.ceil(Number(match[1])));
}

/**
 * One parse, with room for the provider to have a bad second.
 *
 * Only 5xx is retried here. A 429 is a quota wall, and retrying into it is worse than
 * useless: each attempt spends another request against the very allowance that is
 * exhausted, and the waits the provider asks for — tens of seconds — are longer than a
 * student should sit on a spinner anyway. Those come straight back to the app, which asks
 * whether to try again and says how long to leave it.
 */
async function callModel(key: string, body: string): Promise<Response> {
  const backoff = [1500, 4000];
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body,
    });
    if (!overloaded(response.status) || attempt >= backoff.length) return response;
    console.warn(`[parse-resume] ${response.status} from the model, retrying`);
    await new Promise((r) => setTimeout(r, backoff[attempt]));
  }
}

/**
 * The Interactions API answers with a timeline of `steps`, and the structured JSON arrives
 * as text inside the model's output step. Anything else in there — thinking, tool calls —
 * is not ours to read, so this walks the shape rather than trusting a position in it.
 */
function readInteraction(payload: unknown): unknown | null {
  const steps = (payload as { steps?: unknown[] } | null)?.steps;
  if (!Array.isArray(steps)) return null;

  const text = steps
    .filter((s) => (s as { type?: string }).type === 'model_output')
    .flatMap((s) => (s as { content?: unknown[] }).content ?? [])
    .filter((c) => (c as { type?: string }).type === 'text')
    .map((c) => (c as { text?: string }).text ?? '')
    .join('')
    .trim();

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    console.error('[parse-resume] response was not JSON', text.slice(0, 400));
    return null;
  }
}
