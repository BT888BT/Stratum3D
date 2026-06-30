import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRateLimitKey } from "@/lib/trusted-ip";
import { parseOrderNumber, firstNameOf, REVIEW_MAX_LENGTH } from "@/lib/reviews";
import { sendNewReviewEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET — public list of approved reviews, newest first (for the /reviews page).
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, first_name, body, rating, model, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[reviews] DB error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((r) => ({
      id: r.id,
      firstName: r.first_name,
      body: r.body,
      rating: r.rating ?? 5,
      model: r.model ?? null,
      createdAt: r.created_at,
    }))
  );
}

// POST — submit a review. Stored as 'pending' until an admin approves it.
export async function POST(request: Request) {
  const key = await buildRateLimitKey("review-submit", request);
  const { allowed } = await checkRateLimit(key, 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let payload: { orderNumber?: string; body?: string; rating?: number };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNumber = parseOrderNumber(payload.orderNumber);
  const text = (payload.body ?? "").trim();
  // Clamp to 1–5; default to 5 if missing/invalid.
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));

  if (!Number.isFinite(orderNumber)) {
    return NextResponse.json({ error: "Please enter a valid order code." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Your review can't be empty." }, { status: 400 });
  }
  if (text.length > REVIEW_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Reviews are limited to ${REVIEW_MAX_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, status")
    .eq("order_number", orderNumber)
    .not("status", "in", '("draft","checkout_pending")')
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "We couldn't find that order code." }, { status: 404 });
  }

  const reviewFirstName = firstNameOf(order.customer_name);

  // Derive a short "what they printed" label from the order's primary
  // material (e.g. "PETG"). Best-effort — null if there's nothing to show.
  const { data: firstItem } = await supabase
    .from("quote_inputs")
    .select("material")
    .eq("order_id", order.id)
    .limit(1)
    .maybeSingle();
  const model = firstItem?.material?.trim().slice(0, 40) || null;

  const { error: insertError } = await supabase.from("reviews").insert({
    order_id: order.id,
    order_number: order.order_number,
    first_name: reviewFirstName,
    body: text,
    rating,
    model,
    status: "pending",
  });

  if (insertError) {
    // 23505 = unique_violation → the one-review-per-order constraint.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "A review has already been submitted for this order." },
        { status: 409 }
      );
    }
    console.error("[reviews] Insert error:", insertError.message);
    return NextResponse.json(
      { error: "Couldn't save your review. Please try again." },
      { status: 500 }
    );
  }

  // Notify the admin a new review is waiting (best-effort — never block the response).
  try {
    await sendNewReviewEmail({
      orderNumber: order.order_number,
      firstName: reviewFirstName,
      body: text,
    });
  } catch (e) {
    console.error("[reviews] New-review email failed:", e);
  }

  return NextResponse.json({ ok: true });
}
