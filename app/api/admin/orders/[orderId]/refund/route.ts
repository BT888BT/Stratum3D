import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { orderId } = await params;
  const { reason } = await request.json().catch(() => ({}));
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, stripe_payment_intent_id, total_cents, order_number, customer_name, email")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json({ error: "No payment found for this order." }, { status: 400 });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      reason: "requested_by_customer",
    });

    // Update order status to cancelled and log
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "cancelled",
      note: `Refund issued via Stripe (refund ID: ${refund.id})${reason ? `. Reason: ${reason}` : ""}`,
    });

    return NextResponse.json({ success: true, refundId: refund.id, amountCents: refund.amount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe refund failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
