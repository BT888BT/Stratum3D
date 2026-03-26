import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateItemQuote, sumQuote } from "@/lib/quote";
import { extractVolumeMm3 } from "@/lib/mesh-volume";
import { isAllowedFile, maxFileSizeBytes, fileItemSchema, orderContactSchema } from "@/lib/validation";
import { slugFileName } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // ── Parse contact/address ──────────────────────────────
    const contactParsed = orderContactSchema.safeParse({
      customerName: formData.get("customerName"),
      email: formData.get("email"),
      shippingAddressLine1: formData.get("shippingAddressLine1"),
      shippingAddressLine2: formData.get("shippingAddressLine2"),
      shippingCity: formData.get("shippingCity"),
      shippingState: formData.get("shippingState"),
      shippingPostcode: formData.get("shippingPostcode"),
      shippingCountry: formData.get("shippingCountry"),
    });

    if (!contactParsed.success) {
      return NextResponse.json(
        { error: "Invalid contact/address details.", details: contactParsed.error.flatten() },
        { status: 400 }
      );
    }
    const contact = contactParsed.data;

    // ── Collect files ──────────────────────────────────────
    const files = formData.getAll("files") as File[];
    if (!files.length) {
      return NextResponse.json({ error: "At least one STL file is required." }, { status: 400 });
    }

    // ── Per-file settings sent as JSON array ───────────────
    const itemSettingsRaw = formData.get("itemSettings");
    if (!itemSettingsRaw) {
      return NextResponse.json({ error: "Item settings are required." }, { status: 400 });
    }
    let rawItems: unknown[];
    try { rawItems = JSON.parse(itemSettingsRaw as string); }
    catch { return NextResponse.json({ error: "Invalid item settings format." }, { status: 400 }); }

    if (!Array.isArray(rawItems) || rawItems.length !== files.length) {
      return NextResponse.json({ error: "Item settings count must match file count." }, { status: 400 });
    }

    // ── Validate each file + settings ─────────────────────
    const itemResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!isAllowedFile(file.name)) {
        return NextResponse.json({ error: `File "${file.name}": invalid type. STL only.` }, { status: 400 });
      }
      if (file.size <= 0 || file.size > maxFileSizeBytes) {
        return NextResponse.json({ error: `File "${file.name}": exceeds 50 MB limit.` }, { status: 400 });
      }

      const settingsParsed = fileItemSchema.safeParse(rawItems[i]);
      if (!settingsParsed.success) {
        return NextResponse.json(
          { error: `File "${file.name}": invalid settings.`, details: settingsParsed.error.flatten() },
          { status: 400 }
        );
      }
      const settings = settingsParsed.data;

      let volumeMm3: number;
      try {
        volumeMm3 = await extractVolumeMm3(file);
        if (!isFinite(volumeMm3) || volumeMm3 <= 0) {
          return NextResponse.json(
            { error: `File "${file.name}": could not calculate volume. Ensure it is a valid closed mesh.` },
            { status: 422 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `File "${file.name}": failed to parse. Ensure it is a valid STL file.` },
          { status: 422 }
        );
      }

      itemResults.push({ file, settings, volumeMm3 });
    }

    // ── Calculate quote ────────────────────────────────────
    const itemQuotes = itemResults.map(({ file, settings, volumeMm3 }) =>
      calculateItemQuote(settings, volumeMm3, file.name)
    );
    const quote = sumQuote(itemQuotes);

    // ── Save order ─────────────────────────────────────────
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: contact.customerName,
        email: contact.email,
        phone: null,
        status: "draft",
        currency: "AUD",
        subtotal_cents: quote.subtotalCents,
        shipping_cents: quote.shippingCents,
        gst_cents: quote.gstCents,
        total_cents: quote.totalCents,
        shipping_address_line1: contact.shippingAddressLine1,
        shipping_address_line2: contact.shippingAddressLine2 || null,
        shipping_city: contact.shippingCity,
        shipping_state: contact.shippingState,
        shipping_postcode: contact.shippingPostcode,
        shipping_country: "AU",
      })
      .select()
      .single();

    if (orderError || !order) throw new Error(orderError?.message || "Failed to create order.");

    // ── Save each file + quote input ───────────────────────
    for (let i = 0; i < itemResults.length; i++) {
      const { file, settings } = itemResults[i];
      const itemQuote = itemQuotes[i];

      const fileExt = "stl";
      const safeName = slugFileName(file.name);
      const storagePath = `${order.id}/${Date.now()}-${i}-${safeName}.${fileExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("order-files")
        .upload(storagePath, fileBuffer, { contentType: "model/stl", upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      await supabase.from("order_files").insert({
        order_id: order.id,
        original_filename: file.name,
        storage_path: storagePath,
        mime_type: "model/stl",
        file_size_bytes: file.size,
        validation_status: "accepted",
      });

      await supabase.from("quote_inputs").insert({
        order_id: order.id,
        material: settings.material,
        colour: settings.colour,
        layer_height_mm: settings.layerHeightMm,
        infill_percent: settings.infillPercent,
        quantity: settings.quantity,
        bounding_box_x_mm: null,
        bounding_box_y_mm: null,
        bounding_box_z_mm: null,
        estimated_volume_cm3: itemQuote.solidVolumeCm3,
        estimated_print_time_minutes: itemQuote.estimatedPrintTimeMinutes,
        shipping_method: "standard",
      });
    }

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "draft",
      note: `Draft quote created — ${files.length} file(s)`,
    });

    return NextResponse.json({ orderId: order.id, ...quote });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quote." },
      { status: 500 }
    );
  }
}
