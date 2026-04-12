import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderContactSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildRateLimitKey } from "@/lib/trusted-ip";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Rate limit: 20 updates per 15 minutes per IP
    const rateLimitKey = await buildRateLimitKey("update-contact", request);
    const { allowed } = await checkRateLimit(rateLimitKey, 20, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { orderId, checkoutToken, ...rest } = body as Record<string, unknown>;

    if (!orderId || !checkoutToken) {
      return NextResponse.json({ error: "orderId and checkoutToken are required." }, { status: 400 });
    }

    // Validate contact/address using the same schema as the quote route
    const parsed = orderContactSchema.safeParse({
      customerName: rest.customerName,
      email: rest.email,
      shippingMethod: rest.shippingMethod,
      shippingAddressLine1: rest.shippingAddressLine1,
      shippingAddressLine2: rest.shippingAddressLine2,
      shippingCity: rest.shippingCity,
      shippingState: rest.shippingState,
      shippingPostcode: rest.shippingPostcode,
      shippingCountry: "AU",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = parsed.data;

    // Enforce required address fields for shipping
    if (contact.shippingMethod === "shipping") {
      if (!contact.shippingAddressLine1 || contact.shippingAddressLine1.trim().length < 3) {
        return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
      }
      if (!contact.shippingCity || !contact.shippingState || !contact.shippingPostcode) {
        return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
      }
      if (!/^\d{4}$/.test(contact.shippingPostcode)) {
        return NextResponse.json({ error: "Must be a 4-digit Australian postcode." }, { status: 400 });
      }
    }

    const supabase = createAdminClient();

    // Verify order exists, token matches, and is still a draft
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, checkout_token")
      .eq("id", orderId)
      .eq("checkout_token", checkoutToken)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found or invalid token." }, { status: 404 });
    }

    if (order.status !== "draft") {
      return NextResponse.json({ error: "Order has already been submitted." }, { status: 400 });
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      customer_name: contact.customerName.trim(),
      email: contact.email.trim().toLowerCase(),
    };

    if (contact.shippingMethod === "shipping") {
      updateData.shipping_address_line1 = contact.shippingAddressLine1;
      updateData.shipping_address_line2 = contact.shippingAddressLine2 || null;
      updateData.shipping_city = contact.shippingCity;
      updateData.shipping_state = contact.shippingState;
      updateData.shipping_postcode = contact.shippingPostcode;
      updateData.shipping_country = "AU";
    } else {
      // Pickup — clear any address fields
      updateData.shipping_address_line1 = null;
      updateData.shipping_address_line2 = null;
      updateData.shipping_city = null;
      updateData.shipping_state = null;
      updateData.shipping_postcode = null;
      updateData.shipping_country = "AU";
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[update-contact]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update contact details." },
      { status: 500 }
    );
  }
}
