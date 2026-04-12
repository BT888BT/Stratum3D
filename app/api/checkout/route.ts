import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
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

    // Nullify checkout_token so it can't be reused
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        status: "checkout_pending",
        checkout_token: null,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new Error(updateError.message);
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
