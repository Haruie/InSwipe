import { useState } from 'react';
import { createStudentAccount, signInStudent } from '@inswipe/data';
import { useStore } from '../store';
import { DEMO_STUDENT_ID, db } from '../lib/db';
import { StatusBar, HomeIndicator } from '../components/PhoneFrame';
import { Logo } from '../components/AppHeader';
import { AiLabel, Button, CompanyLogo, FitPill } from '../components/ui';
import { IconBack, IconCheck, IconLock, IconSparkle, IconUpload } from '../components/Icons';

const GRADIENT = 'linear-gradient(165deg,#1B1730 0%,#2E2560 55%,#3B2A6E 100%)';

/* ------------------------------- Splash ------------------------------- */

export function Splash() {
  const { dispatch } = useStore();
  return (
    <div className="flex h-full flex-col" style={{ background: GRADIENT }}>
      <StatusBar dark />
      <div className="flex flex-1 flex-col justify-between px-7 pb-4 pt-2">
        <Logo light />

        <div className="relative -mx-1 my-4 h-[210px]">
          <MiniCard
            name="Zomato"
            initial="Z"
            color="#E23744"
            role="Product Design Intern"
            score={64}
            className="absolute right-1 top-0 w-[228px] rotate-[6deg]"
          />
          <MiniCard
            name="Nexora Labs"
            initial="N"
            color="#4F46E5"
            role="Frontend Developer Intern"
            score={92}
            className="absolute left-0 top-[74px] w-[244px] -rotate-[4deg]"
          />
        </div>

        <div>
          <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-tight text-white">
            Swipe in.
            <br />
            <span className="text-[#A78BFA]">Stand out.</span>
          </h1>
          <p className="mt-3.5 max-w-[280px] text-[14.5px] leading-[1.5] text-white/60">
            AI-powered matching between students and the companies hiring them.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" full onClick={() => dispatch({ type: 'nav', screen: 'intro' })}>
            Get Started
          </Button>
          <button
            onClick={() => {
              dispatch({ type: 'patch', patch: { authMode: 'signin' } });
              dispatch({ type: 'nav', screen: 'auth' });
            }}
            className="press py-1 text-[14px] font-medium text-white/70"
          >
            I already have an account
          </button>
        </div>
      </div>
      <HomeIndicator dark />
    </div>
  );
}

