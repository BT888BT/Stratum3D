"use client";

import { useEffect, useState } from "react";

export type NowPrintingData = {
  /** 1-based index of the printer this job is on. */
  printerIndex: number;
  /** Total number of printers in the shop. */
  printerCount: number;
  fileName: string;
  material: string;
  colour: string;
  layerHeight: string;
  infillPercent: number | null;
  estPrice: string | null;
  /** Epoch ms when the job entered "printing". null → progress is indeterminate. */
  startedAtMs: number | null;
  /** Estimated total print minutes. null → progress is indeterminate. */
  totalMinutes: number | null;
  /** True when there is no live job and we're showing placeholder specs. */
  isPlaceholder: boolean;
};

// Live progress, capped just under 100% — the job stays "printing" in the DB
// until an operator advances it, so we never claim it's finished on our own.
const MAX_PCT = 99;

function computePct(startedAtMs: number | null, totalMinutes: number | null): number | null {
  if (startedAtMs == null || !totalMinutes || totalMinutes <= 0) return null;
  const elapsedMin = (Date.now() - startedAtMs) / 60000;
  const pct = (elapsedMin / totalMinutes) * 100;
  return Math.max(0, Math.min(MAX_PCT, pct));
}

function remainingLabel(startedAtMs: number | null, totalMinutes: number | null): string {
  if (startedAtMs == null || !totalMinutes || totalMinutes <= 0) return "Live";
  const elapsedMin = (Date.now() - startedAtMs) / 60000;
  const remaining = Math.max(0, totalMinutes - elapsedMin);
  if (remaining < 1) return "Finishing up";
  if (remaining < 60) return `~${Math.round(remaining)} min left`;
  const h = Math.floor(remaining / 60);
  const m = Math.round(remaining % 60);
  return m ? `~${h}h ${m}m left` : `~${h}h left`;
}

export default function NowPrinting(data: NowPrintingData) {
  const determinate = data.startedAtMs != null && !!data.totalMinutes;

  const [pct, setPct] = useState<number | null>(() =>
    computePct(data.startedAtMs, data.totalMinutes)
  );
  const [eta, setEta] = useState<string>(() =>
    remainingLabel(data.startedAtMs, data.totalMinutes)
  );

  // Tick the progress forward in real time so the bar visibly creeps along
  // between page loads, making it feel live.
  useEffect(() => {
    if (!determinate) return;
    const update = () => {
      setPct(computePct(data.startedAtMs, data.totalMinutes));
      setEta(remainingLabel(data.startedAtMs, data.totalMinutes));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [determinate, data.startedAtMs, data.totalMinutes]);

  const specs: [string, string][] = [
    ["Material", data.material],
    ["Colour", data.colour],
    ["Layer", data.layerHeight],
    ["Infill", data.infillPercent != null ? `${data.infillPercent}%` : "—"],
  ];
  if (data.estPrice) specs.push(["Value", data.estPrice]);

  return (
    <div
      className="card-orange"
      style={{
        width: "100%",
        maxWidth: 340,
        padding: 28,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span className="font-mono now-printing-dot" style={{ fontSize: 10, color: "var(--orange)", letterSpacing: "0.2em" }}>
          ● NOW PRINTING
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "var(--text-dim)",
            border: "1px solid var(--border-hi)",
            borderRadius: 999,
            padding: "3px 9px",
            whiteSpace: "nowrap",
          }}
        >
          PRINTER {data.printerIndex} / {data.printerCount}
        </span>
      </div>

      {/* Spinning cube visual */}
      <div style={{ perspective: 600, display: "flex", justifyContent: "center", padding: "6px 0 20px" }}>
        <div className="cube-3d" style={{ width: 96, height: 96 }}>
          <div className="cube-face front" style={cubeFace} />
          <div className="cube-face back" style={cubeFace} />
          <div className="cube-face left" style={cubeFace} />
          <div className="cube-face right" style={cubeFace} />
          <div className="cube-face top" style={cubeFace} />
          <div className="cube-face bottom" style={cubeFace} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>
            {determinate ? "PROGRESS" : "STATUS"}
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--orange)" }}>
            {pct != null ? `${Math.round(pct)}%` : "—"} · {eta}
          </span>
        </div>
        <div className={`print-progress${determinate ? "" : " print-progress--indeterminate"}`}>
          <div
            className="print-progress-fill"
            style={determinate ? { width: `${pct ?? 0}%` } : undefined}
          />
        </div>
      </div>

      {/* Spec list */}
      <div style={{ display: "grid", gap: 9 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>Model</span>
          <span
            style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}
            title={data.fileName}
          >
            {data.fileName}
          </span>
        </div>
        {specs.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>{k}</span>
            <span style={{ fontSize: 13, color: "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const cubeFace: React.CSSProperties = {
  width: 96,
  height: 96,
};
