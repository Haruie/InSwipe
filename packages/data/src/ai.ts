/**
 * The seam to the model.
 *
 * `queries` and `mutations` reach Postgres; this reaches the Edge Functions that hold the
 * provider key (`supabase/functions/`). Both apps import it the same way, so no component
 * ever talks to a model provider and no bundle ever carries a key.
 *
 * Nothing here writes. A parse is a proposal — the student confirms it and the ordinary
 * profile save puts it in Supabase (CLAUDE.md section 6).
 */
import type { Experience, ParsedResume, Project, Skill } from '@inswipe/core';
import type { InswipeClient } from './client';

/** 5 MB, matching what the upload screen promises and what the function enforces. */
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * A parse that did not happen, with the reason kept machine-readable.
 *
 * `not_configured` is the one the app treats as a state rather than a failure: it means
 * the key has not been set on the project yet, which is a normal thing for a checkout of
 * this repo to be, and the upload screen says so instead of showing an error.
 */
export class ResumeParseError extends Error {
  readonly code: string;
  /** Seconds the provider asked us to wait, when it said. */
  readonly retryAfter?: number;

  constructor(code: string, message: string, retryAfter?: number) {
    super(message);
    this.name = 'ResumeParseError';
    this.code = code;
    this.retryAfter = retryAfter;
  }

  get notConfigured() {
    return this.code === 'not_configured';
  }

  /**
   * Nothing was wrong with the file — the same one sent again may well work. This is the
   * difference between offering "try again" and "try another file", and getting it the
   * wrong way round tells a student to go and fix a resume that was never the problem.
   */
  get retryable() {
    return this.code === 'model_busy' || this.code === 'unreachable' || this.code === 'upstream_unreachable';
  }
}

/**
 * Read a resume into a profile. The PDF goes to the function whole rather than as text
 * pulled out of it in the browser: a resume is a layout — columns, dates beside roles,
 * a projects section — and flattening it to a string first throws away the structure the
 * model would have used.
 */
export async function parseResume(db: InswipeClient, file: File): Promise<ParsedResume> {
  if (file.type !== 'application/pdf') {
    throw new ResumeParseError('unsupported_type', 'Resumes must be PDF files.');
  }
  if (file.size > MAX_BYTES) {
    throw new ResumeParseError('too_large', 'That file is larger than 5 MB.');
  }

  const { data, error } = await db.functions.invoke('parse-resume', {
    body: { filename: file.name, mimeType: file.type, data: await toBase64(file) },
  });

  if (error) throw await toParseError(error);
  const payload = data as { error?: string; message?: string; retryAfter?: number } | null;
  if (!payload) throw new ResumeParseError('unreadable', 'The resume could not be read.');
  if (payload.error) {
    throw new ResumeParseError(
      payload.error,
      payload.message ?? 'The resume could not be read.',
      payload.retryAfter,
    );
  }

  return normalise(payload as unknown as ParsedResume);
}

/* --------------------------------- the file --------------------------------- */

/** The PDF as base64, without the `data:application/pdf;base64,` prefix. */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ResumeParseError('unreadable_file', 'That file could not be read.'));
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(',');
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * `functions.invoke` reports a non-2xx as an error and keeps the body on it, which is
 * where the function's own reason lives — so this digs it out rather than reporting every
 * failure as the same shrug.
 */
async function toParseError(error: unknown): Promise<ResumeParseError> {
  const response = (error as { context?: Response }).context;
  if (response && typeof response.json === 'function') {
    try {
      const body = (await response.json()) as {
        error?: string;
        message?: string;
        retryAfter?: number;
      };
      if (body?.error) {
        return new ResumeParseError(
          body.error,
          body.message ?? 'The resume could not be read.',
          body.retryAfter,
        );
      }
    } catch {
      // fall through to the generic message
    }
  }
  // Anything else is the transport, not the parse — and "Failed to send a request to the
  // Edge Function" is a sentence for a developer, not for a student mid-signup. The
  // original goes to the console; the caller gets something a person can act on.
  console.error('[InSwipe] parse-resume unreachable', error);
  return new ResumeParseError(
    'unreachable',
    'We could not reach the resume reader. Check your connection and try again.',
  );
}

/* -------------------------------- the payload -------------------------------- */

/**
 * The model answers against a schema, but it is still the far side of a network call, so
 * every field is coerced to the shape the app renders. The ids are minted here and never
 * asked of the model: they identify a row in this app, and are not a fact about a resume.
 */
function normalise(parsed: ParsedResume): ParsedResume {
  const p = parsed.profile ?? ({} as ParsedResume['profile']);
  const stamp = Date.now();

  return {
    profile: {
      name: text(p.name),
      email: text(p.email),
      phone: text(p.phone),
      university: text(p.university),
      degree: text(p.degree),
      field: text(p.field),
      gradYear: text(p.gradYear),
      skills: list<Skill>(p.skills)
        .filter((s) => text(s?.name))
        .map((s) => ({
          name: text(s.name),
          evidence:
            s.evidence === 'strong' || s.evidence === 'moderate' ? s.evidence : 'weak',
        })),
      projects: list<Project>(p.projects)
        .filter((x) => text(x?.name))
        .map((x, i) => ({
          id: `p-${stamp}-${i}`,
          name: text(x.name),
          description: text(x.description),
          tech: list<string>(x.tech).map(text).filter(Boolean),
          // Optional in the domain, and an empty string from the model means absent.
          github: text(x.github) || undefined,
          demo: text(x.demo) || undefined,
          contribution: text(x.contribution) || undefined,
        })),
      experience: list<Experience>(p.experience)
        .filter((x) => text(x?.role) || text(x?.company))
        .map((x, i) => ({
          id: `e-${stamp}-${i}`,
          role: text(x.role),
          company: text(x.company),
          mode: x.mode === 'Remote' || x.mode === 'Hybrid' ? x.mode : 'On-site',
          period: text(x.period),
          summary: text(x.summary),
        })),
      education: {
        degree: text(p.education?.degree),
        university: text(p.education?.university),
        period: text(p.education?.period),
        cgpa: text(p.education?.cgpa) || undefined,
      },
      links: {
        github: text(p.links?.github) || undefined,
        portfolio: text(p.links?.portfolio) || undefined,
        linkedin: text(p.links?.linkedin) || undefined,
      },
    },
    // An unrated field is treated as low: the review screen asking about something it did
    // not need to is a small cost, and letting a guess through unmarked is not.
    confidence: {
      name: rating(parsed.confidence?.name),
      email: rating(parsed.confidence?.email),
      phone: rating(parsed.confidence?.phone),
      university: rating(parsed.confidence?.university),
      degree: rating(parsed.confidence?.degree),
      gradYear: rating(parsed.confidence?.gradYear),
    },
  };
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const list = <T,>(value: unknown) => (Array.isArray(value) ? (value as T[]) : []);
const rating = (value: unknown) =>
  value === 'high' || value === 'medium' ? value : ('low' as const);