function MiniCard({
  name,
  initial,
  color,
  role,
  score,
  className,
}: {
  name: string;
  initial: string;
  color: string;
  role: string;
  score: number;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-white p-3 shadow-raised ${className}`}>
      <div className="flex items-center gap-2.5">
        <CompanyLogo initial={initial} color={color} size={32} radius={9} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-ink-900">{name}</div>
          <div className="truncate text-[11.5px] text-ink-500">{role}</div>
        </div>
        <FitPill score={score} />
      </div>
    </div>
  );
}

/* -------------------------------- Intro -------------------------------- */

const SLIDES = [
  {
    title: 'Your resume, understood',
    body: 'Upload it once. AI turns it into a living profile — skills, projects and evidence.',
    art: <ArtResume />,
  },
  {
    title: 'Jobs ranked by how well you fit',
    body: 'Internships ordered by your fit score, not by the date they were posted.',
    art: <ArtRank />,
  },
  {
    title: 'Get selected, then talk',
    body: 'Your inbox stays locked until a company picks you. Selection is everything.',
    art: <ArtLock />,
  },
];

export function Intro() {
  const { state, dispatch } = useStore();
  const i = state.introIndex;
  const slide = SLIDES[i];

  const next = () => {
    if (i < SLIDES.length - 1) dispatch({ type: 'patch', patch: { introIndex: i + 1 } });
    else dispatch({ type: 'nav', screen: 'auth' });
  };

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <div className="flex items-center justify-between px-5 py-2">
        <Logo />
        <button
          onClick={() => dispatch({ type: 'nav', screen: 'auth' })}
          className="press text-[13.5px] font-semibold text-ink-500"
        >
          Skip
        </button>
      </div>

      <div key={i} className="animate-fadeUp flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-9">{slide.art}</div>
        <h2 className="text-[25px] font-bold leading-tight tracking-tight text-ink-900">
          {slide.title}
        </h2>
        <p className="mt-3 text-[14.5px] leading-[1.55] text-ink-500">{slide.body}</p>
      </div>

      <div className="flex items-center justify-center gap-2 pb-5">
        {SLIDES.map((_, n) => (
          <span
            key={n}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: n === i ? 22 : 6, background: n === i ? '#4F46E5' : '#D8D9E3' }}
          />
        ))}
      </div>
      <div className="px-6 pb-4">
        <Button size="lg" full onClick={next}>
          {i === SLIDES.length - 1 ? 'Create my profile' : 'Next'}
        </Button>
      </div>
      <HomeIndicator />
    </div>
  );
}

function ArtResume() {
  return (
    <div className="relative h-[168px] w-[228px]">
      <div className="absolute left-0 top-2 w-[122px] rounded-lg bg-white p-3 shadow-card">
        <div className="mb-2 h-2 w-14 rounded-full bg-line" />
        <div className="mb-1.5 h-1.5 w-full rounded-full bg-line" />
        <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-line" />
        <div className="h-1.5 w-5/6 rounded-full bg-line" />
      </div>
      <div
        className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-raised"
        style={{ background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)' }}
      >
        <IconSparkle size={18} />
      </div>
      <div className="absolute bottom-0 right-1 w-[142px] rounded-lg bg-white p-3 shadow-raised">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary-100" />
          <div className="h-2 w-16 rounded-full bg-line" />
        </div>
        <div className="flex flex-wrap gap-1">
          {['React', 'Node', 'SQL'].map((s) => (
            <span key={s} className="rounded-sm bg-fit-100 px-1.5 py-0.5 text-[9px] font-bold text-fit-600">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtRank() {
  return (
    <div className="flex w-[224px] flex-col gap-2.5">
      {[92, 78, 61].map((s, n) => (
        <div
          key={s}
          className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card"
          style={{ marginLeft: n * 12, opacity: 1 - n * 0.18 }}
        >
          <span className="h-8 w-8 shrink-0 rounded-md bg-canvas" />
          <div className="flex-1">
            <div className="mb-1.5 h-2 w-20 rounded-full bg-line" />
            <div className="h-1.5 w-14 rounded-full bg-line" />
          </div>
          <FitPill score={s} />
        </div>
      ))}
    </div>
  );
}

function ArtLock() {
  return (
    <div className="relative flex h-[150px] w-[210px] items-center justify-center">
      <div className="absolute left-0 top-2 rounded-lg bg-white px-3.5 py-2.5 shadow-card">
        <span className="flex items-center gap-2 text-[11.5px] font-bold text-ink-300">
          <IconLock size={14} /> LOCKED
        </span>
      </div>
      <div className="absolute bottom-1 right-0 w-[150px] rounded-lg bg-white p-3 shadow-raised">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fit-100 text-fit-500">
            <IconCheck size={11} strokeWidth={3} />
          </span>
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-fit-600">
            Selected
          </span>
        </div>
        <div className="rounded-md bg-canvas px-2.5 py-2 text-[11px] leading-tight text-ink-500">
          Nexora Labs · just now
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Auth --------------------------------- */

export function Auth() {
  const { state, dispatch, signIn } = useStore();
  const signup = state.authMode === 'signup';
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [busy, setBusy] = useState<null | 'form' | 'google' | 'linkedin'>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const emailValid = /\S+@\S+\.\S+/.test(fields.email);
  const emailError = touchedEmail && fields.email.length > 0 && !emailValid;
  const disabled = signup
    ? !(fields.name && emailValid && fields.password)
    : !(emailValid && fields.password);

  const run = async (what: 'form' | 'google' | 'linkedin', work: () => Promise<void>) => {
    setBusy(what);
    setFailure(null);
    try {
      await work();
    } catch (error) {
      console.error('[InSwipe] sign-in failed', error);
      setFailure('Something went wrong reaching the server. Try again.');
    } finally {
      setBusy(null);
    }
  };

  /**
   * The real path. Signing up writes a `students` row and the app runs as that student
   * from here on — an empty profile, an empty application list, and the deck ranked
   * against whatever they tell us next. Signing in looks the account up by email.
   */
  const submit = () =>
    run('form', async () => {
      if (signup) {
        const id = await createStudentAccount(db, { name: fields.name.trim(), email: fields.email.trim() });
        await signIn(id, { onboarded: false });
        return;
      }
      const id = await signInStudent(db, fields.email.trim());
      if (!id) {
        setFailure('No account with that email. Sign up instead?');
        return;
      }
      await signIn(id, { onboarded: true });
    });

  /**
   * Demo shortcut. There is no OAuth yet (CLAUDE.md section 10), so these two open the
   * seeded student's account — a populated app to demonstrate against, one tap in.
   */
  const bypass = (which: 'google' | 'linkedin') =>
    run(which, () => signIn(DEMO_STUDENT_ID, { onboarded: true }));

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <div className="flex items-center justify-between px-5 py-2">
        <button onClick={() => dispatch({ type: 'back' })} className="press -ml-1 text-ink-700">
          <IconBack size={22} />
        </button>
        <Logo size={24} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4">
        <h1 className="mt-1 text-[27px] font-bold leading-tight tracking-tight text-ink-900">
          {signup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-[14px] text-ink-500">
          {signup ? 'Start matching with internships in minutes.' : 'Pick up right where you left off.'}
        </p>

        <div className="mt-5 flex rounded-md bg-[#EDEDF3] p-1">
          {(['signup', 'signin'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'patch', patch: { authMode: mode } })}
              className={`flex-1 rounded-[9px] py-2.5 text-[13.5px] font-semibold transition-all ${
                state.authMode === mode ? 'bg-white text-ink-900 shadow-subtle' : 'text-ink-300'
              }`}
            >
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {signup && (
            <Field
              label="Full name"
              value={fields.name}
              onChange={(v) => setFields({ ...fields, name: v })}
              placeholder="Anika Sharma"
            />
          )}
          <Field
            label="Email"
            value={fields.email}
            onChange={(v) => setFields({ ...fields, email: v })}
            onBlur={() => setTouchedEmail(true)}
            placeholder="anika@srm.edu.in"
            error={emailError ? 'Enter a valid email address' : undefined}
          />
          <Field
            label="Password"
            type="password"
            value={fields.password}
            onChange={(v) => setFields({ ...fields, password: v })}
            placeholder="••••••••"
          />
        </div>

        {failure && (
          <p className="mt-4 rounded-md bg-pass-100 px-3 py-2.5 text-[12.5px] font-medium text-pass-500">
            {failure}
          </p>
        )}

        <Button
          size="lg"
          full
          className="mt-5"
          disabled={disabled || busy !== null}
          onClick={submit}
        >
          {busy === 'form'
            ? signup
              ? 'Creating your account…'
              : 'Signing you in…'
            : signup
              ? 'Create account'
              : 'Sign in'}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[12px] text-ink-300">or continue with</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-2.5">
          <OAuthButton
            label={busy === 'google' ? 'Opening the demo account…' : 'Continue with Google'}
            disabled={busy !== null}
            onClick={() => bypass('google')}
          />
          <OAuthButton
            label={busy === 'linkedin' ? 'Opening the demo account…' : 'Continue with LinkedIn'}
            hint="imports your profile"
            disabled={busy !== null}
            onClick={() => bypass('linkedin')}
          />
        </div>
        <p className="mt-2.5 text-center text-[11.5px] text-ink-300">
          Both open the demo student's account, already full of activity.
        </p>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-ink-300">
          By continuing you agree to InSwipe's Terms of Service and Privacy Policy.
        </p>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  onBlur?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-ink-500">{label}</span>
      <input
        type={type}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-md border bg-white px-3.5 text-[14.5px] text-ink-900 placeholder:text-ink-300 ${
          error ? 'border-pass-500' : 'border-line'
        }`}
      />
      {error && <span className="mt-1 block text-[12px] font-medium text-pass-500">{error}</span>}
    </label>
  );
}

