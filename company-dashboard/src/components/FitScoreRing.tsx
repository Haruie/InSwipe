import { useEffect, useState } from "react";
import { fitBand } from "@inswipe/core";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export default function FitScoreRing({ score, size = 72, strokeWidth = 5, showLabel = true, animated = true }: Props) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const { color, label } = fitBand(score);

  useEffect(() => {
    if (!animated) { setDisplayed(score); return; }
    let start = 0;
    const duration = 1000;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(e * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 120);
    return () => clearTimeout(t);
  }, [score, animated]);

  const fontSize = size * 0.21;
  const labelSize = Math.max(12, size * 0.115);

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E8E8EF" strokeWidth={strokeWidth} />
          {/* Fill */}
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: animated ? "stroke-dashoffset 0.05s linear" : "none" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontFamily: "Inter", fontSize, fontWeight: 700, lineHeight: 1 }}>
            {displayed}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span style={{ color, fontFamily: "Inter", fontSize: labelSize, fontWeight: 500, lineHeight: 1 }}>
          {label}
        </span>
      )}
    </div>
  );
}
