// ──────────────────────────────────────────────────────────────────────────
// Stratum3D — in-code mock data (stands in for the database).
// Customer orders, gallery, testimonials, live-order feed and shop stats.
// Everything here is fictional but deploy-ready, so the site is fully
// testable on Vercel with zero backend.
// ──────────────────────────────────────────────────────────────────────────

import type { MaterialKey } from "./catalog";

// ── Order types ────────────────────────────────────────────────────────────
export type OrderStatusKey =
  | "received"
  | "printing"
  | "quality_check"
  | "shipped"
  | "delivered";

export const STATUS_FLOW: { key: OrderStatusKey; label: string }[] = [
  { key: "received", label: "Order received" },
  { key: "printing", label: "Printing" },
  { key: "quality_check", label: "Quality check" },
  { key: "shipped", label: "Shipped / ready" },
  { key: "delivered", label: "Delivered" },
];

export type OrderItem = {
  name: string;
  material: MaterialKey;
  colour: string;
  quality: string;
  infill: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  code: string;
  email: string;
  placedAt: string;          // ISO
  status: OrderStatusKey;
  shippingMethod: "shipping" | "pickup";
  eta: string;               // human friendly
  trackingNote?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

// ── Demo accounts (shown on the account login page) ────────────────────────
export const DEMO_LOGINS = [
  { email: "alex@example.com", code: "STR-7K2M9" },
  { email: "sam@example.com", code: "STR-4Q8X1" },
];

export const ORDERS: Order[] = [
  {
    code: "STR-7K2M9",
    email: "alex@example.com",
    placedAt: "2026-06-16T09:12:00+08:00",
    status: "printing",
    shippingMethod: "shipping",
    eta: "Arriving Fri 19 Jun",
    trackingNote: "On the printer now — your PETG enclosure is about 60% done.",
    items: [
      { name: "raspberry-pi-case.stl", material: "PETG", colour: "Carbon Black", quality: "Standard", infill: 25, quantity: 1, unitPrice: 18.4, lineTotal: 18.4 },
      { name: "vent-grille.stl", material: "PETG", colour: "Carbon Black", quality: "Standard", infill: 25, quantity: 2, unitPrice: 6.2, lineTotal: 12.4 },
    ],
    subtotal: 33.8,
    shipping: 9.5,
    total: 43.3,
  },
  {
    code: "STR-9F3T6",
    email: "alex@example.com",
    placedAt: "2026-05-02T14:40:00+08:00",
    status: "delivered",
    shippingMethod: "shipping",
    eta: "Delivered 5 May",
    trackingNote: "Delivered — thanks for printing with us!",
    items: [
      { name: "dragon-bust.stl", material: "PLA", colour: "Graphite Grey", quality: "Fine", infill: 15, quantity: 1, unitPrice: 41.0, lineTotal: 41.0 },
    ],
    subtotal: 41.0,
    shipping: 0,
    total: 41.0,
  },
  {
    code: "STR-4Q8X1",
    email: "sam@example.com",
    placedAt: "2026-06-17T18:05:00+08:00",
    status: "received",
    shippingMethod: "pickup",
    eta: "Ready for pickup Thu 18 Jun",
    trackingNote: "Queued for printing — we'll text you when it's ready for pickup.",
    items: [
      { name: "cosplay-pauldron.stl", material: "PLA", colour: "Signal Red", quality: "Standard", infill: 15, quantity: 2, unitPrice: 28.5, lineTotal: 57.0 },
    ],
    subtotal: 57.0,
    shipping: 0,
    total: 57.0,
  },
];

// ── Account lookups (the only way orders are read) ─────────────────────────
function norm(s: string) {
  return s.trim().toLowerCase();
}

/** A login is valid only if the email owns an order with that exact code. */
export function isValidLogin(email: string, code: string): boolean {
  const e = norm(email);
  const c = code.trim().toUpperCase();
  return ORDERS.some((o) => norm(o.email) === e && o.code.toUpperCase() === c);
}

export function ordersForEmail(email: string): Order[] {
  const e = norm(email);
  return ORDERS.filter((o) => norm(o.email) === e).sort(
    (a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)
  );
}

export function orderByCodeForEmail(email: string, code: string): Order | undefined {
  const e = norm(email);
  const c = code.trim().toUpperCase();
  return ORDERS.find((o) => norm(o.email) === e && o.code.toUpperCase() === c);
}

// ── Shop stats (social proof) ──────────────────────────────────────────────
export const SHOP_STATS = {
  printsCompleted: 600,
  rating: 4.8,
  reviews: 127,
  turnaroundHours: 48,
  repeatCustomerPct: 79,
};

// ── Live order feed (drives the subtle social-proof toast) ─────────────────
export type FeedItem = { name: string; suburb: string; item: string; material: MaterialKey; minsAgo: number };

export const ORDER_FEED: FeedItem[] = [
  { name: "Jordan M.", suburb: "Fremantle", item: "PETG enclosure", material: "PETG", minsAgo: 6 },
  { name: "Priya K.", suburb: "Joondalup", item: "cosplay helmet", material: "PLA", minsAgo: 14 },
  { name: "Liam T.", suburb: "Scarborough", item: "drone frame", material: "ABS", minsAgo: 23 },
  { name: "Chloe R.", suburb: "Subiaco", item: "desk organiser", material: "PLA", minsAgo: 38 },
  { name: "Noah B.", suburb: "Mandurah", item: "replacement gear", material: "PETG", minsAgo: 52 },
  { name: "Ava S.", suburb: "Midland", item: "miniature set", material: "PLA", minsAgo: 71 },
  { name: "Ethan W.", suburb: "Cockburn", item: "GoPro mount", material: "ABS", minsAgo: 88 },
];

// ── Testimonials ───────────────────────────────────────────────────────────
export type Testimonial = { quote: string; name: string; detail: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Uploaded an STL at lunch, had a price in seconds and the part in my hands two days later. The PETG finish was spotless.",
    name: "Marcus D.",
    detail: "Maker · Perth",
  },
  {
    quote: "Local, fast and actually answers their messages. I've ordered five times now — every print has been clean and on spec.",
    name: "Tanya L.",
    detail: "Small business · Joondalup",
  },
  {
    quote: "Did my whole cosplay build in PLA. Great surface quality on the fine setting and no warping on the big pieces.",
    name: "Reece P.",
    detail: "Cosplayer · Mandurah",
  },
];

