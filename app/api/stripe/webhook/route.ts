import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // #9: Idempotency — check if we've already processed this event
    const { data: existingEvent } = await supabase
      .from("processed_webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent) {
      // Already processed — return 200 so Stripe stops retrying
      return new Response("ok (duplicate)", { status: 200 });
    }

    // Record this event as being processed
    await supabase.from("processed_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    // ── Payment completed — confirm order + send email ─────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.orderId || session.client_reference_id || null;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "order_received",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null
          })
          .eq("id", orderId);

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: "order_received",
          note: "Stripe payment completed"
        });

        // Fetch order + ALL quote inputs to build the confirmation email
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        const { data: quoteInputs } = await supabase
          .from("quote_inputs")
          .select("*")
          .eq("order_id", orderId)
          .order("original_filename");

        if (order) {
          const items = (quoteInputs ?? []).map(qi => ({
            filename: qi.original_filename ?? "Unknown file",
            material: qi.material ?? "—",
            colour: qi.colour ?? "—",
            wallLayers: qi.wall_layers ?? 3,
            infillPercent: qi.infill_percent ?? 20,
            quantity: qi.quantity ?? 1,
            // #10: Use explicit remove_supports field (fall back to old method for existing orders)
            removeSupports: qi.remove_supports ?? (qi.shipping_method === "supports_removed"),
            lineTotalCents: qi.line_total_cents ?? 0,
          }));

          if (items.length === 0) {
            // Print settings missing — log for admin to investigate, but don't expose to customer
            console.error(`[webhook] MISSING quote_inputs for order ${orderId} — customer email will omit item table`);
          }

          // #10: Use explicit delivery_method field (fall back to shipping_cents for existing orders)
          const isPickup = order.delivery_method
            ? order.delivery_method === "pickup"
            : order.shipping_cents === 500;

          await sendOrderConfirmationEmail({
            id: order.id,
            orderNumber: order.order_number ?? undefined,
            customerName: order.customer_name,
            email: order.email,
            totalCents: order.total_cents,
            subtotalCents: order.subtotal_cents,
            shippingCents: order.shipping_cents,
            gstCents: order.gst_cents,
            items,
            shippingMethod: isPickup ? "pickup" : "shipping",
            shippingAddress: [
              order.shipping_address_line1,
              order.shipping_address_line2,
              order.shipping_city && `${order.shipping_city} ${order.shipping_state} ${order.shipping_postcode}`
            ].filter(Boolean).join(", "),
          }).catch((err) =>
            console.error("[email] order confirmation failed:", err)
          );
        }
      }
    }

    // ── Refund issued from Stripe dashboard — mark order as refunded ──
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;

      if (paymentIntentId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .single();

        if (order) {
          await supabase
            .from("orders")
            .update({ status: "refunded" })
            .eq("id", order.id);

          await supabase.from("order_status_history").insert({
            order_id: order.id,
            status: "refunded",
            note: `Refund confirmed by Stripe (charge: ${charge.id})`,
          });

          console.log(`[webhook] Order ${order.id} marked as refunded via Stripe charge ${charge.id}`);
        }
      }
    }

    // ── Checkout expired — customer didn't pay, delete the order ──
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.orderId || session.client_reference_id || null;

      if (orderId) {
        // Delete associated files from storage first
        const { data: files } = await supabase
          .from("order_files")
          .select("storage_path")
          .eq("order_id", orderId);

        if (files?.length) {
          const paths = files.map(f => f.storage_path);
          await supabase.storage.from("order-files").remove(paths);
        }

        // Cascade delete removes order_files, quote_inputs, order_status_history
        await supabase.from("orders").delete().eq("id", orderId);

        console.log(`[webhook] Deleted expired unpaid order ${orderId}`);
      }
    }

    // ── Opportunistic cleanup: delete stale draft/checkout_pending orders ──
    // Orders older than 24 hours that were never paid
    const staleDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: staleOrders } = await supabase
      .from("orders")
      .select("id")
      .in("status", ["draft", "checkout_pending"])
      .lt("created_at", staleDate)
      .limit(20);

    if (staleOrders?.length) {
      for (const stale of staleOrders) {
        // Delete storage files
        const { data: staleFiles } = await supabase
          .from("order_files")
          .select("storage_path")
          .eq("order_id", stale.id);

        if (staleFiles?.length) {
          await supabase.storage.from("order-files").remove(staleFiles.map(f => f.storage_path));
        }

        await supabase.from("orders").delete().eq("id", stale.id);
      }
      console.log(`[webhook] Cleaned up ${staleOrders.length} stale unpaid orders`);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    return new Response(
      `Webhook processing error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
