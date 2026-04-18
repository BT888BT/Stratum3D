"use client";

import NumberTicker from "@/components/magicui/number-ticker";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

const stats: Stat[] = [
  { value: 0.2, suffix: "mm", label: "Min Layer", decimals: 1 },
  { value: 256, suffix: "mm³", label: "Build Volume Axis" },
  { value: 48, suffix: "h", label: "Avg Turnaround" },
  { value: 100, suffix: "%", label: "Local Perth Made" },
];

export default function StatsCounter() {
  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={s.label} className="stat-item">
          <div className="stat-value font-display">
            {s.prefix}
            <NumberTicker
              value={s.value}
              decimalPlaces={s.decimals ?? 0}
              delay={i * 0.12}
            />
            <span className="stat-suffix font-mono">{s.suffix}</span>
          </div>
          <div className="stat-label font-mono">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
