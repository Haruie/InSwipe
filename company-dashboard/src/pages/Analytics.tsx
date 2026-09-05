import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDashboard } from "../data/store";

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border px-3 py-2 text-[12px]" style={{ background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 4px 12px rgba(15,17,23,0.08)", color: "#0F1117" }}>
      <div className="mb-0.5" style={{ color: "#9CA3AF" }}>{label}</div>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color || "#4F46E5" }}>{p.value}{p.name === "apply" ? "%" : ""}</div>)}
    </div>
  );
};

export default function Analytics() {
  const { analytics } = useDashboard();

  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  if (!ready) return <div className="p-8 grid grid-cols-2 gap-5">{[1,2,3,4].map(i => <div key={i} className="rounded-[20px] h-64 shimmer-bg" />)}</div>;

  const cardStyle = { background: "#FFFFFF", borderColor: "#E8E8EF", boxShadow: "0 1px 3px rgba(15,17,23,0.06)" };

  return (
    <div className="p-8 max-w-[1100px] mx-auto space-y-6">
      {/* AI Insights */}
      <div>
        <h2 className="text-[14px] font-semibold mb-3" style={{ color: "#0F1117" }}>AI Insights</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            "Your Frontend Eng role has an 11.3% apply rate — 2.4× above InSwipe's average for engineering roles.",
            "TypeScript is your highest-demanded skill but only 68% of applicants have it. Consider adding 'willing to learn' to the wording.",
            "Time-to-selection is trending 31% faster this cycle. AI pre-ranking is reducing review time significantly.",
          ].map((text, i) => (
            <div key={i} className="rounded-xl p-4 anim-fade-up" style={{ background: "#EEF0FF", border: "1px solid #E8E8EF", animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <p className="text-[12px] leading-relaxed" style={{ color: "#374151" }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Impressions */}
        <div className="rounded-[20px] border p-6 anim-fade-up" style={{ ...cardStyle, animationDelay: "0.12s" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Impressions</h3>
              <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>Students who viewed your listings</p>
            </div>
            <div className="text-[22px] font-bold" style={{ color: "#0F1117" }}>3,167</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={analytics.impressions} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="impG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F0F0F5" />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} fill="url(#impG)" dot={false} activeDot={{ r: 4, fill: "#4F46E5", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Apply Rate */}
        <div className="rounded-[20px] border p-6 anim-fade-up" style={{ ...cardStyle, animationDelay: "0.18s" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Apply Rate</h3>
              <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>Students who applied after viewing</p>
            </div>
            <div className="text-[22px] font-bold" style={{ color: "#16A34A" }}>11.3%</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={analytics.applyRate} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="applyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F0F0F5" />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="value" name="apply" stroke="#16A34A" strokeWidth={2} fill="url(#applyG)" dot={false} activeDot={{ r: 4, fill: "#16A34A", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Avg fit score */}
        <div className="rounded-[20px] border p-6 anim-fade-up" style={{ ...cardStyle, animationDelay: "0.22s" }}>
          <div className="mb-5">
            <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Avg Applicant Fit Score</h3>
            <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>By active role</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={analytics.avgFitScore} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={32}>
              <CartesianGrid vertical={false} stroke="#F0F0F5" />
              <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {analytics.avgFitScore.map((_, i) => <Cell key={i} fill={["#4F46E5","#16A34A","#EA580C"][i]} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill demand */}
        <div className="rounded-[20px] border p-6 anim-fade-up" style={{ ...cardStyle, animationDelay: "0.26s" }}>
          <div className="mb-5">
            <h3 className="text-[14px] font-semibold" style={{ color: "#0F1117" }}>Skill Supply vs. Demand</h3>
            <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>% of applicants with each required skill</p>
          </div>
          <div className="space-y-3">
            {analytics.skillDemand.map((item, i) => {
              const color = item.demand >= 80 ? "#16A34A" : item.demand >= 65 ? "#4F46E5" : "#EA580C";
              return (
                <div key={item.skill} className="flex items-center gap-3">
                  <div className="text-[12px] w-20 text-right flex-shrink-0" style={{ color: "#6B7280" }}>{item.skill}</div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F0F0F5" }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${item.demand}%`, background: color, transitionDelay: `${i * 0.06}s` }} />
                  </div>
                  <div className="text-[12px] w-8 text-right font-medium" style={{ color }}>{item.demand}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time to selection */}
      <div className="rounded-[20px] border p-6 anim-fade-up" style={{ ...cardStyle, animationDelay: "0.3s" }}>
        <h3 className="text-[14px] font-semibold mb-5" style={{ color: "#0F1117" }}>Time to Selection</h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Days to first review", value: "1.2", unit: "days", sub: "Industry avg: 4.1 days", good: true },
            { label: "Days to selection",    value: "5.8", unit: "days", sub: "Industry avg: 12.3 days", good: true },
            { label: "Avg reviews per hire", value: "3.4", unit: "reviews", sub: "Before selecting", good: false },
            { label: "Response rate",        value: "94",  unit: "%",    sub: "Candidates responded", good: true },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[28px] font-bold mb-1" style={{ color: s.good ? "#16A34A" : "#4F46E5" }}>
                {s.value}<span className="text-[13px] ml-0.5" style={{ fontWeight: 500 }}>{s.unit}</span>
              </div>
              <div className="text-[13px] font-medium mb-1" style={{ color: "#0F1117" }}>{s.label}</div>
              <div className="text-[12px]" style={{ color: "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
