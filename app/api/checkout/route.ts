import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { recomputeTotals } from "@/lib/quote";

export async function POST(request: Request) {
  try {
    const { orderId, checkoutToken } = await request.json();

    if (!orderId || !checkoutToken) {
      return NextResponse.json(
        { error: "orderId and checkoutToken are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch order and verify the checkout token matches
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("checkout_token", checkoutToken)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found or invalid token." }, { status: 404 });
    }

    // Only allow checkout from draft status
    if (order.status !== "draft") {
      return NextResponse.json(
        { error: `Order is already in "${order.status}" status and cannot be checked out again.` },
        { status: 400 }
      );
    }

    // ── Atomic claim: nullify the token BEFORE calling Stripe ────────────────
    // This is a compare-and-swap — only one concurrent request can win.
    // We match on both id AND checkout_token so a second simultaneous request
    // (token already nullified) gets 0 rows and is rejected before Stripe is called.
    const { data: claimed, error: claimError } = await supabase
      .from("orders")
      .update({ checkout_token: null, status: "checkout_pending" })
      .eq("id", order.id)
      .eq("checkout_token", checkoutToken)
      .eq("status", "draft")
      .select("id")
      .single();

    if (claimError || !claimed) {
      return NextResponse.json(
        { error: "Checkout already in progress or order is no longer available." },
        { status: 409 }
      );
    }

    // ── Consume the single-use discount code (if any) ────────────────────────
    // Only the request that won the claim above reaches here. Mark the code used
    // atomically — `.eq("used", false)` makes it a compare-and-swap so two orders
    // can never both burn the same code. If it's no longer available, revert the
    // claim, strip the dead discount + recompute totals, and ask them to retry.
    let consumedCodeId: string | null = null;
    if (order.discount_code) {
      const { data: consumed } = await supabase
        .from("discount_codes")
        .update({
          used: true,
          redeemed_order_id: order.id,
          redeemed_at: new Date().toISOString(),
        })
        .ilike("code", order.discount_code)
        .eq("used", false)
        .eq("active", true)
        .select("id")
        .single();

      if (!consumed) {
        const totals = recomputeTotals(order.subtotal_cents, order.shipping_cents, 0);
        await supabase
          .from("orders")
          .update({
            status: "draft",
            checkout_token: checkoutToken,
            discount_code: null,
            discount_cents: 0,
            gst_cents: totals.gstCents,
            total_cents: totals.totalCents,
          })
          .eq("id", order.id);

        return NextResponse.json(
          { error: "Your discount code is no longer available and has been removed. Please review your updated total and try again." },
          { status: 409 }
        );
      }
      consumedCodeId = consumed.id;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_intent_data: { capture_method: "manual" },
        success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout/cancelled`,
        customer_email: order.email,
        client_reference_id: order.id,
        metadata: {
          orderId: order.id
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "aud",
              product_data: {
                name: `Stratum3D Order ${order.order_number ? `S3D-${String(order.order_number).padStart(4, "0")}` : order.id.slice(0, 8)}`
              },
              unit_amount: order.total_cents
            }
          }
        ]
      });
    } catch (stripeErr) {
      // Stripe failed — release the consumed code and re-open the order so the
      // customer (and code) aren't left in a stuck state.
      if (consumedCodeId) {
        await supabase
          .from("discount_codes")
          .update({ used: false, redeemed_order_id: null, redeemed_at: null })
          .eq("id", consumedCodeId);
      }
      await supabase
        .from("orders")
        .update({ status: "draft", checkout_token: checkoutToken })
        .eq("id", order.id);
      throw stripeErr;
    }

    // Store the session ID now that Stripe has confirmed it
    const { error: sessionError } = await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    if (sessionError) {
      console.error(`[checkout] Failed to store session ID for order ${order.id}:`, sessionError.message);
    }

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "checkout_pending",
      note: "Stripe Checkout session created"
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session."
      },
      { status: 500 }
    );
  }
}
