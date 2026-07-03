// ─── Invoice PDF generator ────────────────────────────────────────────────────
// Builds a clean, print-ready PDF invoice that mirrors the on-screen invoice at
// app/admin/orders/[id]/invoice. Pure JS (pdf-lib) so it runs in the Vercel
// serverless runtime with no headless browser or native binaries.
//
// Only business identity (from lib/business.ts) and the order's own details are
// included — nothing personal beyond what belongs on an invoice.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { business } from "@/lib/business";
import { formatAud } from "@/lib/utils";

export type InvoicePdfItem = {
  description: string;
  specs?: string; // e.g. "PLA / Black"
  quantity: number;
  lineTotalCents: number | null;
};

export type InvoicePdfData = {
  orderNumber?: number | null;
  id: string;
  createdAt: string; // ISO
  customerName: string;
  email: string;
  isPickup: boolean;
  addressLines: string[];
  items: InvoicePdfItem[];
  subtotalCents: number;
  discountCents: number;
  discountCode?: string | null;
  shippingCents: number;
  gstCents: number;
  totalCents: number;
  currency: string;
  isPaid: boolean;
};

// Palette (mirrors the HTML invoice)
const INK = rgb(0.102, 0.102, 0.102); // #1a1a1a
const GREY = rgb(0.333, 0.333, 0.333); // #555
const MUTED = rgb(0.627, 0.596, 0.565); // #a09890
const ORANGE = rgb(0.976, 0.451, 0.086); // #f97316
const GREEN = rgb(0.039, 0.486, 0.259); // #0a7c42
const RULE = rgb(0.898, 0.878, 0.855); // #e5e0da

const PAGE_W = 595.28; // A4 portrait
const PAGE_H = 841.89;
const MARGIN = 50;
const RIGHT = PAGE_W - MARGIN;

/**
 * Fetch the Stratum3D logo (public/favicon.png) so it can be embedded. Uses the
 * public site URL, which always serves it. Returns null on any failure — the
 * invoice still renders with the text wordmark, so a missing logo never breaks
 * PDF generation.
 */
async function loadLogo(doc: PDFDocument) {
  try {
    const res = await fetch(`${business.website.replace(/\/+$/, "")}/favicon.png`);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

/** Draw right-aligned text ending at x = `right`. */
function drawRight(
  page: PDFPage,
  text: string,
  right: number,
  y: number,
  font: PDFFont,
  size: number,
  color = INK
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: right - w, y, size, font, color });
}

