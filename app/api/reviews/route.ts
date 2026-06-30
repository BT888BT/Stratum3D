import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRateLimitKey } from "@/lib/trusted-ip";
import { parseOrderNumber, firstNameOf, REVIEW_MAX_LENGTH } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// GET — public list of approved reviews, newest first (for the /reviews page).
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, first_name, body, created_at")
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

  let payload: { orderNumber?: string; body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNumber = parseOrderNumber(payload.orderNumber);
  const text = (payload.body ?? "").trim();

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

  const { error: insertError } = await supabase.from("reviews").insert({
    order_id: order.id,
    order_number: order.order_number,
    first_name: firstNameOf(order.customer_name),
    body: text,
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

  return NextResponse.json({ ok: true });
}
