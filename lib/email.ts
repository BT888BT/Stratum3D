import { Resend } from "resend";
import { generateInvoicePdf, type InvoicePdfData } from "@/lib/invoice-pdf";
import { business } from "@/lib/business";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "orders@stratum3d.com.au";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "";
const ADMIN = process.env.EMAIL_ADMIN ?? "";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function formatAud(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(cents / 100);
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Shared email wrapper ─────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:20px 16px">

    <!-- Header -->
    <div style="background:#0e0a06;border-radius:12px 12px 0 0;padding:24px 28px;text-align:center">
      <!-- Logo -->
      <div style="margin-bottom:8px">
        <img src="https://www.stratum3d.com.au/favicon.png" width="36" height="36" alt="Stratum3D" style="display:inline-block" />
      </div>
      <span style="font-size:20px;font-weight:700;color:#f5f0eb;letter-spacing:0.08em">STRATUM<span style="color:#f97316">3D</span></span>
    </div>

    <!-- Body card -->
    <div style="background:#ffffff;border-left:1px solid #e5e0da;border-right:1px solid #e5e0da;padding:28px">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#faf8f5;border:1px solid #e5e0da;border-top:none;border-radius:0 0 12px 12px;padding:20px 28px;text-align:center">
      <p style="margin:0;font-size:11px;color:#a09890;letter-spacing:0.06em">STRATUM3D — LOCAL 3D PRINTING — AUSTRALIA</p>
      <p style="margin:6px 0 0 0;font-size:11px;color:#c0b8b0">
        <a href="${SITE}" style="color:#f97316;text-decoration:none">stratum3d.com.au</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Shared: track-order button + tracking-number block ──────────────────────

// Button linking to the customer-facing track-order page, where they enter
// their email + order number to see live status.
function trackOrderButton(): string {
  return `
    <div style="text-align:center;margin:24px 0 8px 0">
      <a href="${SITE}/account" style="display:inline-block;background:#f97316;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 30px;border-radius:8px">Track your order →</a>
    </div>`;
}

// Australia Post tracking-number block. Returns "" when no number is set, so
// callers can drop it in unconditionally and nothing is shown without a number.
function trackingNumberBlock(trackingNumber?: string | null): string {
  const num = (trackingNumber ?? "").trim();
  if (!num) return "";
  const auspost = `https://auspost.com.au/mypost/track/details/${encodeURIComponent(num)}`;
  return `
    <div style="background:#f0faf5;border:1px solid #c4edda;border-radius:8px;padding:14px 16px;margin:16px 0">
      <p style="margin:0;font-size:11px;font-weight:700;color:#0a7c42;text-transform:uppercase;letter-spacing:0.08em">Australia Post tracking number</p>
      <p style="margin:6px 0 0 0;font-size:16px;font-weight:700;color:#1a1a1a;letter-spacing:0.02em">${esc(num)}</p>
      <p style="margin:8px 0 0 0;font-size:12px"><a href="${auspost}" style="color:#f97316;text-decoration:none">Track with Australia Post →</a></p>
    </div>`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderLineItem = {
  filename: string;
  material: string;
  colour: string;
  wallLayers: number;
  infillPercent: number;
  quantity: number;
  removeSupports: boolean;
  lineTotalCents: number;
};

// ─── Customer: under review (payment authorised, not yet captured) ────────────

export async function sendOrderUnderReviewEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  items: OrderLineItem[];
  shippingMethod: string;
  shippingAddress: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const adminLink = `${SITE}/admin/orders/${order.id}`;

  const itemRowsHtml = order.items.length > 0
    ? order.items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;vertical-align:top">
        <p style="margin:0;font-weight:600;font-size:14px;color:#1a1a1a">${esc(item.filename)}</p>
        <p style="margin:4px 0 0 0;font-size:12px;color:#888">
          ${esc(item.material)} · ${esc(item.colour)} · ${item.wallLayers} walls · ${item.infillPercent}% infill${item.removeSupports ? " · supports removed" : ""}
        </p>
      </td>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;text-align:center;vertical-align:top;font-size:13px;color:#666;width:44px">×${item.quantity}</td>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;text-align:right;vertical-align:top;font-size:14px;font-weight:600;color:#1a1a1a;width:80px">${formatAud(item.lineTotalCents)}</td>
    </tr>
  `).join("")
    : `<tr><td colspan="3" style="padding:14px 0;border-top:1px solid #f0ece6;font-size:13px;color:#888">Print files received — settings will be confirmed shortly.</td></tr>`;

  const deliveryLabel = order.shippingMethod === "pickup" ? "Parcel locker pickup" : "Shipping (Australia Post)";

  const deliveryBlock = order.shippingMethod === "pickup"
    ? `<div style="background:#fef7f0;border:1px solid #fde0c4;border-radius:8px;padding:14px 16px;margin-top:20px">
        <p style="margin:0;font-size:13px;color:#c2590a;font-weight:600">PARCEL LOCKER PICKUP</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#666;line-height:1.5">Stirling Central Shopping Centre, 478 Wanneroo Rd, Westminster WA 6061 — we'll email you when it's ready for collection.</p>
      </div>`
    : `<div style="background:#f0faf5;border:1px solid #c4edda;border-radius:8px;padding:14px 16px;margin-top:20px">
        <p style="margin:0;font-size:13px;color:#0a7c42;font-weight:600">SHIPPING — AUSTRALIA POST</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#666;line-height:1.5">${esc(order.shippingAddress)}</p>
      </div>`;

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:22px;color:#1a1a1a">Thanks, ${esc(order.customerName)}!</h2>
    <p style="margin:0 0 24px 0;font-size:14px;color:#888">We've received your order and your payment has been authorised.</p>

    <div style="display:inline-block;background:#0e0a06;color:#f97316;font-size:13px;font-weight:700;padding:6px 14px;border-radius:6px;letter-spacing:0.08em;margin-bottom:16px">${shortId}</div>

    <div style="background:#fef7f0;border:1px solid #fde0c4;border-radius:8px;padding:14px 16px;margin-bottom:20px">
      <p style="margin:0;font-size:13px;font-weight:600;color:#c2590a">ORDER UNDER REVIEW</p>
      <p style="margin:6px 0 0 0;font-size:13px;color:#666;line-height:1.7"><strong>No charge has been made to your card yet.</strong> We're reviewing your print files before we start — you'll hear back within a few hours.</p>
    </div>

    <!-- Invoice -->
    <div style="background:#faf8f5;border:1px solid #e5e0da;border-radius:8px;padding:16px 18px;margin-bottom:4px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:0 0 10px 0;font-size:10px;font-weight:700;color:#a09890;text-transform:uppercase;letter-spacing:0.1em">Item</td>
          <td style="padding:0 0 10px 0;font-size:10px;font-weight:700;color:#a09890;text-transform:uppercase;letter-spacing:0.1em;text-align:center">Qty</td>
          <td style="padding:0 0 10px 0;font-size:10px;font-weight:700;color:#a09890;text-transform:uppercase;letter-spacing:0.1em;text-align:right">Price</td>
        </tr>
        ${itemRowsHtml}
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:14px 18px 0 18px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#888">Subtotal</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#555">${formatAud(order.subtotalCents)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#888">${deliveryLabel}</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#555">${formatAud(order.shippingCents)}</td>
        </tr>
        ${order.gstCents > 0 ? `<tr>
          <td style="padding:4px 0;font-size:13px;color:#888">GST (10%)</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#555">${formatAud(order.gstCents)}</td>
        </tr>` : ""}
        <tr>
          <td colspan="2" style="padding:10px 0 0 0;border-top:2px solid #1a1a1a"></td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:16px;font-weight:700;color:#1a1a1a">Order total</td>
          <td style="padding:4px 0;text-align:right;font-size:16px;font-weight:700;color:#f97316">${formatAud(order.totalCents)}</td>
        </tr>
      </table>
    </div>

    ${deliveryBlock}

    <p style="margin:24px 0 0 0;font-size:13px;color:#888;line-height:1.7">You'll receive another email once we've reviewed your files. If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    subject: `Stratum3D — Order ${shortId} received — under review`,
    html: emailWrapper(content),
  });

  if (error) {
    console.error(`[email] under-review email error for ${order.email}:`, JSON.stringify(error));
    throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  }

  console.log(`[email] Under-review email sent to ${order.email} for ${shortId}`);

  // Admin notification
  if (ADMIN) {
    const itemSummary = order.items.length > 0
      ? order.items.map(i => `${esc(i.filename)} (${esc(i.material)} ${esc(i.colour)} ×${i.quantity}${i.removeSupports ? " +supports removed" : ""})`).join(", ")
      : "⚠️ Print settings not recorded — check order in admin";
    const deliveryInfo = order.shippingMethod === "pickup" ? "Parcel locker pickup" : `Ship to: ${esc(order.shippingAddress)}`;
    const { error: adminErr } = await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `New order to approve ${shortId} — ${order.customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
          <h2>New order — pending your approval</h2>
          <p><strong>Customer:</strong> ${esc(order.customerName)} (${esc(order.email)})</p>
          <p><strong>Total:</strong> ${formatAud(order.totalCents)}</p>
          <p><strong>Delivery:</strong> ${deliveryInfo}</p>
          <p><strong>Items:</strong> ${itemSummary}</p>
          <p><a href="${adminLink}" style="color:#0070f3;font-weight:600">Review &amp; approve order →</a></p>
        </div>
      `,
    });
    if (adminErr) {
      console.error("[email] Admin notification failed:", JSON.stringify(adminErr));
    }
  }
}

// ─── Admin: new review submitted ──────────────────────────────────────────────

export async function sendNewReviewEmail(review: {
  orderNumber: number;
  firstName: string;
  body: string;
}) {
  if (!process.env.RESEND_API_KEY || !ADMIN) return;

  const shortId = `S3D-${String(review.orderNumber).padStart(4, "0")}`;
  const adminLink = `${SITE}/admin/reviews`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New review submitted — ${shortId} (${review.firstName})`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
        <h2>New review — pending your approval</h2>
        <p><strong>From:</strong> ${esc(review.firstName)}</p>
        <p><strong>Order:</strong> ${esc(shortId)}</p>
        <div style="background:#faf8f5;border-left:3px solid #f97316;padding:12px 16px;border-radius:0 6px 6px 0;margin:12px 0">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.6">${esc(review.body)}</p>
        </div>
        <p><a href="${adminLink}" style="color:#0070f3;font-weight:600">Review &amp; approve it in the admin →</a></p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] New-review notification failed:", JSON.stringify(error));
    return;
  }

  console.log(`[email] New-review notification sent to ${ADMIN} for ${shortId}`);
}

