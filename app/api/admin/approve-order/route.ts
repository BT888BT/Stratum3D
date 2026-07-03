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

    const { orderId, action, rejectNote, note } = await request.json();

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
        note: note
          ? `Order approved by admin — payment captured. Note: ${note}`
          : "Order approved by admin — payment captured",
      });

      // Build the invoice attachment from the order's line items + totals.
      const { data: quoteItems } = await supabase
        .from("quote_inputs")
        .select("*")
        .eq("order_id", orderId)
        .order("original_filename");

      const isPickup =
        order.delivery_method === "pickup" ||
        (!order.delivery_method && order.shipping_cents === 500);

      const addressLines: string[] = [];
      if (!isPickup && order.shipping_address_line1) {
        addressLines.push(order.shipping_address_line1);
        if (order.shipping_address_line2) addressLines.push(order.shipping_address_line2);
        addressLines.push(
          [order.shipping_city, order.shipping_state, order.shipping_postcode]
            .filter(Boolean)
            .join(" ")
        );
      }

      await sendOrderConfirmationEmail({
        id: order.id,
        orderNumber: order.order_number ?? undefined,
        customerName: order.customer_name,
        email: order.email,
        note: note || null,
        invoice: {
          id: order.id,
          orderNumber: order.order_number,
          createdAt: order.created_at,
          customerName: order.customer_name,
          email: order.email,
          isPickup,
          addressLines,
          items: (quoteItems ?? []).map((it) => ({
            description: it.original_filename || "Print item",
            specs: [it.material, it.colour].filter(Boolean).join(" / "),
            quantity: it.quantity ?? 1,
            lineTotalCents: it.line_total_cents ?? null,
          })),
          subtotalCents: order.subtotal_cents,
          discountCents: order.discount_cents ?? 0,
          discountCode: order.discount_code ?? null,
          shippingCents: order.shipping_cents,
          gstCents: order.gst_cents ?? 0,
          totalCents: order.total_cents,
          currency: order.currency || "AUD",
          isPaid: order.stripe_payment_intent_id != null,
        },
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
