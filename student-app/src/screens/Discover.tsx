import { useCallback, useRef, useState } from 'react';
import { useDeck, useStore } from '../store';
import { getJob } from '../data/jobs';
import { getCompany } from '../data/companies';
import { skillSplit } from '../lib/fit';
import type { FitScore, Job } from '../data/types';
import { AppHeader } from '../components/AppHeader';
import {
  Button,
  Chip,
  CompanyLogo,
  EmptyState,
  FitPill,
  SectionLabel,
  Sheet,
  SheetHeader,
  Skeleton,
  Tag,
  VerifiedBadge,
} from '../components/ui';
import {
  IconCalendar,
  IconCheck,
  IconClose,
  IconFilter,
  IconHome,
  IconPin,
  IconRupee,
  IconStarFilled,
} from '../components/Icons';

const THRESHOLD = 100;

export function Discover() {
  const { state, dispatch } = useStore();
  const deck = useDeck();
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exiting, setExiting] = useState<null | 'apply' | 'pass'>(null);
  const start = useRef({ x: 0, y: 0 });

  const top = deck[0];
  const behind = deck.slice(1, 3);
  const filtersActive = state.filters.minFit > 0 || state.filters.workMode !== 'Any';

  const reset = () => setDrag({ x: 0, y: 0, active: false });

  const fly = useCallback(
    (dir: 'apply' | 'pass', jobId: string) => {
      setExiting(dir);
      setTimeout(() => {
        setExiting(null);
        reset();
        if (dir === 'pass') dispatch({ type: 'pass', jobId });
        else dispatch({ type: 'openNote', jobId });
      }, 300);
    },
    [dispatch],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (exiting) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.active) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true });
  };
  const onPointerUp = () => {
    if (!drag.active || !top) return;
    if (drag.x > THRESHOLD) {
      fly('apply', top.id);
      return;
    }
    if (drag.x < -THRESHOLD) {
      fly('pass', top.id);
      return;
    }
    // A tap, not a drag. Pointer capture swallows the click event, so open here.
    if (Math.abs(drag.x) < 6 && Math.abs(drag.y) < 6) {
      dispatch({ type: 'patch', patch: { detailJobId: top.id } });
      dispatch({ type: 'nav', screen: 'detail' });
    }
    reset();
  };

  const applyOpacity = exiting === 'apply' ? 1 : Math.max(0, Math.min(1, drag.x / 110));
  const passOpacity = exiting === 'pass' ? 1 : Math.max(0, Math.min(1, -drag.x / 110));

  let tx = drag.x;
  let ty = drag.y * 0.3;
  let rot = drag.x / 20;
  if (exiting) {
    tx = exiting === 'apply' ? 560 : -560;
    rot = exiting === 'apply' ? 22 : -22;
    ty = -30;
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader />

      <div className="flex items-start justify-between px-5 pb-3">
        <div>
          <h1 className="text-[21px] font-bold leading-tight tracking-tight text-ink-900">
            Opportunities for you
          </h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Ranked by how well you fit — best first.
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'patch', patch: { sheet: 'filter' } })}
          className="press mt-1 rounded-md border border-line bg-white p-2 text-ink-700"
          aria-label="Filter"
        >
          <IconFilter size={18} />
        </button>
      </div>

      {/* card area — 524px budget */}
      <div className="relative mx-4 flex-1" style={{ minHeight: 0 }}>
        {top ? (
          <>
            {/* The stack peeks into the 32px reserved below the card, never into the actions. */}
            {behind.map((b, i) => (
              <div
                key={b.id}
                className="absolute inset-x-0 top-0 rounded-xl bg-white shadow-card"
                style={{
                  height: 'calc(100% - 32px)',
                  transform: `scale(${1 - (i + 1) * 0.045}) translateY(${(i + 1) * 16}px)`,
                  opacity: 0.85 - i * 0.35,
                  zIndex: 1,
                }}
              />
            ))}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="absolute inset-x-0 top-0 z-10 cursor-grab touch-none active:cursor-grabbing"
              style={{
                height: 'calc(100% - 32px)',
                transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
                opacity: exiting ? 0 : 1,
                transition: drag.active
                  ? 'none'
                  : 'transform .3s cubic-bezier(.22,1,.36,1), opacity .3s ease',
              }}
            >
              <JobCard job={getJob(top.id)} fit={top.fit} applyOpacity={applyOpacity} passOpacity={passOpacity} />
            </div>
          </>
        ) : filtersActive ? (
          // Filters hid everything — saying "all caught up" here would be a lie.
          <EmptyState
            icon={<IconFilter size={22} />}
            title="Nothing matches these filters"
            body={`${state.deck.length} ${
              state.deck.length === 1 ? 'opportunity is' : 'opportunities are'
            } waiting, but none of them fit what you've filtered to.`}
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({ type: 'patch', patch: { filters: { minFit: 0, workMode: 'Any' } } })
                }
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<IconHome size={22} />}
            title="You're all caught up"
            body="New opportunities matched to your profile land here daily. Check back tomorrow."
            action={
              <Button variant="secondary" onClick={() => dispatch({ type: 'tab', tab: 'saved' })}>
                Review your saved list
              </Button>
            }
          />
        )}
      </div>

      {/* action row — 88px budget */}
      <div className="flex h-[92px] shrink-0 items-start justify-center gap-11 pt-4">
        <Action
          label="PASS"
          onClick={() => top && !exiting && fly('pass', top.id)}
          disabled={!top || !!exiting}
          size={56}
          color="#DC2626"
          border
        >
          <IconClose size={23} strokeWidth={2.6} />
        </Action>
        <Action
          label="SAVE"
          onClick={() => top && dispatch({ type: 'toggleSave', jobId: top.id })}
          disabled={!top}
          size={48}
          color={top && state.saved.includes(top.id) ? '#F59E0B' : '#F59E0B'}
          filled={Boolean(top && state.saved.includes(top.id))}
        >
          <IconStarFilled size={19} />
        </Action>
        <Action
          label="APPLY"
          onClick={() => top && !exiting && fly('apply', top.id)}
          disabled={!top || !!exiting}
          size={56}
          color="#16A34A"
          solid
        >
          <IconCheck size={24} strokeWidth={2.8} />
        </Action>
      </div>

      <FilterSheet />
    </div>
  );
}