// ─── Customer: order rejected ─────────────────────────────────────────────────

export async function sendOrderRejectedEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  totalCents: number;
  rejectNote?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:22px;color:#1a1a1a">Hi ${esc(order.customerName)},</h2>
    <p style="margin:0 0 24px 0;font-size:14px;color:#888">We have an update on your recent order.</p>

    <div style="display:inline-block;background:#0e0a06;color:#f97316;font-size:13px;font-weight:700;padding:6px 14px;border-radius:6px;letter-spacing:0.08em;margin-bottom:20px">${shortId}</div>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 18px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;font-weight:600;color:#dc2626">ORDER CANCELLED</p>
      <p style="margin:8px 0 0 0;font-size:13px;color:#666;line-height:1.7">Unfortunately we're unable to process this order. <strong>No charge has been made to your card</strong> — the payment authorisation has been released.</p>
    </div>

    ${order.rejectNote ? `
    <div style="background:#faf8f5;border-left:3px solid #f97316;padding:12px 16px;border-radius:0 6px 6px 0;margin:16px 0">
      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#a09890;text-transform:uppercase;letter-spacing:0.08em">Note from our team</p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6">${esc(order.rejectNote)}</p>
    </div>` : ""}

    <p style="margin:20px 0 0 0;font-size:13px;color:#888;line-height:1.7">If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    subject: `Stratum3D — Order ${shortId} cancelled`,
    html: emailWrapper(content),
  });

  if (error) {
    console.error(`[email] rejection email error for ${order.email}:`, JSON.stringify(error));
    throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  }

  console.log(`[email] Rejection email sent to ${order.email} for ${shortId}`);
}

