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

// 40 preset jobs. The card cycles through these on a shared wall-clock so every
// visitor sees the same job at the same moment. When a print "finishes" the
// card sits idle ("setting up for next print") for a fixed wait, then rolls to
// the next job. Purely visual — no files or orders are read.
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
  { model: "Desk Cable Tray",         material: "PETG", colour: "Slate Grey",    infillPercent: 30, printMinutes: 65 },
  { model: "Plant Pot Saucer",        material: "PLA",  colour: "Terracotta",    infillPercent: 15, printMinutes: 50 },
  { model: "Switch Game Holder",      material: "PETG", colour: "Carbon Black",  infillPercent: 35, printMinutes: 120 },
  { model: "Articulated Slug",        material: "PLA",  colour: "Lime Green",    infillPercent: 15, printMinutes: 70 },
  { model: "Wall Hook Set",           material: "PETG", colour: "Matte Black",   infillPercent: 40, printMinutes: 55 },
  { model: "Laptop Riser",            material: "ABS",  colour: "Charcoal",      infillPercent: 45, printMinutes: 260 },
  { model: "Dice Tower",              material: "PLA",  colour: "Deep Purple",   infillPercent: 18, printMinutes: 190 },
  { model: "Coaster Set",             material: "PLA",  colour: "Sky Blue",      infillPercent: 20, printMinutes: 80 },
  { model: "SD Card Box",             material: "PETG", colour: "Graphite",      infillPercent: 35, printMinutes: 60 },
  { model: "Vacuum Hose Adapter",     material: "PETG", colour: "Safety Orange", infillPercent: 40, printMinutes: 45 },
  { model: "Bust of Athena",          material: "PLA",  colour: "Marble White",  infillPercent: 12, printMinutes: 230 },
  { model: "Toothbrush Holder",       material: "PETG", colour: "Off White",     infillPercent: 30, printMinutes: 75 },
  { model: "Controller Stand",        material: "PLA",  colour: "Gunmetal",      infillPercent: 20, printMinutes: 90 },
  { model: "Spice Jar Labels",        material: "PLA",  colour: "Warm White",    infillPercent: 25, printMinutes: 40 },
  { model: "Drone Propeller Guards",  material: "PETG", colour: "Neon Yellow",   infillPercent: 45, printMinutes: 110 },
  { model: "Articulated Shark",       material: "PLA",  colour: "Steel Blue",    infillPercent: 15, printMinutes: 100 },
  { model: "Monitor Light Bar Mount", material: "ABS",  colour: "Matte Black",   infillPercent: 40, printMinutes: 130 },
  { model: "Earbud Case",             material: "PETG", colour: "Carbon Black",  infillPercent: 35, printMinutes: 50 },
  { model: "Wall Clock Face",         material: "PLA",  colour: "Walnut Brown",  infillPercent: 18, printMinutes: 150 },
  { model: "Keyboard Wrist Rest",     material: "PETG", colour: "Slate Grey",    infillPercent: 35, printMinutes: 140 },
];

const PRINTER_COUNT = 2;

// Idle "setting up" wait after each finished print: 1, 2 or 3 hours. Fixed per
// index (not random) so the server render and every visitor stay in sync. The
// pattern is scrambled so the wait isn't a predictable 1→2→3 each time.
const GAP_MIN_BY_SLOT = [120, 60, 180]; // 2h, 1h, 3h
function gapMinutes(index: number): number {
  return GAP_MIN_BY_SLOT[(index * 2 + 1) % GAP_MIN_BY_SLOT.length];
}

// Full loop = every print plus its trailing idle gap.
const CYCLE_MINUTES = PRESETS.reduce((s, p, i) => s + p.printMinutes + gapMinutes(i), 0);

type Phase = "printing" | "idle";

type LiveState = {
  index: number;
  phase: Phase;
  pct: number;
  /** Minutes left in the current phase (print remaining, or wait remaining). */
  remainingMin: number;
  /** Job that starts once the idle wait ends. */
  nextIndex: number;
};

// Deterministic from the clock so server + client agree and all visitors sync.
function getState(nowMs: number): LiveState {
  const elapsed = (nowMs / 60000) % CYCLE_MINUTES;
  let acc = 0;
  for (let i = 0; i < PRESETS.length; i++) {
    const printDur = PRESETS[i].printMinutes;
    const gapDur = gapMinutes(i);
    const nextIndex = (i + 1) % PRESETS.length;
    // Printing phase
    if (elapsed < acc + printDur) {
      const within = elapsed - acc;
      return { index: i, phase: "printing", pct: (within / printDur) * 100, remainingMin: printDur - within, nextIndex };
    }
    acc += printDur;
    // Idle / setting-up phase
    if (elapsed < acc + gapDur) {
      const within = elapsed - acc;
      return { index: i, phase: "idle", pct: 100, remainingMin: gapDur - within, nextIndex };
    }
    acc += gapDur;
  }
  return { index: 0, phase: "printing", pct: 0, remainingMin: PRESETS[0].printMinutes, nextIndex: 1 };
}

