"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatAud } from "@/lib/utils";

export type StatsOrder = { createdAt: string; grossCents: number };

type Metric = "gross" | "orders";
type Week = { index: number; start: Date; gross: number; orders: number };

const PERTH_OFFSET_MS = 8 * 60 * 60 * 1000; // AWST, no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Shift to Perth wall-clock time, then read it back with UTC getters.
function perthDate(iso: string) {
  return new Date(new Date(iso).getTime() + PERTH_OFFSET_MS);
}

// Monday-start weeks inside a calendar year. Week 1 is the (possibly partial)
// week containing 1 Jan, so every order lands in exactly one bar for its year.
function yearWeeks(year: number) {
  const jan1 = Date.UTC(year, 0, 1);
  const lead = (new Date(jan1).getUTCDay() + 6) % 7; // Mon = 0
  const days = (Date.UTC(year + 1, 0, 1) - jan1) / DAY_MS;
  const count = Math.floor((days - 1 + lead) / 7) + 1;
  const weeks: Week[] = [];
  for (let i = 0; i < count; i++) {
    const startDay = Math.max(0, i * 7 - lead);
    weeks.push({ index: i, start: new Date(jan1 + startDay * DAY_MS), gross: 0, orders: 0 });
  }
  return { weeks, lead, jan1 };
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag * 4 >= v) ?? 10;
  return step * mag * 4;
}

