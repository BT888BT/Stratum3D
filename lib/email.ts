import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "orders@stratum3d.com";
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
      <!-- Hex logo -->
      <div style="margin-bottom:8px">
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" stroke="#f97316" stroke-width="1.5" fill="rgba(249,115,22,0.1)"/>
          <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" stroke="#f97316" stroke-width="1" fill="rgba(249,115,22,0.15)" opacity="0.6"/>
          <circle cx="16" cy="16" r="3" fill="#f97316" opacity="0.9"/>
        </svg>
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

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderLineItem = {
  filename: string;
  material: string;
  colour: string;
  layerHeightMm: number;
  infillPercent: number;
  quantity: number;
  removeSupports: boolean;
  lineTotalCents: number;
};

// ─── Customer: order confirmation ────────────────────────────────────────────

export async function sendOrderConfirmationEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  items: OrderLineItem[];
  shippingAddress: string;
  shippingMethod: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set. Add it to your Vercel environment variables.");
  }

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const adminLink = `${SITE}/admin/orders/${order.id}`;

  const itemRowsHtml = order.items.map((item) => `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;vertical-align:top">
        <p style="margin:0;font-weight:600;font-size:14px;color:#1a1a1a">${esc(item.filename)}</p>
        <p style="margin:4px 0 0 0;font-size:12px;color:#888">
          ${esc(item.material)} · ${esc(item.colour)} · ${item.layerHeightMm}mm · ${item.infillPercent}% infill${item.removeSupports ? " · supports removed" : ""}
        </p>
      </td>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;text-align:center;vertical-align:top;font-size:13px;color:#666;width:44px">×${item.quantity}</td>
      <td style="padding:14px 0;border-top:1px solid #f0ece6;text-align:right;vertical-align:top;font-size:14px;font-weight:600;color:#1a1a1a;width:80px">${formatAud(item.lineTotalCents)}</td>
    </tr>
  `).join("");

  const deliveryLabel = order.shippingMethod === "pickup"
    ? "Parcel locker pickup"
    : "Shipping (Australia Post)";

  const deliveryBlock = order.shippingMethod === "pickup"
    ? `<div style="background:#fef7f0;border:1px solid #fde0c4;border-radius:8px;padding:14px 16px;margin-top:20px">
        <p style="margin:0;font-size:13px;color:#c2590a;font-weight:600">📍 PARCEL LOCKER PICKUP</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#666;line-height:1.5">Stirling Central Shopping Centre, 478 Wanneroo Rd, Westminster WA 6061 — we'll email you when it's ready for collection.</p>
      </div>`
    : `<div style="background:#f0faf5;border:1px solid #c4edda;border-radius:8px;padding:14px 16px;margin-top:20px">
        <p style="margin:0;font-size:13px;color:#0a7c42;font-weight:600">📦 SHIPPING — AUSTRALIA POST</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#666;line-height:1.5">${esc(order.shippingAddress)}</p>
      </div>`;

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:22px;color:#1a1a1a">Thanks, ${esc(order.customerName)}!</h2>
    <p style="margin:0 0 24px 0;font-size:14px;color:#888">Your order has been confirmed and payment received.</p>

    <!-- Order number badge -->
    <div style="display:inline-block;background:#0e0a06;color:#f97316;font-size:13px;font-weight:700;padding:6px 14px;border-radius:6px;letter-spacing:0.08em;margin-bottom:20px">${shortId}</div>

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
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#888">GST (10%)</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#555">${formatAud(order.gstCents)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 0 0 0;border-top:2px solid #1a1a1a"></td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:16px;font-weight:700;color:#1a1a1a">Total paid</td>
          <td style="padding:4px 0;text-align:right;font-size:16px;font-weight:700;color:#f97316">${formatAud(order.totalCents)}</td>
        </tr>
      </table>
    </div>

    ${deliveryBlock}

    <p style="margin:24px 0 0 0;font-size:13px;color:#888;line-height:1.7">We'll send you another email when your print status changes. If you have any questions, just reply to this email.</p>
    <p style="margin:8px 0 0 0;font-size:13px;color:#888">— The Stratum3D team</p>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO || undefined,
    to: order.email,
    subject: `Stratum3D — Order ${shortId} confirmed`,
    html: emailWrapper(content),
  });

  if (error) {
    console.error(`[email] Resend API error for ${order.email}:`, JSON.stringify(error));
    throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  }

  console.log(`[email] Order confirmation sent to ${order.email} for ${shortId} (id: ${data?.id})`);

  // Admin notification
  if (ADMIN) {
    const itemSummary = order.items.map(i => `${esc(i.filename)} (${esc(i.material)} ${esc(i.colour)} ×${i.quantity}${i.removeSupports ? " +supports removed" : ""})`).join(", ");
    const deliveryInfo = order.shippingMethod === "pickup" ? "📍 Parcel locker pickup" : `📦 Ship to: ${esc(order.shippingAddress)}`;
    const { error: adminErr } = await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `New paid order ${shortId} — ${order.customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
          <h2>New order received</h2>
          <p><strong>Customer:</strong> ${esc(order.customerName)} (${esc(order.email)})</p>
          <p><strong>Total:</strong> ${formatAud(order.totalCents)}</p>
          <p><strong>Delivery:</strong> ${deliveryInfo}</p>
          <p><strong>Items:</strong> ${itemSummary}</p>
          <p><a href="${adminLink}" style="color:#0070f3">View order in admin →</a></p>
        </div>
      `
    });
    if (adminErr) {
      console.error("[email] Admin notification failed:", JSON.stringify(adminErr));
    }
  }
}

