import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import { Logo } from '../components/AppHeader';
import { AiLabel, Button, SectionLabel, Tag } from '../components/ui';
import { IconBack, IconCheck, IconEdit, IconFile, IconPlus, IconUpload } from '../components/Icons';

/* ------------------------------ Upload ------------------------------ */

export function ResumeUpload() {
  const { dispatch } = useStore();
  const [phase, setPhase] = useState<'idle' | 'uploading'>('idle');
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (phase !== 'uploading') return;
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(id);
          setTimeout(() => dispatch({ type: 'nav', screen: 'parsing' }), 260);
          return 100;
        }
        return p + 8;
      });
    }, 90);
    return () => clearInterval(id);
  }, [phase, dispatch]);

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

        {phase === 'idle' ? (
          <button
            onClick={() => setPhase('uploading')}
            className="press mt-7 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-white/60 px-8 text-center hover:border-primary-300"
            style={{ maxHeight: 340 }}
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-500">
              <IconUpload size={24} />
            </span>
            <span className="text-[15.5px] font-bold text-ink-900">
              Drop your resume here or browse
            </span>
            <span className="mt-1.5 text-[12.5px] text-ink-300">PDF, DOC or DOCX · max 5 MB</span>
            <span className="mt-5 rounded-md border border-line bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-900">
              Choose file
            </span>
          </button>
        ) : (
          <div className="mt-7 rounded-xl bg-white p-5 shadow-subtle">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-100 text-primary-500">
                <IconFile size={20} />
              </span>
              <div className="flex-1">
                <div className="text-[14px] font-bold text-ink-900">Anika_Sharma_Resume.pdf</div>
                <div className="text-[12.5px] text-ink-500">142 KB · Uploading…</div>
              </div>
              <span className="text-[13px] font-bold text-primary-500">{Math.min(pct, 100)}%</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-150"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
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

export function ResumeParsing() {
  const { dispatch } = useStore();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setDone(i + 1), 700 + i * 900));
    const finish = setTimeout(() => dispatch({ type: 'nav', screen: 'review' }), 700 + STEPS.length * 900 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [dispatch]);

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
      <HomeIndicator dark />
    </div>
  );
}

/* --------------------------- Review extracted --------------------------- */

export function ReviewProfile() {
  const { state, dispatch } = useStore();
  const s = state.student;

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
          <Row label="Full name" value={s.name} />
          <Row label="Email" value={s.email} />
          <Row label="Phone" value={s.phone} confirm />
          <Row label="University" value={s.university} />
          <Row label="Degree" value={s.degree} />
          <Row label="Graduation year" value={s.gradYear} confirm />
        </Card>

        <Card title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {s.skills.map((sk) => (
              <Tag key={sk.name} kind="neutral">
                {sk.name}
              </Tag>
            ))}
            <button className="press inline-flex items-center gap-1 rounded-sm border border-dashed border-line px-2 py-1 text-[11.5px] font-semibold text-ink-500">
              <IconPlus size={12} /> Add skill
            </button>
          </div>
        </Card>

        <Card title="Projects">
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
          <div className="text-[14px] font-bold text-ink-900">{s.education.degree}</div>
          <div className="text-[12.5px] text-ink-500">{s.education.university}</div>
          <div className="mt-0.5 text-[12px] text-ink-300">
            {s.education.period} · {s.education.cgpa}
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
  return (
    <section className="mt-5 rounded-lg bg-white p-4 shadow-subtle">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>{title}</SectionLabel>
        <button className="press -mt-2 text-ink-300" aria-label={`Edit ${title}`}>
          <IconEdit size={16} />
        </button>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, confirm }: { label: string; value: string; confirm?: boolean }) {
  return (
    <div className="border-b border-line py-2 last:border-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">{label}</div>
      <div className="mt-0.5 flex items-center gap-2">
        <span
          className={`text-[14px] text-ink-900 ${
            confirm ? 'decoration-gap-500 decoration-dotted underline underline-offset-4' : ''
          }`}
        >
          {value}
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
