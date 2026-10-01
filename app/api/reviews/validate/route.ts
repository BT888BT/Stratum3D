import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLayeredRateLimit } from "@/lib/rate-limit";
import { parseOrderNumber, firstNameOf, escapeLike } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// Step 1 of leaving a review: the customer proves they have a real order by
// entering their order code. We return ONLY their first name (so the form can
// show "Reviewing as Marcus") — never the full name or any other detail.
export async function POST(request: Request) {
  // Order numbers are sequential and guessable, so keep attempts tight per IP/UA.
  const allowed = await checkLayeredRateLimit("review-validate", request, {
    perClient: [3, 15 * 60 * 1000],
    perIp: [5, 60 * 60 * 1000],
    global: [20, 60 * 60 * 1000],
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: { orderNumber?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderNumber = parseOrderNumber(body.orderNumber);
  if (!Number.isFinite(orderNumber)) {
    return NextResponse.json({ error: "Please enter a valid order code." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Please enter the email used for your order." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Must be a real order that has actually been placed (not a draft / abandoned
  // checkout).
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_name, status")
    .eq("order_number", orderNumber)
    .ilike("email", escapeLike(email))
    .not("status", "in", '("draft","checkout_pending")')
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order matching that code and email." }, { status: 404 });
  }

  // One review per order.
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A review has already been submitted for this order." },
      { status: 409 }
    );
  }

  return NextResponse.json({ firstName: firstNameOf(order.customer_name) });
}
