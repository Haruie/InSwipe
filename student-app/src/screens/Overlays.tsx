import { useMemo } from 'react';
import { useStore } from '../store';
import { getCompany, getJob } from '../data/catalog';
import { computeFit } from '../lib/fit';
import { Button, CompanyLogo, FitRing, Modal } from '../components/ui';
import { IconCheck } from '../components/Icons';

/* ------------------------ Applied confirmation ------------------------ */

export function AppliedModal() {
  const { state, dispatch } = useStore();
  const jobId = state.appliedModal;
  if (!jobId) return null;

  const job = getJob(jobId);
  const company = getCompany(job.companyId);
  const active = state.applications.filter((a) => a.status !== 'rejected').length;
  const close = () => dispatch({ type: 'patch', patch: { appliedModal: null } });

  return (
    <Modal open onClose={close}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fit-100 text-fit-500">
          <IconCheck size={26} strokeWidth={3} />
        </span>
        <h2 className="text-[19px] font-bold leading-snug text-ink-900">
          Applied to {job.title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-500">
          {company.name} will review your application. You'll hear here if they select you.
        </p>
        <p className="mt-2 text-[12.5px] text-ink-300">{active} applications active</p>

        <div className="mt-5 flex w-full flex-col gap-2.5">
          <Button
            full
            onClick={() => {
              close();
              dispatch({ type: 'tab', tab: 'discover' });
            }}
          >
            Keep swiping
          </Button>
          <Button
            variant="secondary"
            full
            onClick={() => {
              close();
              dispatch({ type: 'tab', tab: 'applications' });
            }}
          >
            View my applications
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------- Selection overlay -------------------------- */

const CONFETTI_COLORS = ['#A78BFA', '#4F46E5', '#16A34A', '#F59E0B', '#F472B6'];

export function SelectionOverlay() {
  const { state, dispatch } = useStore();
  const jobId = state.selection;

  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 700),
        duration: 2200 + Math.round(Math.random() * 1400),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 4 + Math.round(Math.random() * 4),
      })),
    [jobId],
  );

  if (!jobId) return null;

  const job = getJob(jobId);
  const company = getCompany(job.companyId);
  const fit = computeFit(state.student, job);
  const close = () => dispatch({ type: 'patch', patch: { selection: null } });

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden px-8 text-center"
      style={{ background: 'linear-gradient(165deg,#241B45 0%,#403483 55%,#5B45A8 100%)' }}
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-[-24px] rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.7,
            background: p.color,
            animation: `confetti ${p.duration}ms linear ${p.delay}ms infinite`,
          }}
        />
      ))}

      <div className="animate-popIn relative flex flex-col items-center">
        <span className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
          InSwipe
        </span>

        <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight text-white">
          You've been
          <br />
          selected.
        </h1>

        <div className="mt-8 flex items-center gap-4">
          <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-white/95 text-[22px] font-bold text-primary-500">
            {state.student.initial}
          </span>
          <span className="text-[20px] text-white/45">✦</span>
          <div className="rounded-2xl bg-white/95 p-1.5">
            <CompanyLogo initial={company.initial} color={company.color} size={50} />
          </div>
        </div>

        <p className="mt-6 max-w-[260px] text-[14px] leading-[1.5] text-white/70">
          {company.name} wants to talk about {job.title}
        </p>

        <div className="mt-6">
          <FitRing score={fit.score} size={82} light />
          <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50">
            Fit score
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <button
            onClick={() => {
              close();
              dispatch({ type: 'patch', patch: { chatJobId: jobId } });
              dispatch({ type: 'readConversation', jobId });
              dispatch({ type: 'tab', tab: 'inbox' });
              dispatch({ type: 'nav', screen: 'chat' });
            }}
            className="press h-[52px] w-full rounded-md bg-white text-[15.5px] font-bold text-ink-900"
          >
            Read their message
          </button>
          <button onClick={close} className="press py-1 text-[14px] font-medium text-white/60">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