function compactAud(cents: number) {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(d >= 10000 ? 0 : 1)}k`;
  return `$${Math.round(d)}`;
}

function weekLabel(w: Week) {
  return `Week of ${w.start.getUTCDate()} ${MONTHS[w.start.getUTCMonth()]}`;
}

export default function StatsChart({ orders }: { orders: StatsOrder[] }) {
  const nowYear = perthDate(new Date().toISOString()).getUTCFullYear();
  const years = useMemo(() => {
    const set = new Set(orders.map((o) => perthDate(o.createdAt).getUTCFullYear()));
    set.add(nowYear);
    return [...set].sort((a, b) => b - a);
  }, [orders, nowYear]);

  const [year, setYear] = useState(nowYear);
  const [metric, setMetric] = useState<Metric>("gross");
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const weeks = useMemo(() => {
    const { weeks, lead, jan1 } = yearWeeks(year);
    for (const o of orders) {
      const d = perthDate(o.createdAt);
      if (d.getUTCFullYear() !== year) continue;
      const day = Math.floor((Date.UTC(year, d.getUTCMonth(), d.getUTCDate()) - jan1) / DAY_MS);
      const w = weeks[Math.floor((day + lead) / 7)];
      w.gross += o.grossCents;
      w.orders += 1;
    }
    return weeks;
  }, [orders, year]);

  const totals = useMemo(() => {
    const gross = weeks.reduce((s, w) => s + w.gross, 0);
    const count = weeks.reduce((s, w) => s + w.orders, 0);
    const best = weeks.reduce<Week | null>((b, w) => (w.gross > (b?.gross ?? 0) ? w : b), null);
    return { gross, count, avg: count ? Math.round(gross / count) : 0, best };
  }, [weeks]);

  // Chart geometry follows the container width so labels stay legible on phones.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 280;
  const pad = { top: 16, right: 8, bottom: 28, left: metric === "gross" ? 48 : 32 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const value = (w: Week) => (metric === "gross" ? w.gross : w.orders);
  const max = niceMax(Math.max(...weeks.map(value)));
  const slot = plotW / weeks.length;
  const gap = slot > 6 ? 2 : 1;
  const barW = Math.max(1, slot - gap);
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const fmtTick = (v: number) => (metric === "gross" ? compactAud(v) : String(Math.round(v * 10) / 10));

  // One month label at the first week that starts in each month.
  const monthTicks = weeks.filter((w, i) => i === 0 || w.start.getUTCMonth() !== weeks[i - 1].start.getUTCMonth());
  const skipMonths = width < 520 ? 2 : 1;

  const hovered = hover != null ? weeks[hover] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      {/* Filters — one row above the chart */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div className="stats-toggle" role="group" aria-label="Metric">
          {(["gross", "orders"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              className={metric === m ? "is-active" : ""}
              onClick={() => setMetric(m)}
            >
              {m === "gross" ? "Gross income" : "Orders"}
            </button>
          ))}
        </div>
        <select
          className="stats-select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Year"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Headline numbers */}
      <div className="stats-tiles">
        {[
          { label: "Gross income", sub: "excl. shipping", value: formatAud(totals.gross) },
          { label: "Paid orders", sub: String(year), value: String(totals.count) },
          { label: "Avg order", sub: "excl. shipping", value: formatAud(totals.avg) },
          {
            label: "Best week",
            sub: totals.best ? weekLabel(totals.best).replace("Week of ", "") : "—",
            value: totals.best ? formatAud(totals.best.gross) : "—",
          },
        ].map((t) => (
          <div key={t.label} className="card stats-tile">
            <p className="stats-tile-label">{t.label}</p>
            <p className="stats-tile-value">{t.value}</p>
            <p className="stats-tile-sub">{t.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: "18px 18px 12px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, gap: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 650 }}>
            {metric === "gross" ? "Gross income per week" : "Paid orders per week"}
            <span style={{ color: "var(--muted)", fontWeight: 400 }}> · {year}</span>
          </p>
          {metric === "gross" && (
            <p className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Excl. shipping
            </p>
          )}
        </div>

        <div ref={wrapRef} style={{ position: "relative" }} onMouseLeave={() => setHover(null)}>
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${metric === "gross" ? "Gross income" : "Paid orders"} per week in ${year}`}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Recessive grid + y labels */}
            {ticks.map((t) => {
              const y = pad.top + plotH - (t / max) * plotH;
              return (
                <g key={t}>
                  <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
                  <text x={pad.left - 8} y={y} dy="0.32em" textAnchor="end" fontSize={10} fill="var(--muted)" className="font-mono">
                    {fmtTick(t)}
                  </text>
                </g>
              );
            })}

            {/* Bars — rounded top, square at the baseline */}
            {weeks.map((w, i) => {
              const v = value(w);
              if (v <= 0) return null;
              const h = Math.max(2, (v / max) * plotH);
              const x = pad.left + i * slot + gap / 2;
              const y = pad.top + plotH - h;
              const r = Math.min(4, barW / 2, h);
              return (
                <path
                  key={i}
                  d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`}
                  fill={hover == null || hover === i ? "var(--orange)" : "color-mix(in srgb, var(--orange) 45%, transparent)"}
                  style={{ transition: "fill 0.12s" }}
                />
              );
            })}

            {/* Baseline */}
            <line x1={pad.left} x2={width - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} stroke="var(--border-hi)" strokeWidth={1} />

            {/* Month labels */}
            {monthTicks.filter((_, i) => i % skipMonths === 0).map((w) => (
              <text
                key={w.index}
                x={pad.left + w.index * slot + slot / 2}
                y={height - 8}
                textAnchor="start"
                fontSize={10}
                fill="var(--muted)"
                className="font-mono"
              >
                {MONTHS[w.start.getUTCMonth()]}
              </text>
            ))}

            {/* Hit targets — full column height, bigger than the bar */}
            {weeks.map((w, i) => (
              <rect
                key={i}
                x={pad.left + i * slot}
                y={pad.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onClick={() => setHover(i)}
              />
            ))}
          </svg>

          {hovered && (
            <div
              className="stats-tooltip"
              style={{
                left: Math.min(Math.max(pad.left + hovered.index * slot + slot / 2, 80), width - 80),
                top: pad.top,
              }}
            >
              <p className="stats-tooltip-title">{weekLabel(hovered)}</p>
              <p><span>Gross</span><strong>{formatAud(hovered.gross)}</strong></p>
              <p><span>Orders</span><strong>{hovered.orders}</strong></p>
            </div>
          )}
        </div>

        <button type="button" className="stats-table-toggle" onClick={() => setShowTable((s) => !s)}>
          {showTable ? "Hide table" : "Show as table"}
        </button>

        {showTable && (
          <table className="stats-table">
            <thead>
              <tr><th>Week</th><th>Orders</th><th>Gross (excl. shipping)</th></tr>
            </thead>
            <tbody>
              {weeks.filter((w) => w.orders > 0).map((w) => (
                <tr key={w.index}>
                  <td>{weekLabel(w).replace("Week of ", "")}</td>
                  <td>{w.orders}</td>
                  <td>{formatAud(w.gross)}</td>
                </tr>
              ))}
              {totals.count === 0 && (
                <tr><td colSpan={3} style={{ color: "var(--muted)" }}>No paid orders in {year}.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
