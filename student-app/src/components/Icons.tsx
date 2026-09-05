interface P {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (size: number, className?: string, sw = 1.75) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

export const IconHome = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);
export const IconFile = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);
export const IconStar = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
);
export const IconStarFilled = ({ size = 22, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </svg>
);
export const IconChat = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
  </svg>
);
export const IconUser = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
);
export const IconLock = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
export const IconBell = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 3.5-1 5-2 6.5h16c-1-1.5-2-3-2-6.5z" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);
export const IconBack = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const IconChevron = ({ size = 20, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
export const IconClose = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconCheck = ({ size = 22, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth ?? 2.4)}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
export const IconPin = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconCalendar = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
export const IconRupee = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M7 4h10M7 9h10M16 4c0 4-3.5 5-7 5l7 10" />
  </svg>
);
export const IconUpload = ({ size = 26, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);
export const IconSparkle = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5 13.8 8 19 9.8 13.8 11.6 12 17 10.2 11.6 5 9.8 10.2 8z" />
    <path d="M18.5 15.5 19.4 18l2.6.9-2.6.9-.9 2.6-.9-2.6L15 18l2.6-.9z" opacity=".65" />
  </svg>
);
export const IconRefresh = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </svg>
);
export const IconSearch = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);
export const IconSend = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.5 20.5 21 12 3.5 3.5 3.5 10l11 2-11 2z" />
  </svg>
);
export const IconPlus = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconEdit = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
  </svg>
);
export const IconFilter = ({ size = 20, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);
export const IconEye = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconTrend = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, className, strokeWidth)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
