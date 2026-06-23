import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRateLimitKey } from "@/lib/trusted-ip";

export const dynamic = "force-dynamic";

// Customer-facing order lookup.
// A customer proves ownership with their email + order number, and gets back
// ONLY the non-personal status/progress of their order — never name, phone,
// shipping address or any other personal information.
export async function POST(request: Request) {
  // Rate limit: this endpoint is a guessing surface (order numbers are
  // sequential), so keep attempts tight per IP/UA.
  const key = await buildRateLimitKey("order-lookup", request);
  const { allowed } = await checkRateLimit(key, 8, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: { email?: string; orderNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  // Accept "S3D-0001", "#0001", "0001" or "1". Strip a leading "S3D" prefix
  // first (it contains a digit), then keep only the order-number digits.
  const digits = (body.orderNumber ?? "")
    .replace(/^\s*s3d/i, "")
    .replace(/\D/g, "");
  const orderNumber = digits ? parseInt(digits, 10) : NaN;

  if (!email || !email.includes("@") || !Number.isFinite(orderNumber)) {
    return NextResponse.json(
      { error: "Please enter a valid email and order number." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Match on BOTH order number and email (case-insensitive). One generic
  // "not found" response for any mismatch so we never reveal which part is wrong.
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .ilike("email", email)
    .maybeSingle();

  if (!order) {
    return NextResponse.json(
      { error: "No order found for that email and order number." },
      { status: 404 }
    );
  }

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase
      .from("quote_inputs")
      .select("*")
      .eq("order_id", order.id)
      .order("original_filename"),
    supabase
      .from("order_status_history")
      .select("status, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  // Return ONLY non-personal fields. No name, email, phone, or address.
  const deliveryMethod =
    order.delivery_method === "pickup" ||
    (!order.delivery_method && order.shipping_cents === 500)
      ? "pickup"
      : "shipping";

  return NextResponse.json({
    orderNumber: order.order_number,
    reference: `S3D-${String(order.order_number).padStart(4, "0")}`,
    status: order.status,
    createdAt: order.created_at,
    deliveryMethod,
    trackingNumber: order.tracking_number ?? null,
    items: (items ?? []).map((qi) => ({
      material: qi.material ?? null,
      colour: qi.colour ?? null,
      infillPercent: qi.infill_percent ?? null,
      quantity: qi.quantity ?? null,
      lineTotalCents: qi.line_total_cents ?? null,
    })),
    totals: {
      subtotalCents: order.subtotal_cents ?? null,
      gstCents: order.gst_cents ?? null,
      shippingCents: order.shipping_cents ?? null,
      totalCents: order.total_cents ?? null,
    },
    history: (history ?? []).map((h) => ({
      status: h.status,
      at: h.created_at,
    })),
  });
}
