import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.orderId || session.client_reference_id || null;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null
          })
          .eq("id", orderId);

        await supabase.from("order_status_history").insert({
          order_id: orderId,
          status: "paid",
          note: "Stripe payment completed"
        });
      }
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
