import React, { useEffect, useState } from 'react';

const W = 390;
const H = 844;

/**
 * On a phone the app fills the screen. On a laptop it renders inside a device frame
 * so the layout is always exercised at its real 390x844 size.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [{ scale, bare }, set] = useState({ scale: 1, bare: false });

  useEffect(() => {
    const measure = () => {
      const bare = window.innerWidth < 520;
      const scale = bare
        ? 1
        : Math.min((window.innerHeight - 48) / H, (window.innerWidth - 48) / W, 1.08);
      set({ scale: Math.max(scale, 0.4), bare });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (bare) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-canvas">
        <div className="relative h-full w-full overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <div
          className="relative overflow-hidden bg-black"
          style={{
            width: W + 12,
            height: H + 12,
            borderRadius: 58,
            padding: 6,
            boxShadow: '0 40px 90px rgba(15,17,23,0.34), 0 0 0 1px rgba(15,17,23,0.06)',
          }}
        >
          <div
            className="relative overflow-hidden bg-canvas"
            style={{ width: W, height: H, borderRadius: 52 }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** iOS-style status bar. Dark variant for gradient screens. */
export function StatusBar({ dark }: { dark?: boolean }) {
  const c = dark ? '#fff' : '#0F1117';
  return (
    <div className="relative z-30 flex h-[52px] shrink-0 items-center justify-between px-7 pt-1">
      <span className="text-[15px] font-semibold tracking-tight" style={{ color: c }}>
        9:41
      </span>
      <div
        className="absolute left-1/2 top-2 h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black"
        style={{ display: 'block' }}
      />
      <div className="flex items-center gap-1.5" style={{ color: c }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="2.8" height="4" rx="0.6" opacity="0.4" />
          <rect x="4.2" y="5" width="2.8" height="6" rx="0.6" opacity="0.7" />
          <rect x="8.4" y="2.6" width="2.8" height="8.4" rx="0.6" />
          <rect x="12.6" y="0" width="2.8" height="11" rx="0.6" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 9.6 9.4 7.4a2.9 2.9 0 0 0-3.8 0zM7.5 1a9 9 0 0 1 6 2.3l-1.3 1.5a7 7 0 0 0-9.4 0L1.5 3.3A9 9 0 0 1 7.5 1zm0 3.2c1.5 0 2.9.5 4 1.5L10.2 7.2a4.2 4.2 0 0 0-5.4 0L3.5 5.7a6.2 6.2 0 0 1 4-1.5z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.8" fill="currentColor" />
          <path d="M23 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export function HomeIndicator({ dark }: { dark?: boolean }) {
  return (
    <div className="flex h-[22px] shrink-0 items-end justify-center pb-2">
      <span
        className="h-[5px] w-[134px] rounded-full"
        style={{ background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(15,17,23,0.28)' }}
      />
    </div>
  );
}