// ─── Customer: order approved (brief notice — full details already sent) ────────

export async function sendOrderConfirmationEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  note?: string | null;
  // When provided, a PDF tax invoice is generated and attached to the email.
  invoice?: InvoicePdfData;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  // Build the invoice PDF attachment. Never let a PDF failure block the email —
  // the customer still gets their approval notice if generation goes wrong.
  let attachments: { filename: string; content: Buffer }[] | undefined;
  if (order.invoice) {
    try {
      const pdf = await generateInvoicePdf(order.invoice);
      attachments = [{ filename: `Invoice-${shortId}.pdf`, content: Buffer.from(pdf) }];
    } catch (err) {
      console.error(`[email] Invoice PDF generation failed for ${shortId}:`, err);
    }
  }

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:22px;color:#1a1a1a">Great news, ${esc(order.customerName)}!</h2>
    <p style="margin:0 0 24px 0;font-size:14px;color:#888">Your order has been reviewed and approved.</p>

    <div style="display:inline-block;background:#0e0a06;color:#f97316;font-size:13px;font-weight:700;padding:6px 14px;border-radius:6px;letter-spacing:0.08em;margin-bottom:20px">${shortId}</div>

    <div style="background:#f0faf5;border:1px solid #c4edda;border-radius:8px;padding:16px 18px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;font-weight:600;color:#0a7c42">ORDER APPROVED</p>
      <p style="margin:8px 0 0 0;font-size:13px;color:#666;line-height:1.7">Your payment has been confirmed and we'll be starting on your print soon.</p>
    </div>
