import { useEffect, useState } from 'react';
import { useFit, useStore } from '../store';
import { getJob } from '../data/jobs';
import { getCompany } from '../data/companies';
import { draftNote } from '../lib/note';
import {
  AiLabel,
  Button,
  CompanyLogo,
  FitRing,
  Sheet,
  SheetHeader,
  FitRow,
  GapRow,
} from '../components/ui';
import { IconFile, IconRefresh } from '../components/Icons';

/* -------------------------- Fit breakdown sheet -------------------------- */

export function FitSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === 'fit';
  const jobId = state.detailJobId;
  const fit = useFit(jobId);
  const close = () => dispatch({ type: 'patch', patch: { sheet: null } });

  if (!fit || !jobId) return <Sheet open={false} onClose={close}>{null}</Sheet>;

  const job = getJob(jobId);

  return (
    <Sheet open={open} onClose={close} heightPct={86}>
      <SheetHeader
        title="Your fit for this role"
        onClose={close}
        right={<FitRing score={fit.score} size={44} />}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <p className="mb-5 rounded-md bg-white px-3.5 py-3 text-[12.5px] leading-[1.5] text-ink-500 shadow-subtle">
          Based on required skills, the evidence behind them, your preferences and your
          availability.
        </p>

        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-fit-600">
          What you bring
        </div>
        <div className="space-y-3.5 rounded-lg bg-white p-4 shadow-subtle">
          {fit.fits.map((f) => (
            <FitRow key={f.label} label={f.label} reason={f.reason} />
          ))}
        </div>

        {fit.gaps.length > 0 && (
          <>
            <div className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-gap-600">
              What to work on
            </div>
            <div className="space-y-3.5 rounded-lg bg-white p-4 shadow-subtle">
              {fit.gaps.map((g) => (
                <GapRow key={g.label} label={g.label} reason={g.reason} />
              ))}
            </div>

            <Button
              variant="secondary"
              full
              className="mt-4"
              onClick={() => {
                close();
                dispatch({ type: 'nav', screen: 'learning' });
              }}
            >
              Add these to my learning list
            </Button>
          </>
        )}

        <p className="mt-5 text-center text-[12px] text-ink-300">
          Your fit updates as you add skills and projects.
        </p>
      </div>
    </Sheet>
  );
}

/* ---------------------------- Application note ---------------------------- */

export function NoteSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === 'note';
  const jobId = state.noteJobId;
  const fit = useFit(jobId);
  const [text, setText] = useState('');
  const close = () => dispatch({ type: 'patch', patch: { sheet: null, noteJobId: null } });

  useEffect(() => {
    if (open && jobId && fit) setText(draftNote(state.student, getJob(jobId), fit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId]);

  if (!jobId || !fit) return <Sheet open={false} onClose={close}>{null}</Sheet>;

  const job = getJob(jobId);
  const company = getCompany(job.companyId);

  return (
    <Sheet open={open} onClose={close} heightPct={72}>
      <div className="px-5 pb-3 pt-1">
        <div className="flex items-center gap-3">
          <CompanyLogo initial={company.initial} color={company.color} size={40} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-bold text-ink-900">{company.name}</div>
            <div className="truncate text-[12.5px] text-ink-500">{job.title}</div>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-ink-500">
          Applying to <span className="font-semibold text-ink-900">{job.title}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5">
        <div className="mb-2 flex items-center justify-between">
          <AiLabel>AI-drafted — edit or send as is</AiLabel>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Add a note (optional)"
          className="h-[164px] w-full resize-none rounded-lg border border-line bg-white p-3.5 text-[13.5px] leading-[1.55] text-ink-900 placeholder:text-ink-300"
        />

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11.5px] text-ink-300">{text.length} / 500</span>
          <button
            onClick={() => setText(draftNote(state.student, job, fit))}
            className="press flex items-center gap-1.5 text-[12.5px] font-semibold text-primary-500"
          >
            <IconRefresh size={14} /> Regenerate
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-md border border-line bg-white p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-500">
            <IconFile size={16} />
          </span>
          <span className="flex-1 text-[12.5px] leading-tight text-ink-500">
            <span className="font-semibold text-ink-900">{state.student.resume?.filename}</span> will
            be sent with your application
          </span>
        </div>
      </div>

      <div className="flex gap-3 border-t border-line bg-white px-5 py-3.5">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => dispatch({ type: 'apply', jobId })}
        >
          Send without note
        </Button>
        <Button className="flex-1" onClick={() => dispatch({ type: 'apply', jobId, note: text })}>
          Send with note
        </Button>
      </div>
    </Sheet>
  );
}
