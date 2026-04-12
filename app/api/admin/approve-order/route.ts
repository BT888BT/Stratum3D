import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail, sendOrderRejectedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    if (!await isAdminAuthed()) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { orderId, action, rejectNote } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: "orderId and action are required." }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "pending_approval") {
      return NextResponse.json(
        { error: `Order is "${order.status}", not pending approval.` },
        { status: 400 }
      );
    }

    // ── Approve ───────────────────────────────────────────────────────────────
    if (action === "approve") {
      // Capture the authorised payment
      if (order.stripe_payment_intent_id) {
        await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
        console.log(`[approve-order] Captured payment intent ${order.stripe_payment_intent_id} for order ${orderId}`);
      } else {
        console.warn(`[approve-order] No stripe_payment_intent_id on order ${orderId} — skipping capture`);
      }

      await supabase.from("orders").update({ status: "order_received" }).eq("id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: "order_received",
        note: "Order approved by admin — payment captured",
      });

      await sendOrderConfirmationEmail({
        id: order.id,
        orderNumber: order.order_number ?? undefined,
        customerName: order.customer_name,
        email: order.email,
      }).catch(err => console.error("[approve-order] Approval email failed:", err));

      console.log(`[approve-order] Order ${orderId} approved and moved to order_received`);
      return NextResponse.json({ success: true, action: "approved" });
    }

    // ── Reject ────────────────────────────────────────────────────────────────
    if (action === "reject") {
      // Cancel the payment authorisation — no charge to customer
      if (order.stripe_payment_intent_id) {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
        console.log(`[approve-order] Cancelled payment intent ${order.stripe_payment_intent_id} for order ${orderId}`);
      }

      await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: "cancelled",
        note: rejectNote
          ? `Order rejected by admin: ${rejectNote}`
          : "Order rejected by admin — payment authorisation cancelled",
      });

      await sendOrderRejectedEmail({
        id: order.id,
        orderNumber: order.order_number ?? undefined,
        customerName: order.customer_name,
        email: order.email,
        totalCents: order.total_cents,
        rejectNote: rejectNote || null,
      }).catch(err => console.error("[approve-order] Rejection email failed:", err));

      console.log(`[approve-order] Order ${orderId} rejected and cancelled`);
      return NextResponse.json({ success: true, action: "rejected" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process order." },
      { status: 500 }
    );
  }
}
