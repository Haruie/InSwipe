import { useCallback, useEffect, useRef, useState } from "react";
import type { Candidate } from "../data/mock";
import { KANBAN_STAGES, fitBand } from "../data/mock";

interface Props {
  candidates: Candidate[];
  onStageChange: (id: string, stage: Candidate["stage"]) => void;
}

const STAGE_STYLE: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  "Applied":         { dot: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB", text: "#6B7280" },
  "Reviewed":        { dot: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  "Selected":        { dot: "#4F46E5", bg: "#EEF0FF", border: "#C7D2FE", text: "#4F46E5" },
  "In Conversation": { dot: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
  "Interview":       { dot: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", text: "#0369A1" },
  "Offer":           { dot: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" },
  "Hired":           { dot: "#16A34A", bg: "#DCFCE7", border: "#86EFAC", text: "#15803D" },
};

function CardBody({ c }: { c: Candidate }) {
  const { color } = fitBand(c.fitScore);
  return (
    <>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate" style={{ color: "#0F1117" }}>{c.name}</div>
          <div className="text-[11px] truncate" style={{ color: "#9CA3AF" }}>{c.school.split(" ").slice(0, 2).join(" ")}</div>
        </div>
        <div className="text-[12px] font-bold flex-shrink-0" style={{ color }}>{c.fitScore}%</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {c.fits.slice(0, 2).map((s) => <span key={s} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#DCFCE7", color: "#15803D" }}>{s}</span>)}
      </div>
    </>
  );
}

export default function Pipeline({ candidates, onStageChange }: Props) {
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; w: number; ox: number; oy: number } | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const overRef = useRef(overStage);
  overRef.current = overStage;

  const byStage = KANBAN_STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter((c) => c.stage === s);
    return acc;
  }, {} as Record<string, Candidate[]>);

  const stageUnderPoint = (x: number, y: number): string | null => {
    for (const s of KANBAN_STAGES) {
      const el = colRefs.current[s];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s;
    }
    return null;
  };

  const startDrag = (e: React.PointerEvent, c: Candidate) => {
    // left button only
    if (e.button !== 0) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ id: c.id, x: e.clientX, y: e.clientY, w: r.width, ox: e.clientX - r.left, oy: e.clientY - r.top });
    setOverStage(c.stage);
  };

  const onMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return;
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    setOverStage(stageUnderPoint(e.clientX, e.clientY));
  }, []);

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    const target = overRef.current;
    setDrag(null);
    setOverStage(null);
    if (!d) return;
    const current = candidates.find((c) => c.id === d.id);
    if (!current || !target || current.stage === target) return;
    onStageChange(d.id, target as Candidate["stage"]);
    setFlash(`${current.name} → ${target}`);
    setTimeout(() => setFlash(null), 1800);
  }, [candidates, onStageChange]);

  useEffect(() => {
    if (!drag) return;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      document.body.style.userSelect = "";
    };
  }, [drag, onMove, endDrag]);

  const draggingCandidate = drag ? candidates.find((c) => c.id === drag.id) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E8EF", background: "#FFFFFF" }}>
        <div>
          <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Hiring Pipeline</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>Drag a candidate into another column to move them · {candidates.length} total</p>
        </div>
        {flash && (
          <span className="anim-fade-in text-[12px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "#F0FDF4", color: "#15803D" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
            {flash}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-3 h-full" style={{ minWidth: "max-content" }}>
          {KANBAN_STAGES.map((stage) => {
            const s = STAGE_STYLE[stage] || STAGE_STYLE["Applied"];
            const isOver = overStage === stage && drag !== null;
            const list = byStage[stage] || [];
            return (
              <div
                key={stage}
                ref={(el) => { colRefs.current[stage] = el; }}
                className="flex flex-col rounded-[16px] border min-w-[200px] w-[200px] flex-shrink-0 overflow-hidden transition-all duration-150"
                style={{
                  background: isOver ? s.bg : "#F9FAFB",
                  borderColor: isOver ? s.dot : "#E8E8EF",
                  boxShadow: isOver ? `0 0 0 2px ${s.border}` : "none",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E8E8EF" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                    <span className="text-[12px] font-semibold" style={{ color: s.text }}>{stage}</span>
                  </div>
                  <span className="text-[11px] font-semibold min-w-5 h-5 px-1 rounded-full flex items-center justify-center" style={{ background: "#E8E8EF", color: "#6B7280" }}>{list.length}</span>
                </div>
                <div className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto" style={{ minHeight: 120 }}>
                  {list.map((c) => {
                    const isBeing = drag?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onPointerDown={(e) => startDrag(e, c)}
                        className="rounded-xl border p-3.5 select-none anim-lift-in"
                        style={{
                          background: "#FFFFFF",
                          borderColor: "#E8E8EF",
                          cursor: isBeing ? "grabbing" : "grab",
                          opacity: isBeing ? 0.35 : 1,
                          touchAction: "none",
                          boxShadow: "0 1px 3px rgba(15,17,23,0.06)",
                        }}
                      >
                        <CardBody c={c} />
                      </div>
                    );
                  })}
                  {isOver && (
                    <div className="rounded-xl border-2 border-dashed h-14 flex items-center justify-center flex-shrink-0" style={{ borderColor: s.dot }}>
                      <span className="text-[12px] font-medium" style={{ color: s.text }}>Drop here</span>
                    </div>
                  )}
                  {list.length === 0 && !isOver && (
                    <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: "#C7C7D1" }}>Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating card that follows the cursor while dragging */}
      {drag && draggingCandidate && (
        <div
          className="fixed pointer-events-none rounded-xl border p-3.5 z-50"
          style={{
            left: drag.x - drag.ox,
            top: drag.y - drag.oy,
            width: drag.w,
            background: "#FFFFFF",
            borderColor: "#4F46E5",
            boxShadow: "0 12px 32px rgba(15,17,23,0.18)",
            transform: "rotate(-1.5deg)",
          }}
        >
          <CardBody c={draggingCandidate} />
        </div>
      )}
    </div>
  );
}