// ─── Customer: status update ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; emoji: string; colour: string; bg: string; border: string }> = {
  paid:         { label: "Payment confirmed",                   emoji: "✓", colour: "#0a7c42", bg: "#f0faf5", border: "#c4edda" },
  printing:     { label: "Your order is now printing",          emoji: "⚙", colour: "#c2590a", bg: "#fef7f0", border: "#fde0c4" },
  order_ready:  { label: "Your order is ready",                 emoji: "📦", colour: "#0a7c42", bg: "#f0faf5", border: "#c4edda" },
  pickup_ready: { label: "Your order is ready for pickup",      emoji: "📍", colour: "#c2590a", bg: "#fef7f0", border: "#fde0c4" },
  completed:    { label: "Your order is complete",              emoji: "✓", colour: "#0a7c42", bg: "#f0faf5", border: "#c4edda" },
  cancelled:    { label: "Your order has been cancelled",       emoji: "✕", colour: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

export async function sendStatusUpdateEmail(order: {
  id: string;
  orderNumber?: number;
  customerName: string;
  email: string;
  status: string;
  note?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not set. Add it to your Vercel environment variables." };
  }

  const cfg = STATUS_CONFIG[order.status];
  if (!cfg) {
    return { sent: false, reason: `No email template for status "${order.status}" — only printing/completed/cancelled/paid trigger emails.` };
  }

  const shortId = order.orderNumber
    ? `S3D-${String(order.orderNumber).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const content = `
    <!-- Status banner -->
    <div style="background:${cfg.bg};border:1px solid ${cfg.border};border-radius:8px;padding:20px 22px;text-align:center;margin-bottom:24px">
      <div style="font-size:28px;margin-bottom:8px">${cfg.emoji}</div>
      <p style="margin:0;font-size:18px;font-weight:700;color:${cfg.colour}">${cfg.label}</p>
      <p style="margin:8px 0 0 0;font-size:13px;color:#888">Order ${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">Hi ${esc(order.customerName)},</p>
    <p style="margin:0 0 16px 0;font-size:14px;color:#555;line-height:1.7">Your order <strong style="color:#1a1a1a">${shortId}</strong> has been updated to <strong style="color:${cfg.colour}">${esc(order.status)}</strong>.</p>

    ${order.note ? `
    <div style="background:#faf8f5;border-left:3px solid #f97316;padding:12px 16px;border-radius:0 6px 6px 0;margin:16px 0">
      <p style="margin:0;font-size:13px;color:#555;line-height:1.6">${esc(order.note)}</p>
    </div>` : ""}

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
