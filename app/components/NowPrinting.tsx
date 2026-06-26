"use client";

import { useEffect, useState, type ReactNode } from "react";

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

// A simple line/silhouette for each preset so the card shows a shadow that
// loosely matches the item being printed instead of a generic cube. Each entry
// is the inner SVG content; the wrapper sets fill/stroke (see <Silhouette>).
// viewBox is 0 0 120 120, ~centred. Items inherit fill/stroke from the <svg>;
// shapes that should read as outlines set fill="none" + their own strokeWidth.
const SILHOUETTES: Record<string, ReactNode> = {
  "Articulated Dragon": (
    <>
      <path d="M20 92 C24 78 34 74 44 76 C40 64 48 54 60 56 C56 48 62 40 72 42 C70 34 80 30 86 38 C92 32 102 38 98 48 C106 50 106 62 96 64 C92 76 78 80 70 74 C72 84 64 92 54 88 C46 96 30 98 20 92 Z" />
      <path d="M80 40 L106 16 L92 46 Z" />
    </>
  ),
  "Phone Stand": (
    <>
      <rect x="46" y="20" width="38" height="60" rx="5" transform="rotate(12 65 50)" />
      <rect x="36" y="74" width="8" height="20" />
      <path d="M26 96 L60 96 L50 78 L40 80 Z" />
    </>
  ),
  "Cable Management Clips": (
    <>
      <path d="M82 40 A30 30 0 1 0 82 80" fill="none" strokeWidth={12} />
      <path d="M50 48 A20 20 0 1 0 50 72" fill="none" strokeWidth={10} />
    </>
  ),
  "Headphone Hook": (
    <>
      <path d="M28 66 A32 32 0 0 1 92 66" fill="none" strokeWidth={8} />
      <rect x="22" y="62" width="16" height="28" rx="6" />
      <rect x="82" y="62" width="16" height="28" rx="6" />
    </>
  ),
  "Hex Planter": (
    <>
      <path d="M44 50 L60 40 L76 50 L76 74 L60 84 L44 74 Z" />
      <path d="M60 42 C54 28 44 26 42 32 C48 38 56 42 60 42 Z" />
      <path d="M60 42 C66 26 78 26 80 32 C72 40 64 42 60 42 Z" />
    </>
  ),
  "Enclosure Bracket": (
    <>
      <path d="M34 28 L52 28 L52 70 L90 70 L90 88 L34 88 Z" />
      <circle cx="43" cy="79" r="4" fill="none" />
      <circle cx="81" cy="79" r="4" fill="none" />
    </>
  ),
  "Keyboard Case": (
    <>
      <rect x="20" y="44" width="80" height="40" rx="6" />
      <g fill="none" strokeWidth={2}>
        <rect x="27" y="50" width="9" height="9" rx="2" />
        <rect x="40" y="50" width="9" height="9" rx="2" />
        <rect x="53" y="50" width="9" height="9" rx="2" />
        <rect x="66" y="50" width="9" height="9" rx="2" />
        <rect x="79" y="50" width="9" height="9" rx="2" />
        <rect x="27" y="63" width="9" height="9" rx="2" />
        <rect x="40" y="63" width="35" height="9" rx="2" />
        <rect x="79" y="63" width="9" height="9" rx="2" />
      </g>
    </>
  ),
  "Miniature Knight": (
    <path d="M44 92 L84 92 L84 84 C86 70 82 58 72 50 C76 44 76 38 72 34 L66 40 C60 34 52 32 46 36 C42 30 40 28 36 26 C38 36 36 40 32 44 C40 46 40 52 38 56 L48 58 C44 66 40 76 44 84 Z" />
  ),
  "Camera Mount Plate": (
    <>
      <rect x="26" y="46" width="68" height="40" rx="5" />
      <rect x="44" y="38" width="22" height="10" rx="3" />
      <circle cx="60" cy="66" r="13" fill="none" strokeWidth={4} />
    </>
  ),
  "Wall Vase": (
    <path d="M44 32 L76 32 L72 50 C86 60 86 86 60 90 C34 86 34 60 48 50 Z" />
  ),
  "GoPro Tripod Adapter": (
    <>
      <rect x="50" y="26" width="20" height="10" rx="2" />
      <g fill="none" strokeWidth={6}>
        <path d="M60 36 L60 90" />
        <path d="M60 54 L34 90" />
        <path d="M60 54 L86 90" />
      </g>
    </>
  ),
  "Raspberry Pi Case": (
    <>
      <rect x="26" y="44" width="68" height="40" rx="4" />
      <g>
        <rect x="92" y="50" width="9" height="9" />
        <rect x="92" y="63" width="9" height="9" />
        <rect x="40" y="84" width="14" height="6" />
        <rect x="66" y="84" width="14" height="6" />
      </g>
      <g fill="none" strokeWidth={2}>
        <circle cx="33" cy="51" r="3" />
        <circle cx="87" cy="77" r="3" />
      </g>
    </>
  ),
  "Cosplay Pauldron": (
    <>
      <path d="M30 50 C40 38 80 38 90 50 L86 60 C78 52 42 52 34 60 Z" />
      <path d="M28 64 C40 54 80 54 92 64 L88 76 C78 68 42 68 32 76 Z" />
      <path d="M30 80 C42 72 78 72 90 80 L84 92 L36 92 Z" />
    </>
  ),
  "Drawer Organiser": (
    <>
      <rect x="24" y="42" width="72" height="46" rx="4" />
      <g fill="none" strokeWidth={2.5}>
        <path d="M48 42 L48 88" />
        <path d="M72 42 L72 88" />
        <path d="M24 65 L96 65" />
      </g>
    </>
  ),
  "Filament Spool Holder": (
    <>
      <circle cx="60" cy="60" r="32" fill="none" strokeWidth={8} />
      <circle cx="60" cy="60" r="10" />
    </>
  ),
  "Articulated Octopus": (
    <>
      <path d="M38 58 C38 36 82 36 82 58 L82 66 C82 72 38 72 38 66 Z" />
      <g fill="none" strokeWidth={5}>
        <path d="M44 66 C38 80 48 84 38 92" />
        <path d="M52 68 C50 82 58 86 50 94" />
        <path d="M60 68 L60 94" />
        <path d="M68 68 C70 82 62 86 70 94" />
        <path d="M76 66 C82 80 72 84 82 92" />
      </g>
    </>
  ),
  "Tabletop Terrain Ruins": (
    <>
      <path d="M30 88 L30 44 L42 40 L42 88 Z" />
      <path d="M78 88 L78 52 L90 56 L90 88 Z" />
      <path d="M30 44 L62 40 L62 50 L42 52 Z" />
      <path d="M62 40 L62 52 L72 50 L72 44 Z" />
    </>
  ),
  "Pen Holder": (
    <>
      <path d="M40 56 L80 56 L76 92 L44 92 Z" />
      <rect x="48" y="28" width="6" height="30" rx="2" transform="rotate(-10 51 43)" />
      <rect x="62" y="26" width="6" height="32" rx="2" transform="rotate(8 65 42)" />
      <rect x="70" y="32" width="6" height="26" rx="2" transform="rotate(18 73 45)" />
    </>
  ),
  "Bike Light Bracket": (
    <>
      <rect x="32" y="46" width="44" height="30" rx="7" />
      <circle cx="76" cy="61" r="10" />
      <path d="M46 76 C42 90 78 90 74 76" fill="none" strokeWidth={6} />
    </>
  ),
  "Desk Nameplate": (
    <>
      <path d="M26 82 L94 82 L86 58 L34 58 Z" />
      <rect x="44" y="64" width="32" height="4" rx="1" />
      <rect x="48" y="72" width="24" height="3" rx="1" />
    </>
  ),
};

// Fallback if a preset has no bespoke silhouette: a generic printed object.
const FALLBACK_SILHOUETTE: ReactNode = (
  <path d="M60 26 L92 44 L92 80 L60 98 L28 80 L28 44 Z" />
);

function Silhouette({ model }: { model: string }) {
  return (
    <svg
      className="print-silhouette-svg"
      viewBox="0 0 120 120"
      width={132}
      height={132}
      fill="rgba(249,115,22,0.14)"
      stroke="var(--orange)"
      strokeWidth={2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {SILHOUETTES[model] ?? FALLBACK_SILHOUETTE}
    </svg>
  );
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

      {/* Floating silhouette of the item currently printing */}
      <div className="print-shadow-stage">
        <div className="print-shadow-float" key={preset.model}>
          <Silhouette model={preset.model} />
        </div>
        <div className="print-shadow-ground" />
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
