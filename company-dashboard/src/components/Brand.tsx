import { useState } from "react";

/**
 * The InSwipe app mark — the same artwork the student app and the browser-tab
 * favicon use, served from `public/brand/logo.png`. If the file is missing the
 * drawn indigo tile below takes over, so the dashboard never shows a broken
 * image — it just looks the way it did before the artwork landed.
 */

const MARK_SRC = "/brand/logo.png";

export function BrandMark({ size = 36, radius }: { size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const style = {
    width: size,
    height: size,
    borderRadius: radius ?? Math.round(size * 0.22),
    flexShrink: 0,
  } as const;

  if (failed) {
    return (
      <div
        style={{
          ...style,
          background: "#4F46E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: Math.round(size * 0.42),
          letterSpacing: -0.5,
        }}
      >
        IS
      </div>
    );
  }

  return (
    <img
      src={MARK_SRC}
      alt=""
      onError={() => setFailed(true)}
      style={{ ...style, objectFit: "contain", display: "block" }}
    />
  );
}

/** Mark + "InSwipe" wordmark. `light` flips the wordmark white for dark surfaces. */
export function Logo({ size = 36, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BrandMark size={size} />
      <span
        style={{
          fontWeight: 700,
          fontSize: size >= 36 ? 18 : 16,
          color: light ? "#fff" : "#0F1117",
          letterSpacing: -0.4,
        }}
      >
        InSwipe
      </span>
    </div>
  );
}