function OAuthButton({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press flex h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-white text-[14px] font-semibold text-ink-900 disabled:opacity-50"
    >
      {label}
      {hint && <span className="text-[12px] font-normal text-ink-300">· {hint}</span>}
    </button>
  );
}

/* --------------------------------- Fork --------------------------------- */

export function Fork() {
  const { dispatch } = useStore();
  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <div className="flex items-center px-5 py-2">
        <button onClick={() => dispatch({ type: 'back' })} className="press -ml-1 text-ink-700">
          <IconBack size={22} />
        </button>
      </div>

      <div className="flex-1 px-6">
        <h1 className="text-[27px] font-bold leading-tight tracking-tight text-ink-900">
          How would you like to build your profile?
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Either way you can edit everything afterwards.
        </p>

        <div className="mt-7 flex flex-col gap-4">
          <button
            onClick={() => dispatch({ type: 'nav', screen: 'upload' })}
            className="press relative overflow-hidden rounded-xl bg-white p-5 text-left shadow-card"
            style={{ border: '1.5px solid transparent', backgroundClip: 'padding-box' }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                padding: 1.5,
                background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <div className="mb-3 flex items-center justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-md text-white"
                style={{ background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)' }}
              >
                <IconUpload size={20} />
              </span>
              <AiLabel>Fastest · 30 seconds</AiLabel>
            </div>
            <h2 className="text-[18px] font-bold text-ink-900">Upload your resume</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-500">
              We read it and build your profile in seconds — skills, projects and the evidence
              behind them.
            </p>
          </button>

          <button
            // A new account starts empty, so there is nothing to clear here — and
            // clearing would now be a write, not a local reset.
            onClick={() => dispatch({ type: 'nav', screen: 'm-basic' })}
            className="press rounded-xl border border-line bg-white p-5 text-left"
          >
            <h2 className="text-[17px] font-bold text-ink-900">Fill it in manually</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-500">
              Enter your details yourself. Takes about 5 minutes.
            </p>
          </button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}
