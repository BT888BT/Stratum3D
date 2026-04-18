"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
};

const stats: Stat[] = [
  { value: 0.2,  suffix: "mm",   label: "Min Layer",  decimals: 1 },
  { value: 256,  suffix: "mm³",  label: "Build Volume Axis" },
  { value: 48,   suffix: "h",    label: "Avg Turnaround" },
  { value: 100,  suffix: "%",    label: "Local Perth Made" },
];

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

function CounterItem({ stat, delay }: { stat: Stat; delay: number }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const start = performance.now() + delay;
    const duration = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = Math.max(0, t - start);
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(stat.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, stat.value, delay]);

  const display = n.toFixed(stat.decimals ?? 0);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-value font-display">
        {stat.prefix}
        {display}
        <span className="stat-suffix font-mono">{stat.suffix}</span>
      </div>
      <div className="stat-label font-mono">{stat.label}</div>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <CounterItem key={s.label} stat={s} delay={i * 120} />
      ))}
    </div>
  );
}
