"use client";

import { useEffect, useState } from "react";

type Preset = {
  model: string;
  material: string;
  colour: string;
  infillPercent: number;
  /** Simulated total print time for this job, in minutes. */
  printMinutes: number;
};

// 20 preset jobs. The card cycles through these on a shared wall-clock so every
// visitor sees the same job at the same moment, then it rolls to the next one
// when a print "finishes". Purely visual — no files or orders are read.
const PRESETS: Preset[] = [
  { model: "Articulated Dragon",      material: "PLA",  colour: "Forest Green",  infillPercent: 15, printMinutes: 220 },
  { model: "Phone Stand",             material: "PETG", colour: "Carbon Black",  infillPercent: 25, printMinutes: 75 },
  { model: "Cable Management Clips",  material: "PETG", colour: "Slate Grey",    infillPercent: 30, printMinutes: 40 },
  { model: "Headphone Hook",          material: "ABS",  colour: "Matte Black",   infillPercent: 35, printMinutes: 95 },
  { model: "Hex Planter",             material: "PLA",  colour: "Terracotta",    infillPercent: 20, printMinutes: 180 },
  { model: "Enclosure Bracket",       material: "PETG", colour: "Safety Orange", infillPercent: 40, printMinutes: 110 },
  { model: "Keyboard Case",           material: "ABS",  colour: "Charcoal",      infillPercent: 30, printMinutes: 240 },
  { model: "Miniature Knight",        material: "PLA",  colour: "Bone White",    infillPercent: 15, printMinutes: 55 },
  { model: "Camera Mount Plate",      material: "PETG", colour: "Carbon Black",  infillPercent: 50, printMinutes: 85 },
  { model: "Wall Vase",               material: "PLA",  colour: "Sky Blue",      infillPercent: 12, printMinutes: 160 },
  { model: "GoPro Tripod Adapter",    material: "PETG", colour: "Graphite",      infillPercent: 40, printMinutes: 50 },
  { model: "Raspberry Pi Case",       material: "PETG", colour: "Slate Grey",    infillPercent: 35, printMinutes: 70 },
  { model: "Cosplay Pauldron",        material: "PLA",  colour: "Gunmetal",      infillPercent: 18, printMinutes: 200 },
  { model: "Drawer Organiser",        material: "PLA",  colour: "Off White",     infillPercent: 20, printMinutes: 130 },
  { model: "Filament Spool Holder",   material: "PETG", colour: "Safety Orange", infillPercent: 35, printMinutes: 95 },
  { model: "Articulated Octopus",     material: "PLA",  colour: "Sunset Orange", infillPercent: 15, printMinutes: 90 },
  { model: "Tabletop Terrain Ruins",  material: "PLA",  colour: "Stone Grey",    infillPercent: 12, printMinutes: 175 },
  { model: "Pen Holder",              material: "PETG", colour: "Deep Red",      infillPercent: 25, printMinutes: 45 },
  { model: "Bike Light Bracket",      material: "ABS",  colour: "Matte Black",   infillPercent: 45, printMinutes: 60 },
  { model: "Desk Nameplate",          material: "PLA",  colour: "Warm White",    infillPercent: 20, printMinutes: 35 },
];

const PRINTER_COUNT = 2;
const TOTAL_MINUTES = PRESETS.reduce((s, p) => s + p.printMinutes, 0);

type LiveState = {
  index: number;
  pct: number;
  remainingMin: number;
};

// Deterministic from the clock so server + client agree and all visitors sync.
function getState(nowMs: number): LiveState {
  const elapsed = (nowMs / 60000) % TOTAL_MINUTES;
  let acc = 0;
  for (let i = 0; i < PRESETS.length; i++) {
    const d = PRESETS[i].printMinutes;
    if (elapsed < acc + d) {
      const within = elapsed - acc;
      return { index: i, pct: (within / d) * 100, remainingMin: d - within };
    }
    acc += d;
  }
  return { index: 0, pct: 0, remainingMin: PRESETS[0].printMinutes };
}

function remainingLabel(min: number): string {
  if (min < 1) return "Finishing up";
  if (min < 60) return `~${Math.round(min)} min left`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `~${h}h ${m}m left` : `~${h}h left`;
}

export default function NowPrinting() {
  // Seed with t=0 so the server render and the client's first render match,
  // then jump to real wall-clock time on mount and tick every second.
  const [state, setState] = useState<LiveState>(() => getState(0));

  useEffect(() => {
    const update = () => setState(getState(Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const preset = PRESETS[state.index];
  const printerIndex = (state.index % PRINTER_COUNT) + 1;

  const specs: [string, string][] = [
    ["Model", preset.model],
    ["Material", preset.material],
    ["Colour", preset.colour],
    ["Infill", `${preset.infillPercent}%`],
  ];

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
          PRINTER {printerIndex} / {PRINTER_COUNT}
        </span>
      </div>

      {/* Spinning cube visual */}
      <div
        style={{
          perspective: 520,
          perspectiveOrigin: "50% 45%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 160,
          padding: "4px 0 16px",
        }}
      >
        <div className="cube-3d">
          <div className="cube-face front" />
          <div className="cube-face back" />
          <div className="cube-face left" />
          <div className="cube-face right" />
          <div className="cube-face top" />
          <div className="cube-face bottom" />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>
            PROGRESS
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--orange)" }}>
            {Math.round(state.pct)}% · {remainingLabel(state.remainingMin)}
          </span>
        </div>
        <div className="print-progress">
          <div className="print-progress-fill" style={{ width: `${state.pct}%` }} />
        </div>
      </div>

      {/* Spec list */}
      <div style={{ display: "grid", gap: 9 }}>
        {specs.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>{k}</span>
            <span
              style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200, textAlign: "right" }}
              title={v}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