function Action({
  children,
  label,
  onClick,
  disabled,
  size,
  color,
  solid,
  filled,
  border,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  size: number;
  color: string;
  solid?: boolean;
  filled?: boolean;
  border?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="press flex items-center justify-center rounded-full disabled:opacity-40"
        style={{
          width: size,
          height: size,
          background: solid ? color : '#fff',
          color: solid ? '#fff' : color,
          border: border ? `1.5px solid ${color}33` : filled ? `1.5px solid ${color}` : '1.5px solid #E8E8EF',
          boxShadow: '0 4px 12px rgba(15,17,23,0.08)',
        }}
      >
        {children}
      </button>
      <span className="text-[9.5px] font-bold tracking-wide text-ink-300">{label}</span>
    </div>
  );
}

/* ------------------------------- Job card ------------------------------- */

export function JobCard({
  job,
  fit,
  applyOpacity = 0,
  passOpacity = 0,
  onOpen,
}: {
  job: Job;
  fit: FitScore;
  applyOpacity?: number;
  passOpacity?: number;
  onOpen?: () => void;
}) {
  const { state } = useStore();
  const company = getCompany(job.companyId);
  const { met, missing } = skillSplit(state.student, job);

  // One line only. Always keep a slot for a gap when one exists — the green/orange
  // split is the whole point of the card, so it must never be hidden behind "+n".
  const metShown = met.slice(0, missing.length ? 2 : 3);
  const missShown = missing.slice(0, 3 - metShown.length);
  const shown = [
    ...metShown.map((s) => ({ s, met: true })),
    ...missShown.map((s) => ({ s, met: false })),
  ];
  const overflow = met.length + missing.length - shown.length;

  return (
    <div
      onClick={onOpen}
      className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-deck"
    >
      {/* image — 50% of card */}
      <div className="relative h-1/2 shrink-0" style={{ background: company.gradient }}>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,0.28) 100%)' }}
        />
        <div className="absolute right-3.5 top-3.5">
          <FitPill score={fit.score} className="shadow-subtle" />
        </div>
        <div className="absolute -bottom-6 left-4">
          <div className="rounded-xl bg-white p-1.5 shadow-card">
            <CompanyLogo initial={company.initial} color={company.color} size={44} />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-9">
        <div className="flex items-center gap-2">
          <span className="text-[15.5px] font-bold text-ink-900">{company.name}</span>
          {company.verified && <VerifiedBadge />}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[12px] text-ink-500">
          <IconPin size={13} />
          {job.location} · {job.workMode}
        </div>

        <h2 className="mt-2 text-[19px] font-bold leading-tight tracking-tight text-ink-900">
          {job.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.45] text-ink-500">
          {job.about.split('\n')[0]}
        </p>

        <div className="mt-auto">
          <div className="flex h-[28px] items-center gap-1.5 overflow-hidden">
            {shown.map(({ s, met }) => (
              <Tag key={s} kind={met ? 'fit' : 'gap'}>
                {s}
              </Tag>
            ))}
            {overflow > 0 && (
              <span className="rounded-sm bg-canvas px-2 py-1 text-[11.5px] font-semibold text-ink-300">
                +{overflow}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[12.5px] text-ink-700">
            <span className="flex items-center gap-1.5">
              <IconCalendar size={14} /> {job.durationMonths} months
            </span>
            <span className="flex items-center gap-1">
              <IconRupee size={14} /> {job.stipend.toLocaleString('en-IN')}/month
            </span>
          </div>
        </div>
      </div>

      {/* drag overlays */}
      <Overlay opacity={applyOpacity} color="#16A34A" label="APPLY">
        <IconCheck size={30} strokeWidth={3} />
      </Overlay>
      <Overlay opacity={passOpacity} color="#DC2626" label="PASS">
        <IconClose size={28} strokeWidth={3} />
      </Overlay>
    </div>
  );
}