// ── Gallery (rendered with on-brand SVG, no photo dependencies) ────────────
export type GalleryPiece = {
  id: string;
  title: string;
  material: MaterialKey;
  colour: string;
  category: string;
  shape: "bust" | "case" | "mech" | "vase" | "mount" | "mini";
};

export const GALLERY: GalleryPiece[] = [
  { id: "g1", title: "Articulated Dragon", material: "PLA", colour: "#f97316", category: "Display", shape: "bust" },
  { id: "g2", title: "Raspberry Pi Enclosure", material: "PETG", colour: "#1c1917", category: "Functional", shape: "case" },
  { id: "g3", title: "FPV Drone Frame", material: "ABS", colour: "#dc2626", category: "Engineering", shape: "mech" },
  { id: "g4", title: "Spiral Vase", material: "PLA", colour: "#15803d", category: "Decor", shape: "vase" },
  { id: "g5", title: "GoPro Helmet Mount", material: "ABS", colour: "#1d4ed8", category: "Functional", shape: "mount" },
  { id: "g6", title: "Tabletop Miniatures", material: "PLA", colour: "#7c3aed", category: "Hobby", shape: "mini" },
  { id: "g7", title: "Cable Management Set", material: "PETG", colour: "#facc15", category: "Functional", shape: "case" },
  { id: "g8", title: "Character Bust", material: "PLA", colour: "#57534e", category: "Display", shape: "bust" },
];
