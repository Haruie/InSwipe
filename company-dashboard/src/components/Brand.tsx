import { useState } from "react";

/**
 * The InSwipe mark and the full lockup, served from `public/brand/` — put there by
 * `node scripts/brand.mjs`. If a file is missing the drawn fallback takes over, so the
 * dashboard never shows a broken image.
 *
 * Note this is InSwipe's own brand, not a customer's. The sidebar and the applicant
 * rows show the *company's* logo; this belongs only where the product speaks as itself:
 * the landing page and the footer.
 */

export function BrandMark({ size = 36, radius }: { size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: radius ?? Math.round(size * 0.22) };

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
          flexShrink: 0,
        }}
      >
        IS
      </div>
    );
  }

  return (
    <img
      src="/brand/logo.png"
      alt=""
      onError={() => setFailed(true)}
      style={{ ...style, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

/** Mark, wordmark and the tagline. Light surfaces only \u2014 the artwork has a light ground. */
export function BrandLockup({ width = 200 }: { width?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BrandMark size={36} />
        <span style={{ fontWeight: 700, fontSize: 18, color: "#0F1117", letterSpacing: -0.4 }}>
          InSwipe
        </span>
      </div>
    );
  }

  return (
    <img
      src="/brand/banner.png"
      alt="InSwipe \u2014 AI-powered internship matchmaking"
      onError={() => setFailed(true)}
      style={{ width, height: "auto" }}
    />
  );
}
