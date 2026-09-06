import { useState } from "react";
import { fitBand } from "@inswipe/core";
import { KANBAN_STAGES, type Candidate } from "../data/candidates";
import { useDashboard } from "../data/store";

interface Props {
  candidates: Candidate[];
}

const STAGE_STYLE: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  "Applied":         { dot: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB",  text: "#6B7280" },
  "Reviewed":        { dot: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A",  text: "#92400E" },
  "Selected":        { dot: "#4F46E5", bg: "#EEF0FF", border: "#E8E8EF",  text: "#4F46E5" },
  "In Conversation": { dot: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",  text: "#15803D" },
  "Interview":       { dot: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD",  text: "#0369A1" },
  "Offer":           { dot: "#EA580C", bg: "#FFF7ED", border: "#FED7AA",  text: "#9A3412" },
  "Hired":           { dot: "#16A34A", bg: "#DCFCE7", border: "#86EFAC",  text: "#15803D" },
};

function KanbanCard({ candidate: c, onDragStart, onDragEnd, isDragging }: { candidate: Candidate; onDragStart: () => void; onDragEnd: () => void; isDragging: boolean }) {
  const { color, label } = fitBand(c.fitScore);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-xl border p-3.5 cursor-grab active:cursor-grabbing select-none anim-lift-in"
      style={{
        background: isDragging ? "#EEF0FF" : "#FFFFFF",
        borderColor: isDragging ? "#4F46E5" : "#E8E8EF",
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.97) rotate(-0.5deg)" : "none",
        transition: "all 0.14s ease",
        boxShadow: isDragging ? "0 8px 24px rgba(15,17,23,0.10)" : "0 1px 3px rgba(15,17,23,0.06)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: c.avatarColor, color: "#4F46E5" }}>{c.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate" style={{ color: "#0F1117" }}>{c.name}</div>
          <div className="text-[11px] truncate" style={{ color: "#9CA3AF" }}>{c.school.split(" ").slice(0, 2).join(" ")}</div>
        </div>
        <div className="text-[12px] font-bold flex-shrink-0" style={{ color }}>{c.fitScore}%</div>
      </div>
      <div className="flex flex-wrap gap-1">
        {c.fits.slice(0, 2).map(s => <span key={s} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#DCFCE7", color: "#15803D" }}>{s}</span>)}
      </div>
    </div>
  );
}

function Column({ stage, candidates, draggingId, onDragStart, onDragEnd, onDrop, isOver }: {
  stage: string; candidates: Candidate[]; draggingId: string | null;
  onDragStart: (id: string) => void; onDragEnd: () => void; onDrop: (s: string) => void; isOver: boolean;
}) {
  const s = STAGE_STYLE[stage] || STAGE_STYLE["Applied"];
  return (
    <div
      className="flex flex-col rounded-[16px] border min-w-[196px] w-[196px] flex-shrink-0 overflow-hidden transition-all duration-200"
      style={{ background: isOver ? s.bg : "#F9FAFB", borderColor: isOver ? s.border : "#E8E8EF" }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
      onDrop={() => onDrop(stage)}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E8E8EF" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
          <span className="text-[12px] font-semibold" style={{ color: s.text }}>{stage}</span>
        </div>
        <span className="text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#E8E8EF", color: "#6B7280" }}>{candidates.length}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto" style={{ minHeight: 80 }}>
        {candidates.map(c => (
          <KanbanCard key={c.id} candidate={c} onDragStart={() => onDragStart(c.id)} onDragEnd={onDragEnd} isDragging={draggingId === c.id} />
        ))}
        {isOver && draggingId && (
          <div className="rounded-xl border-2 border-dashed h-16 flex items-center justify-center" style={{ borderColor: s.border }}>
            <span className="text-[12px]" style={{ color: s.text }}>Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pipeline({ candidates }: Props) {
  const { changeStage } = useDashboard();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const byStage = KANBAN_STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter(c => c.stage === s);
    return acc;
  }, {} as Record<string, Candidate[]>);

  const handleDrop = (stage: string) => {
    const dragged = candidates.find(c => c.id === draggingId);
    if (dragged) void changeStage(dragged, stage as Candidate["stage"]);
    setDraggingId(null); setOverStage(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #E8E8EF", background: "#FFFFFF" }}>
        <h2 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Hiring Pipeline</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>Drag candidates between stages · {candidates.length} total</p>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-3 h-full" style={{ minWidth: "max-content" }}>
          {KANBAN_STAGES.map(stage => (
            <div
              key={stage}
              onDragEnter={() => setOverStage(stage)}
              onDragLeave={e => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOverStage(null); }}
            >
              <Column
                stage={stage}
                candidates={byStage[stage] || []}
                draggingId={draggingId}
                onDragStart={id => { setDraggingId(id); setOverStage(null); }}
                onDragEnd={() => { setDraggingId(null); setOverStage(null); }}
                onDrop={handleDrop}
                isOver={overStage === stage && draggingId !== null}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
