// ──────────────────────────────────────────────────────────────────────────
// Stratum3D — product catalog + instant pricing
// Self-contained. No database. Everything the quote tool needs lives here.
// ──────────────────────────────────────────────────────────────────────────

export type MaterialKey = "PLA" | "PETG" | "ABS";

export type Material = {
  key: MaterialKey;
  name: string;
  tagline: string;
  desc: string;
  use: string;
  temp: string;
  strength: "Good" | "Very Good" | "Excellent";
  accent: string;          // brand swatch colour — derived from the theme accent
                           // (var(--orange)) so seasonal campaigns recolour it.
};

export const MATERIALS: Material[] = [
  {
    key: "PLA",
    name: "PLA",
    tagline: "The all-rounder",
    desc: "The go-to for display models, props, figures and hobby builds. Affordable, the widest colour range, and the most forgiving material to print.",
    use: "Hobby / Display",
    temp: "190–220°C",
    strength: "Good",
    accent: "var(--orange-hi)",
  },
  {
    key: "PETG",
    name: "PETG",
    tagline: "Tough & weatherproof",
    desc: "Tougher, moisture-resistant and slightly flexible. Best for outdoor parts, functional enclosures, or anything that needs to outlast PLA.",
    use: "Functional / Outdoor",
    temp: "230–250°C",
    strength: "Very Good",
    accent: "var(--orange)",
  },
  {
    key: "ABS",
    name: "ABS",
    tagline: "Engineering-grade",
    desc: "Heat-resistant and impact-tough. Built for mechanical parts, enclosures, and components that need to handle real-world stress.",
    use: "Engineering / Mechanical",
    temp: "230–260°C",
    strength: "Excellent",
    accent: "color-mix(in srgb, var(--orange) 78%, #000)",
  },
];

export function getMaterial(key: MaterialKey): Material {
  return MATERIALS.find((m) => m.key === key) ?? MATERIALS[0];
}

// ── Colours (shared palette; every material stocks these) ──────────────────
export type Colour = { name: string; hex: string };

export const COLOURS: Colour[] = [
  { name: "Lava Orange", hex: "#f97316" },
  { name: "Carbon Black", hex: "#1c1917" },
  { name: "Arctic White", hex: "#f5f5f4" },
  { name: "Graphite Grey", hex: "#57534e" },
  { name: "Signal Red", hex: "#dc2626" },
  { name: "Deep Blue", hex: "#1d4ed8" },
  { name: "Forest Green", hex: "#15803d" },
  { name: "Sun Yellow", hex: "#facc15" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Natural / Clear", hex: "#d6d3d1" },
];

// ── Quality / layer height ─────────────────────────────────────────────────
export type Quality = {
  key: "draft" | "standard" | "fine";
  name: string;
  layer: string;
  desc: string;
  timeFactor: number;   // relative print time
};

export const QUALITIES: Quality[] = [
  { key: "draft", name: "Draft", layer: "0.28 mm", desc: "Fastest & cheapest. Visible layers — great for test fits and rough prototypes.", timeFactor: 0.72 },
  { key: "standard", name: "Standard", layer: "0.20 mm", desc: "The sweet spot. Clean finish for almost everything. Recommended.", timeFactor: 1 },
  { key: "fine", name: "Fine", layer: "0.12 mm", desc: "Smoothest surface for figures & detailed models. Slower to print.", timeFactor: 1.55 },
];

// ── Infill ─────────────────────────────────────────────────────────────────
export const INFILLS = [
  { value: 15, label: "15% — Light (display)" },
  { value: 25, label: "25% — Standard (recommended)" },
  { value: 50, label: "50% — Strong (functional)" },
  { value: 100, label: "100% — Solid (maximum strength)" },
];

// ── Size presets (approx bounding box) ─────────────────────────────────────
export type SizePreset = { key: string; name: string; desc: string; dims: [number, number, number] };

export const SIZE_PRESETS: SizePreset[] = [
  { key: "keyring", name: "Keyring / Token", desc: "Up to ~5 cm", dims: [45, 45, 8] },
  { key: "small", name: "Small Part", desc: "Fits in your palm", dims: [70, 70, 50] },
  { key: "medium", name: "Medium Model", desc: "Mug-sized", dims: [110, 110, 110] },
  { key: "large", name: "Large Print", desc: "Helmet / big prop", dims: [200, 200, 180] },
];

// ── Pricing ────────────────────────────────────────────────────────────────
// The live quote engine lives in lib/quote.ts (calculateItemQuote / sumQuote),
// which is the single source of truth for filament costs, machine rate, GST and
// shipping. This catalog module only supplies display metadata (materials,
// colours, qualities, size presets) for the storefront.
