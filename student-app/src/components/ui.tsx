import React from 'react';
import { bandColor } from '../lib/fit';
import type { ApplicationStatus, Company } from '../data/types';
import { IconCheck, IconClose, IconSparkle } from './Icons';

/* ---------------- Button ---------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}) {
  const sizes = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-11 px-4 text-[14.5px]',
    lg: 'h-[52px] px-5 text-[15.5px]',
  }[size];

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-45',
    secondary:
      'bg-white text-ink-900 border border-line hover:bg-canvas disabled:opacity-45',
    ghost: 'bg-transparent text-ink-500 hover:text-ink-900 disabled:opacity-45',
    danger: 'bg-white text-pass-500 border border-pass-500/40 hover:bg-pass-100',
  };

  return (
    <button
      className={`press inline-flex items-center justify-center gap-2 rounded-md font-semibold disabled:cursor-not-allowed ${sizes} ${variants[variant]} ${
        full ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Chip & Tag ---------------- */

export function Chip({
  selected,
  children,
  onClick,
  className = '',
}: {
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`press rounded-md border px-3 py-2 text-[13px] font-semibold transition-colors ${
        selected
          ? 'border-primary-500 bg-primary-100 text-primary-500'
          : 'border-line bg-white text-ink-700 hover:border-ink-300'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Tag({
  kind = 'neutral',
  children,
}: {
  kind?: 'neutral' | 'primary' | 'fit' | 'gap';
  children: React.ReactNode;
}) {
  const styles = {
    neutral: 'bg-canvas text-ink-700 border border-transparent',
    primary: 'bg-primary-100 text-primary-500 border border-transparent',
    fit: 'bg-fit-100 text-fit-600 border border-transparent',
    gap: 'bg-transparent text-gap-500 border border-gap-500/45',
  }[kind];
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-sm px-2 py-1 text-[11.5px] font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

/* ---------------- Fit score ---------------- */

export function FitPill({ score, className = '' }: { score: number; className?: string }) {
  const strong = score >= 85;
  const good = score >= 70;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
        strong
          ? 'bg-fit-100 text-fit-600'
          : good
            ? 'bg-primary-100 text-primary-500'
            : 'bg-canvas text-ink-500'
      } ${className}`}
    >
      {score}% fit
    </span>
  );
}

export function FitRing({
  score,
  size = 72,
  label,
  light,
}: {
  score: number;
  size?: number;
  label?: string;
  light?: boolean;
}) {
  const stroke = size >= 100 ? 8 : size >= 70 ? 6 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = light ? '#fff' : bandColor(score);
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={light ? 'rgba(255,255,255,0.25)' : '#E8E8EF'}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      {/* Sized to the ring, not to the wrapper — the wrapper also holds the label
          below, and centring across both pushes the number off the ring's centre. */}
      <div
        className="absolute left-0 top-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold leading-none"
          style={{ fontSize: size * 0.28, color: light ? '#fff' : '#0F1117' }}
        >
          {score}%
        </span>
      </div>
      {label && (
        <span
          className="mt-1.5 text-[11px] font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function FitBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[104px] shrink-0 text-[12.5px] text-ink-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        {/* One colour for all four bars. They are parts of a single score, so length
            carries the comparison — band-colouring them made a low bar read as broken. */}
        <div
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${value}%`, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-[12.5px] font-bold text-ink-900">{value}%</span>
    </div>
  );
}

export function FitRow({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-fit-100 text-fit-500">
        <IconCheck size={12} strokeWidth={3} />
      </span>
      <div>
        <div className="text-[13.5px] font-bold text-ink-900">{label}</div>
        <div className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-500">{reason}</div>
      </div>
    </div>
  );
}

export function GapRow({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-[3px] h-[15px] w-[15px] shrink-0 rounded-full border-2 border-gap-500" />
      <div>
        <div className="text-[13.5px] font-bold text-ink-900">{label}</div>
        <div className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-500">{reason}</div>
      </div>
    </div>
  );
}

/* ---------------- Status ---------------- */

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-canvas text-ink-500' },
  reviewing: { label: 'Under review', className: 'bg-primary-100 text-primary-500' },
  shortlisted: { label: 'Shortlisted', className: 'bg-primary-500 text-white' },
  selected: { label: 'Selected', className: 'bg-fit-100 text-fit-600' },
  rejected: { label: 'Not selected', className: 'bg-canvas text-ink-300' },
};

export function StatusTag({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export const statusLabel = (s: ApplicationStatus) => STATUS_META[s].label;

/* ---------------- Company mark ---------------- */

/**
 * The image every job card, job detail and company profile leads with.
 *
 * `company.gradient` stays underneath rather than being replaced by the image: it is
 * what paints while the file loads, what shows if the file is missing, and what keeps
 * the card looking like the company it belongs to either way. Decorative, so it is
 * hidden from screen readers — the company name is right below it in every caller.
 */
export function CompanyCover({
  company,
  className = '',
  style,
  children,
}: {
  company: Pick<Company, 'coverUrl' | 'gradient'>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={`relative ${className}`} style={{ background: company.gradient, ...style }}>
      {company.coverUrl && !failed && (
        <img
          src={company.coverUrl}
          alt=""
          aria-hidden
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  );
}

export function CompanyLogo({
  initial,
  color,
  size = 44,
  radius = 12,
}: {
  initial: string;
  color: string;
  size?: number;
  radius?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-extrabold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </span>
  );
}

/**
 * A student's face, or their initial. A profile without a photo is a normal profile,
 * so the lettered circle is the resting state rather than a placeholder to apologise for.
 */
export function Avatar({
  initial,
  size = 32,
  src,
  className = '',
}: {
  initial: string;
  size?: number;
  src?: string;
  className?: string;
}) {
  const box = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`inline-block shrink-0 rounded-full object-cover ${className}`}
        style={box}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-500 ${className}`}
      style={{ ...box, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-primary-100 px-1.5 py-0.5 text-[10.5px] font-bold text-primary-500">
      Verified
    </span>
  );
}

export function AiLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)' }}
    >
      <IconSparkle size={12} />
      {children}
    </span>
  );
}

/* ---------------- Layout helpers ---------------- */

export function Sheet({
  open,
  onClose,
  children,
  heightPct = 85,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightPct?: number;
}) {
  return (
    <div
      className={`absolute inset-0 z-40 overflow-hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/55 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0 }}
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[28px] bg-canvas shadow-raised transition-transform duration-300"
        style={{
          height: `${heightPct}%`,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-ink-900/55" onClick={onClose} />
      <div className="animate-popIn relative w-full rounded-[28px] bg-white p-6 shadow-raised">
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-9 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ink-300 shadow-subtle">
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton animate-shimmer rounded-md ${className}`} />;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-300">
      {children}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[168px] z-30 flex justify-center transition-all duration-200"
      style={{ opacity: message ? 1 : 0, transform: message ? 'translateY(0)' : 'translateY(8px)' }}
    >
      <div className="rounded-lg bg-ink-900/90 px-4 py-2.5 text-[13px] font-semibold text-white">
        {message}
      </div>
    </div>
  );
}

export function SheetHeader({
  title,
  onClose,
  right,
}: {
  title: string;
  onClose: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-1">
      <h2 className="text-[19px] font-bold text-ink-900">{title}</h2>
      <div className="flex items-center gap-3">
        {right}
        <button onClick={onClose} className="press text-ink-500" aria-label="Close">
          <IconClose size={20} />
        </button>
      </div>
    </div>
  );
}
