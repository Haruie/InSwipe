import { useEffect, useRef, useState } from 'react';
import { ResumeParseError, loadStudentProfile, parseResume } from '@inswipe/data';
import type { ParsedResume, Student } from '@inswipe/core';
import { useStore } from '../store';
import { DEMO_STUDENT_ID, db } from '../lib/db';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import { Logo } from '../components/AppHeader';
import { AiLabel, Button, SectionLabel, Tag } from '../components/ui';
import { IconBack, IconCheck, IconEdit, IconFile, IconPlus, IconUpload } from '../components/Icons';

/* ------------------------------ Upload ------------------------------ */

/** 5 MB, matching what the data layer and the function both enforce. */
const MAX_BYTES = 5 * 1024 * 1024;

export function ResumeUpload() {
  const { dispatch } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  /**
   * Everything the file has to clear before it leaves this screen. The function checks
   * all of it again — it is a public endpoint and cannot trust a browser — but a student
   * who picked the wrong file deserves to hear so now rather than after a round trip.
   */
  const choose = (file: File | null | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('That file is not a PDF. Export your resume as a PDF and try again.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That file is ${prettySize(file.size)}. Resumes need to be under 5 MB.`);
      return;
    }
    setError(null);
    dispatch({ type: 'patch', patch: { pendingResume: file } });
    dispatch({ type: 'nav', screen: 'parsing' });
  };

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <StepHeader step={2} of={3} onBack={() => dispatch({ type: 'back' })} />

      <div className="flex flex-1 flex-col px-6">
        <h1 className="text-[25px] font-bold leading-tight tracking-tight text-ink-900">
          Upload your resume
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Our AI reads it and builds your profile in seconds.
        </p>

        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            choose(e.target.files?.[0]);
            // Cleared so that picking the same file twice still fires a change.
            e.target.value = '';
          }}
        />

        <button
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            choose(e.dataTransfer.files?.[0]);
          }}
          className={`press mt-7 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white/60 px-8 text-center transition-colors hover:border-primary-300 ${
            dragging ? 'border-primary-500 bg-primary-100/40' : 'border-line'
          }`}
          style={{ maxHeight: 340 }}
        >
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-500">
            <IconUpload size={24} />
          </span>
          <span className="text-[15.5px] font-bold text-ink-900">
            Drop your resume here or browse
          </span>
          <span className="mt-1.5 text-[12.5px] text-ink-300">PDF · max 5 MB</span>
          <span className="mt-5 rounded-md border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-900">
            Choose file
          </span>
        </button>

        {error && (
          <div className="mt-4 rounded-md border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-ink-700 shadow-subtle">
            {error}
          </div>
        )}

        <p className="mb-4 mt-auto pt-6 text-center text-[12.5px] text-ink-300">
          Your resume is sent only to companies you apply to.
        </p>
      </div>
      <HomeIndicator />
    </div>
  );
}

/* ------------------------------ Parsing ------------------------------ */

const STEPS = [
  'Reading your resume',
  'Extracting skills',
  'Finding your projects',
  'Ranking opportunities for you',
];

/** "Anika Sharma" -> "Anika_Sharma_Resume.pdf" — the stand-in used when parsing is off. */
function resumeFilename(name: string) {
  const stem = name.trim().replace(/\s+/g, '_') || 'Resume';
  return `${stem}_Resume.pdf`;
}

function prettySize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** What one attempt at a resume comes to. Either a profile to apply, or a sentence to show. */
type Outcome =
  | {
      ok: true;
      patch: Partial<Student>;
      confidence: ParsedResume['confidence'] | null;
      toast?: string;
    }
  | { ok: false; message: string; retryable: boolean };

