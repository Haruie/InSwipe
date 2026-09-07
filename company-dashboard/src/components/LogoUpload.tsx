import { useRef, useState, type DragEvent } from "react";

/**
 * Real logo upload: click anywhere on the dropzone to open the OS file picker,
 * or drag an image file onto it. The file is read locally as a data: URL and
 * handed back via onChange — no upload endpoint, it's stored on the account in
 * localStorage. Validates type and size and shows the failure inline.
 */

const ACCEPT = "image/png,image/jpeg,image/svg+xml,image/webp";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Initial letter shown when there's no logo yet. */
  fallbackInitial?: string;
  /** "field" = tall dashed dropzone (onboarding). "inline" = compact swatch + button (profile). */
  variant?: "field" | "inline";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export default function LogoUpload({ value, onChange, fallbackInitial = "?", variant = "field" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const accept = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use a PNG, JPG, SVG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 2 MB. Try a smaller one.");
      return;
    }
    setBusy(true);
    try {
      onChange(await readAsDataUrl(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void accept(e.dataTransfer.files?.[0]);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      style={{ display: "none" }}
      onChange={(e) => {
        void accept(e.target.files?.[0]);
        e.target.value = ""; // allow re-picking the same file
      }}
    />
  );

  /* ── inline variant (Company Profile) ─────────────────────────────────── */
  if (variant === "inline") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {hiddenInput}
        <div
          onClick={openPicker}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          aria-label="Upload company logo"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 overflow-hidden cursor-pointer"
          style={{
            background: value ? "#FFFFFF" : "#4F46E5",
            border: dragging ? "2px dashed #4F46E5" : "2px solid transparent",
            outline: dragging ? "none" : undefined,
          }}
        >
          {value ? (
            <img src={value} alt="Company logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            fallbackInitial
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={openPicker}
              className="btn-press"
              style={{ fontSize: 12, fontWeight: 600, color: "#4F46E5", background: "#EEF0FF", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
            >
              {busy ? "Reading…" : value ? "Replace" : "Upload logo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setError(null); }}
                className="btn-press"
                style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", background: "#F7F7FB", border: "1px solid #E8E8EF", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}
              >
                Remove
              </button>
            )}
          </div>
          <span style={{ fontSize: 11, color: error ? "#DC2626" : "#9CA3AF" }}>
            {error ?? "PNG, JPG, SVG or WebP · max 2 MB · or drop a file on the logo"}
          </span>
        </div>
      </div>
    );
  }

  /* ── field variant (onboarding step 1) ───────────────────────────────── */
  return (
    <div>
      {hiddenInput}
      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload company logo"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        style={{
          border: `2px dashed ${dragging ? "#4F46E5" : error ? "#DC2626" : "#D1D5DB"}`,
          borderRadius: 12,
          padding: value ? "20px" : "32px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#EEF0FF" : "transparent",
          transition: "border-color 0.15s, background 0.15s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Company logo preview"
              style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid #E8E8EF" }}
            />
            <p style={{ fontSize: 13, color: "#4F46E5", fontWeight: 600 }}>
              {busy ? "Reading…" : "Replace logo"}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); setError(null); }}
              style={{ fontSize: 12, color: "#6B7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#4F46E5" : "#9CA3AF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
            </svg>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              {dragging ? "Drop to upload" : <>Drop your logo here or <span style={{ color: "#4F46E5", fontWeight: 600 }}>click to browse</span></>}
            </p>
          </>
        )}
      </div>
      <p style={{ fontSize: 11, color: error ? "#DC2626" : "#9CA3AF", marginTop: 6 }}>
        {error ?? "PNG, JPG, SVG or WebP · Max 2 MB · Square works best"}
      </p>
    </div>
  );
}