function Overlay({
  opacity,
  color,
  label,
  children,
}: {
  opacity: number;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl"
      style={{ background: `${color}26`, opacity }}
    >
      <span
        className="flex h-[68px] w-[68px] items-center justify-center rounded-full text-white"
        style={{ background: color, boxShadow: `0 8px 20px ${color}59` }}
      >
        {children}
      </span>
      <span className="text-[20px] font-extrabold tracking-wide" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

/* ----------------------------- Filter sheet ----------------------------- */

function FilterSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === 'filter';
  const close = () => dispatch({ type: 'patch', patch: { sheet: null } });
  const f = state.filters;
  const setF = (patch: Partial<typeof f>) =>
    dispatch({ type: 'patch', patch: { filters: { ...f, ...patch } } });

  const remaining = useDeck().length;

  return (
    <Sheet open={open} onClose={close} heightPct={62}>
      <SheetHeader title="Filter opportunities" onClose={close} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <SectionLabel>Work mode</SectionLabel>
        <div className="mb-6 flex gap-2">
          {(['Any', 'Remote', 'Hybrid', 'On-site'] as const).map((m) => (
            <Chip key={m} selected={f.workMode === m} onClick={() => setF({ workMode: m })} className="flex-1">
              {m}
            </Chip>
          ))}
        </div>

        <SectionLabel>Minimum fit score</SectionLabel>
        <div className="rounded-lg bg-white p-4 shadow-subtle">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] text-ink-500">Show me roles above</span>
            <span className="text-[15px] font-bold text-primary-500">{f.minFit}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={95}
            step={5}
            value={f.minFit}
            onChange={(e) => setF({ minFit: Number(e.target.value) })}
            className="w-full accent-primary-500"
          />
          <div className="mt-1 flex justify-between text-[11px] text-ink-300">
            <span>0%</span>
            <span>95%</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 border-t border-line bg-white px-5 py-3.5">
        <Button variant="secondary" className="flex-1" onClick={() => setF({ minFit: 0, workMode: 'Any' })}>
          Reset
        </Button>
        <Button className="flex-[2]" onClick={close}>
          Show {remaining} {remaining === 1 ? 'opportunity' : 'opportunities'}
        </Button>
      </div>
    </Sheet>
  );
}