export function ResumeParsing() {
  const { state, dispatch } = useStore();
  const [done, setDone] = useState(0);
  const [failure, setFailure] = useState<{ message: string; retryable: boolean } | null>(null);
  // Bumped by "Try again", which is what re-runs the effect against the same file.
  const [attempt, setAttempt] = useState(0);
  const file = state.pendingResume;
  const student = state.student;
  /**
   * The parse itself, held across mounts. React runs effects twice in development, and a
   * parse is a paid request to a model — so the promise is started once and every mount
   * subscribes to the same one. Guarding the effect instead would have been wrong: the
   * second mount is the one that stays, and it would have found nothing running.
   */
  const parse = useRef<Promise<Outcome> | null>(null);

  useEffect(() => {
    if (!file) {
      // Landing here with no file — a reload, or back-then-forward — has nothing to read,
      // so it returns to the screen that picks one.
      dispatch({ type: 'nav', screen: 'upload' });
      return;
    }

    let cancelled = false;
    let navTimer: ReturnType<typeof setTimeout> | undefined;

    // The steps are paced, because one request has no progress to report. The last one is
    // not: the ring stops short of full and the screen does not move until the real answer
    // lands, so the completion it shows is the true one.
    const timers = STEPS.slice(0, -1).map((_, i) =>
      setTimeout(() => !cancelled && setDone(i + 1), 700 + i * 900),
    );

    if (!parse.current) parse.current = readResume(file, student);

    void parse.current.then((outcome) => {
      if (cancelled) return;
      if (!outcome.ok) {
        setFailure({ message: outcome.message, retryable: outcome.retryable });
        return;
      }
      setDone(STEPS.length);
      dispatch({ type: 'updateStudent', patch: outcome.patch });
      dispatch({
        type: 'patch',
        patch: {
          pendingResume: null,
          resumeConfidence: outcome.confidence,
          ...(outcome.toast ? { toast: outcome.toast } : {}),
        },
      });
      // A beat on a completed ring, so the screen reads as finished rather than skipped.
      navTimer = setTimeout(() => dispatch({ type: 'nav', screen: 'review' }), 420);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, attempt]);

  /** The same file, sent again. The failure was the model's, so nothing else has to change. */
  const again = () => {
    parse.current = null;
    setFailure(null);
    setDone(0);
    setAttempt((n) => n + 1);
  };

  const pct = Math.round((done / STEPS.length) * 100);

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: 'linear-gradient(165deg,#241B45 0%,#403483 55%,#5B45A8 100%)' }}
    >
      <StatusBar dark />
      <div className="px-5 py-2">
        <Logo light />
      </div>

      {failure ? (
        <ParseFailed
          message={failure.message}
          retryable={failure.retryable}
          onAgain={again}
          onAnotherFile={() => dispatch({ type: 'nav', screen: 'upload' })}
          onManual={() => dispatch({ type: 'nav', screen: 'm-basic' })}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="relative mb-9 flex h-[132px] w-[132px] items-center justify-center">
            <svg width="132" height="132" className="-rotate-90">
              <circle cx="66" cy="66" r="60" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
              <circle
                cx="66"
                cy="66"
                r="60"
                fill="none"
                stroke="#A78BFA"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 - (2 * Math.PI * 60 * pct) / 100}
                style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }}
              />
            </svg>
            <span className="absolute text-[30px] font-bold text-white">{pct}%</span>
          </div>

          <h1 className="text-center text-[23px] font-bold tracking-tight text-white">
            Building your profile
          </h1>
          <p className="mt-2 text-center text-[13.5px] leading-relaxed text-white/60">
            Reading through your resume. This usually takes under 30 seconds.
          </p>

          <div className="mt-8 w-full space-y-3.5">
            {STEPS.map((s, i) => {
              const complete = i < done;
              const active = i === done;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full transition-colors"
                    style={{
                      background: complete ? '#A78BFA' : 'rgba(255,255,255,0.14)',
                      color: complete ? '#241B45' : 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {complete ? (
                      <IconCheck size={12} strokeWidth={3.2} />
                    ) : active ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
                    ) : null}
                  </span>
                  <span
                    className="text-[14px] transition-colors"
                    style={{ color: complete || active ? '#fff' : 'rgba(255,255,255,0.45)' }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <HomeIndicator dark />
    </div>
  );
}

/**
 * A parse that did not work. It offers the manual path as an equal, not a consolation:
 * the profile is what the fit engine reads, and a student typing it themselves gets
 * exactly the same product as one whose PDF happened to parse cleanly.
 */
function ParseFailed({
  message,
  retryable,
  onAgain,
  onAnotherFile,
  onManual,
}: {
  message: string;
  retryable: boolean;
  onAgain: () => void;
  onAnotherFile: () => void;
  onManual: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-white">
        <IconFile size={24} />
      </span>
      <h1 className="text-[23px] font-bold tracking-tight text-white">
        {retryable ? 'That didn’t go through' : "That one didn't come through"}
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{message}</p>

      <div className="mt-8 w-full space-y-2.5">
        <button
          onClick={retryable ? onAgain : onAnotherFile}
          className="press w-full rounded-md bg-white px-4 py-3 text-[14.5px] font-bold text-ink-900"
        >
          {retryable ? 'Try again' : 'Try another file'}
        </button>
        <button
          onClick={onManual}
          className="press w-full rounded-md border border-white/25 px-4 py-3 text-[14.5px] font-semibold text-white"
        >
          Fill it in myself
        </button>
        {retryable && (
          <button
            onClick={onAnotherFile}
            className="press w-full py-1.5 text-[13px] font-semibold text-white/55"
          >
            Choose a different file
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * What a parse is allowed to change.
 *
 * Name and email came from signing up and are the student's own, so a resume only fills
 * them when they are empty — a PDF that spells a name differently does not get to rename
 * anybody. Preferences are missing on purpose: no resume states a stipend expectation or
 * a work mode, so those stay a question the app asks rather than one it guesses at.
 */
function appliedProfile(parsed: ParsedResume, student: Student): Partial<Student> {
  const p = parsed.profile;
  return {
    name: student.name || p.name,
    email: student.email || p.email,
    phone: p.phone,
    university: p.university,
    degree: p.degree,
    field: p.field,
    gradYear: p.gradYear,
    skills: p.skills,
    projects: p.projects,
    experience: p.experience,
    education: p.education,
    links: { ...student.links, ...p.links },
  };
}

/** A field the student typed themselves is not something the parser has to be sure about. */
function appliedConfidence(parsed: ParsedResume, student: Student): ParsedResume['confidence'] {
  return {
    ...parsed.confidence,
    name: student.name ? 'high' : parsed.confidence.name,
    email: student.email ? 'high' : parsed.confidence.email,
  };
}

/** One attempt at a resume: the parse, or the reason there isn't one. */
async function readResume(file: File, student: Student): Promise<Outcome> {
  try {
    const parsed = await parseResume(db, file);
    return {
      ok: true,
      patch: {
        ...appliedProfile(parsed, student),
        resume: {
          filename: file.name,
          size: prettySize(file.size),
          updated: 'Updated just now',
        },
      },
      confidence: appliedConfidence(parsed, student),
    };
  } catch (err) {
    if (err instanceof ResumeParseError && err.notConfigured) return sampleProfile(file, student);
    console.error('[InSwipe] resume parse failed', err);
    return {
      ok: false,
      message:
        err instanceof ResumeParseError
          ? err.message
          : 'We could not read that resume. It may be a scan rather than a text PDF.',
      retryable: err instanceof ResumeParseError ? err.retryable : false,
    };
  }
}

/**
 * No key on the project yet.
 *
 * Parsing is the first of the five AI touchpoints and this repo is checked out without a
 * key, so rather than dead-ending the demo this keeps the scripted stand-in that stood
 * here before: the seeded profile, applied to whoever is signing up. Their name, email and
 * photo stay theirs. Nothing is flagged for confirmation, because nothing was read — and
 * the toast says so, since a sample profile presented as *their* resume would be a lie.
 */
async function sampleProfile(file: File, student: Student): Promise<Outcome> {
  try {
    const sample = await loadStudentProfile(db, DEMO_STUDENT_ID);
    return {
      ok: true,
      patch: {
        phone: sample.phone,
        university: sample.university,
        degree: sample.degree,
        field: sample.field,
        gradYear: sample.gradYear,
        skills: sample.skills,
        projects: sample.projects,
        experience: sample.experience,
        education: sample.education,
        links: sample.links,
        resume: {
          filename: file.name || resumeFilename(student.name),
          size: prettySize(file.size),
          updated: 'Updated just now',
        },
      },
      confidence: null,
      toast: 'Demo mode — resume parsing is not switched on yet',
    };
  } catch (err) {
    console.error('[InSwipe] sample profile failed', err);
    return {
      ok: false,
      message: 'We could not build your profile. Try again in a moment.',
      retryable: true,
    };
  }
}

/* --------------------------- Review extracted --------------------------- */

export function ReviewProfile() {
  const { state, dispatch } = useStore();
  const s = state.student;
  /**
   * A field the parser was not sure about gets the "Confirm?" chip. This is the whole
   * reason the screen exists (CLAUDE.md section 6) — parsing is imperfect, and the
   * student is shown precisely where, rather than being asked to re-read everything.
   * A typed profile has no confidence to report, so nothing is flagged.
   */
  const unsure = (field: keyof ParsedResume['confidence']) =>
    state.resumeConfidence ? state.resumeConfidence[field] !== 'high' : false;
  const addSkillHint = () =>
    dispatch({ type: 'patch', patch: { toast: 'You can add more skills anytime from your profile' } });

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <StepHeader step={3} of={3} onBack={() => dispatch({ type: 'back' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[25px] font-bold leading-tight tracking-tight text-ink-900">
            Here's what we found
          </h1>
        </div>
        <p className="mt-2 text-[14px] text-ink-500">Check it over — you can change anything.</p>

        <Card title="Basic info">
          <Row label="Full name" value={s.name} confirm={unsure('name')} />
          <Row label="Email" value={s.email} confirm={unsure('email')} />
          <Row label="Phone" value={s.phone} confirm={unsure('phone')} />
          <Row label="University" value={s.university} confirm={unsure('university')} />
          <Row label="Degree" value={s.degree} confirm={unsure('degree')} />
          <Row label="Graduation year" value={s.gradYear} confirm={unsure('gradYear')} />
        </Card>

        <Card title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {s.skills.map((sk) => (
              <Tag key={sk.name} kind="neutral">
                {sk.name}
              </Tag>
            ))}
            <button
              onClick={addSkillHint}
              className="press inline-flex items-center gap-1 rounded-sm border border-dashed border-line px-2 py-1 text-[11.5px] font-semibold text-ink-500"
            >
              <IconPlus size={12} /> Add skill
            </button>
          </div>
        </Card>

        <Card title="Projects">
          {s.projects.length === 0 && <Nothing>No projects found — you can add them from your profile.</Nothing>}
          <div className="space-y-3.5">
            {s.projects.map((p) => (
              <div key={p.id}>
                <div className="text-[14px] font-bold text-ink-900">{p.name}</div>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-500">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Tag key={t} kind="primary">
                      {t}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Experience">
          {s.experience.length === 0 && <Nothing>No experience found — that is normal this early.</Nothing>}
          {s.experience.map((e) => (
            <div key={e.id}>
              <div className="text-[14px] font-bold text-ink-900">{e.role}</div>
              <div className="text-[12.5px] text-ink-500">
                {e.company} · {e.mode}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-300">{e.period}</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-ink-500">{e.summary}</p>
            </div>
          ))}
        </Card>

        <Card title="Education">
          {!s.education.degree && !s.education.university && (
            <Nothing>Nothing found — add it from your profile.</Nothing>
          )}
          <div className="text-[14px] font-bold text-ink-900">{s.education.degree}</div>
          <div className="text-[12.5px] text-ink-500">{s.education.university}</div>
          <div className="mt-0.5 text-[12px] text-ink-300">
            {[s.education.period, s.education.cgpa].filter(Boolean).join(' · ')}
          </div>
        </Card>
      </div>

      <div className="border-t border-line bg-white px-6 py-3.5">
        <Button size="lg" full onClick={() => dispatch({ type: 'nav', screen: 'main' })}>
          Looks good — continue
        </Button>
      </div>
      <HomeIndicator />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  const { dispatch } = useStore();
  return (
    <section className="mt-5 rounded-lg bg-white p-4 shadow-subtle">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>{title}</SectionLabel>
        <button
          onClick={() =>
            dispatch({ type: 'patch', patch: { toast: `You can edit ${title.toLowerCase()} anytime from your profile` } })
          }
          className="press -mt-2 text-ink-300"
          aria-label={`Edit ${title}`}
        >
          <IconEdit size={16} />
        </button>
      </div>
      {children}
    </section>
  );
}

function Nothing({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] leading-[1.5] text-ink-300">{children}</p>;
}

function Row({ label, value, confirm }: { label: string; value: string; confirm?: boolean }) {
  return (
    <div className="border-b border-line py-2 last:border-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">{label}</div>
      <div className="mt-0.5 flex items-center gap-2">
        <span
          className={`text-[14px] ${value ? 'text-ink-900' : 'text-ink-300'} ${
            confirm ? 'decoration-gap-500 decoration-dotted underline underline-offset-4' : ''
          }`}
        >
          {value || 'Not found'}
        </span>
        {confirm && (
          <span className="rounded-sm bg-gap-100 px-1.5 py-0.5 text-[10px] font-bold text-gap-600">
            Confirm?
          </span>
        )}
      </div>
    </div>
  );
}

export function StepHeader({
  step,
  of,
  onBack,
}: {
  step: number;
  of: number;
  onBack: () => void;
}) {
  return (
    <div className="px-5 py-2">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="press -ml-1 text-ink-700" aria-label="Back">
          <IconBack size={22} />
        </button>
        <span className="text-[12.5px] font-semibold text-ink-500">
          Step {step} of {of}
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${(step / of) * 100}%` }}
        />
      </div>
    </div>
  );
}

export { AiLabel };
