import { useState } from 'react';

/**
 * The InSwipe mark and the full lockup.
 *
 * Both are served as image files out of `public/brand/`, put there by
 * `node scripts/brand.mjs` from the originals in the repo's `brand/` folder. If a file
 * is missing the drawn fallback below takes over, so the app never shows a broken image
 * — it just looks the way it did before the artwork landed.
 */

const MARK_SRC = '/brand/logo.png';
const LOCKUP_SRC = '/brand/banner.png';

/** The square app mark on its own. Used wherever space is tight. */
export function BrandMark({ size = 26, radius }: { size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: radius ?? size * 0.3 };

  if (failed) {
    return (
      <span
        className="flex items-center justify-center font-extrabold text-white"
        style={{
          ...style,
          background: 'linear-gradient(135deg,#4F46E5,#7C6CF5)',
          fontSize: size * 0.55,
        }}
      >
        i
      </span>
    );
  }

  return (
    <img
      src={MARK_SRC}
      alt=""
      onError={() => setFailed(true)}
      className="shrink-0 object-contain"
      style={style}
    />
  );
}

/**
 * The full lockup — mark, wordmark and the "AI-powered internship matchmaking" line.
 *
 * The artwork is 522×176, and the tagline stops being legible much below about 350px
 * wide. That rules it out of every slot in a 390px phone frame and out of a 64px-tall
 * navigation bar, so the only place it earns its space is a landing hero. Everywhere
 * else uses `Logo` — the mark plus the name — or `BrandMark` on its own.
 */
export function BrandLockup({ width = 220 }: { width?: number }) {
  const [failed, setFailed] = useState(false);

  // The lockup artwork is drawn on a light ground, so it belongs on light surfaces.
  // Dark screens use `Logo light`, which is the mark plus a white wordmark.
  if (failed) {
    return (
      <span className="flex flex-col gap-1.5">
        <Logo size={30} />
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-300">
          AI-powered internship matchmaking
        </span>
      </span>
    );
  }

  return (
    <img
      src={LOCKUP_SRC}
      alt="InSwipe — AI-powered internship matchmaking"
      onError={() => setFailed(true)}
      style={{ width, height: 'auto' }}
    />
  );
}

/** The mark and the name. The app's header lockup. */
export function Logo({ size = 26, light }: { size?: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <BrandMark size={size} />
      <span
        className="text-[15px] font-bold tracking-tight"
        style={{ color: light ? '#fff' : '#0F1117' }}
      >
        InSwipe
      </span>
    </span>
  );
}