function remainingLabel(min: number): string {
  if (min < 1) return "Finishing up";
  if (min < 60) return `~${Math.round(min)} min left`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `~${h}h ${m}m left` : `~${h}h left`;
}

// Shown for any print that doesn't have an image yet: a simple 3D line cube
// (isometric), faces lightly shaded so it reads as a 3D object.
function CubeSilhouette() {
  return (
    <svg
      className="print-silhouette-svg"
      viewBox="0 0 120 120"
      width={132}
      height={132}
      stroke="var(--orange)"
      strokeWidth={2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* True isometric cube on a regular hexagon: all three vertical edges
          (27,41->27,79 · 60,60->60,98 · 93,41->93,79) are an equal 38px long. */}
      {/* top face */}
      <path d="M60 22 L93 41 L60 60 L27 41 Z" fill="rgba(249,115,22,0.22)" />
      {/* left face */}
      <path d="M27 41 L60 60 L60 98 L27 79 Z" fill="rgba(249,115,22,0.10)" />
      {/* right face */}
      <path d="M93 41 L60 60 L60 98 L93 79 Z" fill="rgba(249,115,22,0.15)" />
    </svg>
  );
}

// kebab-case slug used to find the PNG, e.g. "Articulated Dragon" -> "articulated-dragon".
function slugify(model: string): string {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Extensions tried, in order, for each print's image in public/now-printing/.
const IMAGE_EXTS = ["svg", "png", "webp", "jpg", "jpeg"] as const;

// Shows the customer's own image (public/now-printing/<slug>.<ext>). It tries
// each extension in turn; if none exist it quietly falls back to the 3D line
// cube so the card never shows a broken image.
function PrintVisual({ model }: { model: string }) {
  const [extIndex, setExtIndex] = useState(0);
  if (extIndex >= IMAGE_EXTS.length) return <CubeSilhouette />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/now-printing/${slugify(model)}.${IMAGE_EXTS[extIndex]}`}
      alt={model}
      width={148}
      height={148}
      onError={() => setExtIndex((i) => i + 1)}
      style={{ display: "block", width: 148, height: 148, objectFit: "contain" }}
    />
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

  const isIdle = state.phase === "idle";
  // While idle the card previews the job it's setting up for next.
  const displayIndex = isIdle ? state.nextIndex : state.index;
  const preset = PRESETS[displayIndex];
  const printerIndex = (displayIndex % PRINTER_COUNT) + 1;

  // While idle there's no active job, so the spec values are blanked to "-".
  const specs: [string, string][] = [
    ["Model", isIdle ? "-" : preset.model],
    ["Material", isIdle ? "-" : preset.material],
    ["Colour", isIdle ? "-" : preset.colour],
    ["Infill", isIdle ? "-" : `${preset.infillPercent}%`],
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
        <span
          className="font-mono now-printing-dot"
          style={{ fontSize: 10, color: isIdle ? "var(--text-dim)" : "var(--orange)", letterSpacing: "0.2em" }}
        >
          {isIdle ? "○ SETTING UP" : "● NOW PRINTING"}
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

      {/* Floating silhouette of the item currently printing. While idle there's
          no active job, so we show the slowly rotating 3D cube instead of any
          saved item image. */}
      <div className="print-shadow-stage">
        <div
          className={isIdle ? "print-shadow-float print-cube-spin" : "print-shadow-float"}
          key={isIdle ? "idle-cube" : preset.model}
        >
          {isIdle ? <CubeSilhouette /> : <PrintVisual model={preset.model} />}
        </div>
        <div className="print-shadow-ground" />
      </div>

      {/* Progress bar (printing) or idle / setting-up notice */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>
            {isIdle ? "IDLE" : "PROGRESS"}
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: isIdle ? "var(--text-dim)" : "var(--orange)" }}>
            {isIdle
              ? "Up next"
              : `${Math.round(state.pct)}% · ${remainingLabel(state.remainingMin)}`}
          </span>
        </div>
        {isIdle ? (
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em" }}>
            Setting up bed for next print…
          </span>
        ) : (
          <div className="print-progress">
            <div className="print-progress-fill" style={{ width: `${state.pct}%` }} />
          </div>
        )}
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