/** Truncate text to fit a max width, appending an ellipsis if needed. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(t + "…", size) > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadLogo(doc);

  const isTaxInvoice = business.gstRegistered;
  const docTitle = isTaxInvoice ? "TAX INVOICE" : "INVOICE";
  const hasGst = data.gstCents > 0;

  const invoiceNo = data.orderNumber
    ? `S3D-${String(data.orderNumber).padStart(4, "0")}`
    : data.id.slice(0, 8).toUpperCase();

  const issued = new Date(data.createdAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let y = PAGE_H - MARGIN;

  // ── Header: wordmark (left) + document title (right) ──────────────────────
  let wordX = MARGIN;
  if (logo) {
    const dim = 26;
    page.drawImage(logo, { x: MARGIN, y: y - dim + 4, width: dim, height: dim });
    wordX = MARGIN + dim + 8;
  }
  page.drawText("STRATUM", { x: wordX, y, size: 20, font: bold, color: INK });
  const stratumW = bold.widthOfTextAtSize("STRATUM", 20);
  page.drawText("3D", { x: wordX + stratumW, y, size: 20, font: bold, color: ORANGE });

  drawRight(page, docTitle, RIGHT, y, bold, 20, INK);

  // Left identity lines are indented to the wordmark (wordX) so they clear the
  // logo, while staying row-aligned with the right-hand meta column.
  y -= 22;
  page.drawText(business.legalName, { x: wordX, y, size: 10, font, color: GREY });
  drawRight(page, `Invoice no.  ${invoiceNo}`, RIGHT, y, font, 10, GREY);

  y -= 15;
  if (business.abn) {
    page.drawText(`ABN ${business.abn}`, { x: wordX, y, size: 10, font: bold, color: INK });
  }
  drawRight(page, `Date issued  ${issued}`, RIGHT, y, font, 10, GREY);

  y -= 15;
  drawRight(page, data.isPaid ? "PAID" : "UNPAID", RIGHT, y, bold, 10, data.isPaid ? GREEN : ORANGE);

  // Business contact line
  y -= 15;
  page.drawText(`${business.email}   ·   ${business.website.replace(/^https?:\/\//, "")}`, {
    x: wordX,
    y,
    size: 9,
    font,
    color: MUTED,
  });

  // Header rule
  y -= 14;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: RIGHT, y }, thickness: 2, color: INK });

  // ── Bill to ───────────────────────────────────────────────────────────────
  y -= 26;
  page.drawText("BILL TO", { x: MARGIN, y, size: 9, font: bold, color: MUTED });
  y -= 16;
  page.drawText(data.customerName, { x: MARGIN, y, size: 12, font: bold, color: INK });
  y -= 15;
  page.drawText(data.email, { x: MARGIN, y, size: 10, font, color: GREY });
  for (const line of data.addressLines) {
    y -= 14;
    page.drawText(line, { x: MARGIN, y, size: 10, font, color: GREY });
  }
  if (data.isPickup) {
    y -= 14;
    page.drawText("Parcel locker pickup", { x: MARGIN, y, size: 10, font, color: GREY });
  }

  // ── Line items table ──────────────────────────────────────────────────────
  y -= 34;
  const QTY_X = 380; // centre-ish column for qty
  page.drawText("DESCRIPTION", { x: MARGIN, y, size: 9, font: bold, color: MUTED });
  drawRight(page, "QTY", QTY_X, y, bold, 9, MUTED);
  drawRight(page, "AMOUNT", RIGHT, y, bold, 9, MUTED);
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: RIGHT, y }, thickness: 1, color: INK });

  const descMaxW = QTY_X - MARGIN - 60;
  if (data.items.length > 0) {
    for (const it of data.items) {
      y -= 20;
      page.drawText(fit(it.description || "Print item", bold, 11, descMaxW), {
        x: MARGIN,
        y,
        size: 11,
        font: bold,
        color: INK,
      });
      drawRight(page, String(it.quantity ?? 1), QTY_X, y, font, 11, GREY);
      drawRight(
        page,
        it.lineTotalCents != null ? formatAud(it.lineTotalCents) : "—",
        RIGHT,
        y,
        bold,
        11,
        INK
      );
      if (it.specs) {
        y -= 13;
        page.drawText(fit(it.specs, font, 9, descMaxW), { x: MARGIN, y, size: 9, font, color: MUTED });
      }
      y -= 8;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: RIGHT, y }, thickness: 0.5, color: RULE });
    }
  } else {
    y -= 20;
    page.drawText("3D printing services", { x: MARGIN, y, size: 11, font, color: GREY });
    y -= 8;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: RIGHT, y }, thickness: 0.5, color: RULE });
  }

  // ── Totals (right-aligned block) ──────────────────────────────────────────
  const labelRight = RIGHT - 90; // labels end here, values end at RIGHT
  const totalRow = (label: string, value: string, strong = false) => {
    y -= 18;
    const f = strong ? bold : font;
    drawRight(page, label, labelRight, y, f, strong ? 12 : 10, strong ? INK : GREY);
    drawRight(page, value, RIGHT, y, f, strong ? 12 : 10, strong ? ORANGE : INK);
  };

  y -= 10;
  totalRow(hasGst ? "Subtotal (ex GST)" : "Subtotal", formatAud(data.subtotalCents));
  if (data.discountCents > 0) {
    totalRow(
      data.discountCode ? `Discount (${data.discountCode})` : "Discount",
      `-${formatAud(data.discountCents)}`
    );
  }
  totalRow(data.isPickup ? "Pickup" : "Shipping", formatAud(data.shippingCents));
  if (hasGst) totalRow("GST (10%)", formatAud(data.gstCents));

  y -= 12;
  page.drawLine({ start: { x: labelRight - 40, y: y + 6 }, end: { x: RIGHT, y: y + 6 }, thickness: 2, color: INK });
  totalRow(
    hasGst ? "Total (inc GST)" : "Total",
    `${formatAud(data.totalCents)} ${data.currency || "AUD"}`,
    true
  );

  // ── Footer ────────────────────────────────────────────────────────────────
  const footY = MARGIN + 30;
  page.drawLine({ start: { x: MARGIN, y: footY + 14 }, end: { x: RIGHT, y: footY + 14 }, thickness: 1, color: RULE });
  page.drawText(
    hasGst
      ? "Total price includes GST. Thank you for your business."
      : "Thank you for your business.",
    { x: MARGIN, y: footY, size: 10, font, color: MUTED }
  );

  return doc.save();
}