${order.note ? `
    <div style="background:#faf8f5;border-left:3px solid #f97316;padding:12px 16px;border-radius:0 6px 6px 0;margin:0 0 20px 0">
      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#a09890;text-transform:uppercase;letter-spacing:0.08em">Note from our team</p>
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6">${esc(order.note)}</p>
    </div>` : ""}
    <p style="margin:0;font-size:13px;color:#888;line-height:1.7">We'll send you another email when your order ships. If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  // BCC a copy (with the same invoice attachment) to the business inbox, so we
  // keep a record of every approved order. BCC keeps this address hidden from
  // the customer. Skip it if it's the same address the order went to.
  const bcc =
    business.email && business.email.toLowerCase() !== order.email.toLowerCase()
      ? business.email
      : undefined;

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    bcc,
    subject: `Stratum3D — Order ${shortId} approved — printing soon`,
    html: emailWrapper(content),
    attachments,
  });

  if (error) {
    console.error(`[email] Approval email error for ${order.email}:`, JSON.stringify(error));
    throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  }

  console.log(`[email] Approval email sent to ${order.email}${bcc ? ` (bcc ${bcc})` : ""} for ${shortId}${attachments ? " (with invoice)" : ""}`);
}

// ─── Customer: status update ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; colour: string; bg: string; border: string }> = {
  order_shipped:  { label: "Your order has been shipped",   colour: "#0a7c42", bg: "#f0faf5", border: "#c4edda" },
  cancelled:      { label: "Your order has been cancelled", colour: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  refunded:       { label: "Your order has been refunded",  colour: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

export async function sendStatusUpdateEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  status: string;
  note?: string | null;
  trackingNumber?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not set. Add it to your Vercel environment variables." };
  }

  const cfg = STATUS_CONFIG[order.status];
  if (!cfg) {
    return { sent: false, reason: `No email template for status "${order.status}" — only order_shipped/completed/cancelled/refunded trigger emails.` };
  }

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const isShipped = order.status === "order_shipped";

  const intro = isShipped
    ? `Good news — your order <strong style="color:#1a1a1a">${shortId}</strong> is on its way.`
    : `Your order <strong style="color:#1a1a1a">${shortId}</strong> has been updated to <strong style="color:${cfg.colour}">${esc(order.status)}</strong>.`;

  const content = `
    <!-- Status banner -->
    <div style="background:${cfg.bg};border:1px solid ${cfg.border};border-radius:8px;padding:20px 22px;text-align:center;margin-bottom:24px">
      <p style="margin:0;font-size:18px;font-weight:700;color:${cfg.colour}">${cfg.label}</p>
      <p style="margin:8px 0 0 0;font-size:13px;color:#888">Order ${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">Hi ${esc(order.customerName)},</p>
    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">${intro}</p>

    ${order.note ? `
    <div style="background:#faf8f5;border-left:3px solid #f97316;padding:12px 16px;border-radius:0 6px 6px 0;margin:16px 0">
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6">${esc(order.note)}</p>
    </div>` : ""}

    ${isShipped ? trackingNumberBlock(order.trackingNumber) : ""}
    ${isShipped ? trackOrderButton() : ""}

    <p style="margin:20px 0 0 0;font-size:13px;color:#888;line-height:1.7">If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    subject: `Stratum3D — ${cfg.label} (${shortId})`,
    html: emailWrapper(content),
  });

  if (error) {
    console.error(`[email] Resend API error for ${order.email}:`, JSON.stringify(error));
    return { sent: false, reason: `Resend: ${error.message || JSON.stringify(error)}` };
  }

  console.log(`[email] Status update "${order.status}" sent to ${order.email} for ${shortId} (id: ${data?.id})`);
  return { sent: true };
}

// ─── Customer: tracking number added (after the order already shipped) ────────

export async function sendTrackingNumberEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  trackingNumber: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not set. Add it to your Vercel environment variables." };
  }

  const num = (order.trackingNumber ?? "").trim();
  if (!num) {
    return { sent: false, reason: "No tracking number provided." };
  }

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const content = `
    <!-- Status banner -->
    <div style="background:#f0faf5;border:1px solid #c4edda;border-radius:8px;padding:20px 22px;text-align:center;margin-bottom:24px">
      <p style="margin:0;font-size:18px;font-weight:700;color:#0a7c42">Tracking number for your order</p>
      <p style="margin:8px 0 0 0;font-size:13px;color:#888">Order ${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">Hi ${esc(order.customerName)},</p>
    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">Here's the tracking number for your order <strong style="color:#1a1a1a">${shortId}</strong>.</p>

    ${trackingNumberBlock(num)}
    ${trackOrderButton()}

    <p style="margin:20px 0 0 0;font-size:13px;color:#888;line-height:1.7">If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    subject: `Stratum3D — Tracking number for order ${shortId}`,
    html: emailWrapper(content),
  });

  if (error) {
    console.error(`[email] Tracking email error for ${order.email}:`, JSON.stringify(error));
    return { sent: false, reason: `Resend: ${error.message || JSON.stringify(error)}` };
  }

  console.log(`[email] Tracking number sent to ${order.email} for ${shortId} (id: ${data?.id})`);
  return { sent: true };
}
