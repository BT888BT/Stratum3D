import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "orders@stratum3d.com";
const ADMIN = process.env.EMAIL_ADMIN ?? "";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function formatAud(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(cents / 100);
}

// ─── Customer: order confirmation ────────────────────────────────────────────

export async function sendOrderConfirmationEmail(order: {
  id: string;
  customerName: string;
  email: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  material: string;
  colour: string;
  quantity: number;
  shippingMethod: string;
}) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const adminLink = `${SITE}/admin/orders/${order.id}`;

  // Customer email
  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Stratum3D — Order #${shortId} confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
        <h2 style="margin-bottom:4px">Thanks, ${order.customerName}!</h2>
        <p style="color:#555;margin-top:0">Your 3D print order has been placed and payment received.</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;color:#555">Order ID</td><td style="padding:8px 0;text-align:right"><strong>#${shortId}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#555">Material</td><td style="padding:8px 0;text-align:right">${order.material}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Colour</td><td style="padding:8px 0;text-align:right">${order.colour}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Quantity</td><td style="padding:8px 0;text-align:right">${order.quantity}</td></tr>
          <tr><td style="padding:8px 0;color:#555">Shipping</td><td style="padding:8px 0;text-align:right">${order.shippingMethod === "pickup" ? "Pickup" : "Standard shipping"}</td></tr>
          <tr style="border-top:1px solid #eee">
            <td style="padding:12px 0;color:#555">Subtotal</td><td style="padding:12px 0;text-align:right">${formatAud(order.subtotalCents)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555">GST</td><td style="padding:8px 0;text-align:right">${formatAud(order.gstCents)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555">Shipping</td><td style="padding:8px 0;text-align:right">${formatAud(order.shippingCents)}</td>
          </tr>
          <tr style="border-top:1px solid #eee">
            <td style="padding:12px 0;font-weight:bold">Total</td><td style="padding:12px 0;text-align:right;font-weight:bold">${formatAud(order.totalCents)}</td>
          </tr>
        </table>

        <p style="color:#555;font-size:14px">We'll send you another email when your print status changes. If you have any questions, just reply to this email.</p>
        <p style="color:#555;font-size:14px">— The Stratum3D team</p>
      </div>
    `
  });

  // Admin notification
  if (ADMIN) {
    await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `New paid order #${shortId} — ${order.customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
          <h2>New order received</h2>
          <p><strong>Customer:</strong> ${order.customerName} (${order.email})</p>
          <p><strong>Total:</strong> ${formatAud(order.totalCents)}</p>
          <p><strong>Material:</strong> ${order.material} — ${order.colour} × ${order.quantity}</p>
          <p><strong>Shipping:</strong> ${order.shippingMethod}</p>
          <p><a href="${adminLink}" style="color:#0070f3">View order in admin →</a></p>
        </div>
      `
    });
  }
}

// ─── Customer: status update ──────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  printing: "Your order is now printing",
  completed: "Your order is complete",
  cancelled: "Your order has been cancelled",
  paid: "Payment confirmed"
};

export async function sendStatusUpdateEmail(order: {
  id: string;
  customerName: string;
  email: string;
  status: string;
  note?: string | null;
}) {
  const label = STATUS_LABELS[order.status];
  if (!label) return; // Don't email for draft / checkout_pending

  const shortId = order.id.slice(0, 8).toUpperCase();

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Stratum3D — ${label} (#${shortId})`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:auto;color:#111">
        <h2>${label}</h2>
        <p>Hi ${order.customerName},</p>
        <p>Your order <strong>#${shortId}</strong> status has been updated to <strong>${order.status}</strong>.</p>
        ${order.note ? `<p style="background:#f5f5f5;padding:12px;border-radius:8px;color:#333">${order.note}</p>` : ""}
        <p style="color:#555;font-size:14px">— The Stratum3D team</p>
      </div>
    `
  });
}
