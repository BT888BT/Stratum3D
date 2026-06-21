import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { discountCodeSchema } from "@/lib/validation";
import { computeDiscountCents, recomputeTotals } from "@/lib/quote";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRateLimitKey } from "@/lib/trusted-ip";
import { formatAud } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Apply (or remove) a single discount code on a draft order.
 *
 * This endpoint VALIDATES the code and writes the recomputed totals to the
 * order so the UI can reflect them — but it does NOT mark the code as used.
 * The code is only consumed atomically at checkout (see app/api/checkout).
 *
 * Security: discount is computed entirely server-side from the order's stored
 * subtotal/shipping; nothing about the price is trusted from the client.
 */
export async function POST(request: Request) {
  try {
    // Rate limit hard — this is the surface that could be used to enumerate codes
    const rateLimitKey = await buildRateLimitKey("apply-discount", request);
    const { allowed } = await checkRateLimit(rateLimitKey, 15, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { orderId, checkoutToken, code, remove } = body as Record<string, unknown>;

    if (!orderId || !checkoutToken) {
      return NextResponse.json({ error: "orderId and checkoutToken are required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify order exists, token matches, and is still a draft
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, checkout_token, subtotal_cents, shipping_cents")
      .eq("id", orderId)
      .eq("checkout_token", checkoutToken)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found or invalid token." }, { status: 404 });
    }

    if (order.status !== "draft") {
      return NextResponse.json({ error: "Order has already been submitted." }, { status: 400 });
    }

    // ── Remove an applied code ──────────────────────────────────────────────
    if (remove) {
      const totals = recomputeTotals(order.subtotal_cents, order.shipping_cents, 0);
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          discount_code: null,
          discount_cents: 0,
          gst_cents: totals.gstCents,
          total_cents: totals.totalCents,
        })
        .eq("id", order.id)
        .eq("status", "draft");
      if (updateError) throw new Error(updateError.message);

      return NextResponse.json({
        discountCode: null,
        discountCents: 0,
        subtotalCents: order.subtotal_cents,
        shippingCents: order.shipping_cents,
        gstCents: totals.gstCents,
        totalCents: totals.totalCents,
      });
    }

    // ── Apply a code ────────────────────────────────────────────────────────
    const parsedCode = discountCodeSchema.safeParse(code);
    if (!parsedCode.success) {
      return NextResponse.json({ error: "Please enter a valid discount code." }, { status: 400 });
    }
    const normalisedCode = parsedCode.data; // trimmed + uppercased

    // Look up an active, unused, unexpired code (case-insensitive)
    const nowIso = new Date().toISOString();
    const { data: codeRow } = await supabase
      .from("discount_codes")
      .select("id, code, discount_type, discount_value, max_discount_cents, min_subtotal_cents, active, used, expires_at")
      .ilike("code", normalisedCode)
      .maybeSingle();

    // Generic message so we don't leak which condition failed (anti-enumeration)
    const invalidMsg = "This code is invalid, expired, or has already been used.";
    if (
      !codeRow ||
      !codeRow.active ||
      codeRow.used ||
      (codeRow.expires_at && codeRow.expires_at <= nowIso)
    ) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }

    if (order.subtotal_cents < codeRow.min_subtotal_cents) {
      return NextResponse.json(
        { error: `This code requires a parts subtotal of at least ${formatAud(codeRow.min_subtotal_cents)}.` },
        { status: 400 }
      );
    }

    const discountCents = computeDiscountCents(codeRow, order.subtotal_cents);
    const totals = recomputeTotals(order.subtotal_cents, order.shipping_cents, discountCents);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        discount_code: codeRow.code,
        discount_cents: totals.discountCents,
        gst_cents: totals.gstCents,
        total_cents: totals.totalCents,
      })
      .eq("id", order.id)
      .eq("status", "draft");
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({
      discountCode: codeRow.code,
      discountCents: totals.discountCents,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      gstCents: totals.gstCents,
      totalCents: totals.totalCents,
    });
  } catch (error) {
    console.error("[apply-discount]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply discount." },
      { status: 500 }
    );
  }
}
