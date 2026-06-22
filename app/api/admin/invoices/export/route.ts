import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Wrap a value for CSV: quote it and escape embedded quotes. */
function csv(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** cents → plain dollars string e.g. 12345 → "123.45" (no symbol, for spreadsheets) */
function dollars(cents: number | null | undefined): string {
  return ((cents ?? 0) / 100).toFixed(2);
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // YYYY-MM-DD (optional)
  const to = searchParams.get("to"); // YYYY-MM-DD (optional)

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*")
    .not("status", "in", '("draft","checkout_pending")')
    .order("order_number", { ascending: true });

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const { data: orders, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // GST column is always present so every row reconciles
  // (Subtotal − Discount + Shipping + GST = Total). It's simply 0.00 for orders
  // placed while the business is not registered for GST.
  const header = [
    "Invoice No",
    "Date Issued",
    "Customer",
    "Email",
    "Status",
    "Paid",
    "Subtotal",
    "Discount",
    "Shipping",
    "GST",
    "Total",
    "Currency",
  ];

  const rows = (orders ?? []).map((o) => {
    const invoiceNo = o.order_number
      ? `S3D-${String(o.order_number).padStart(4, "0")}`
      : o.id.slice(0, 8).toUpperCase();
    const issued = new Date(o.created_at).toLocaleDateString("en-AU");
    const paid = o.stripe_payment_intent_id ? "Paid" : "Unpaid";

    return [
      csv(invoiceNo),
      csv(issued),
      csv(o.customer_name),
      csv(o.email),
      csv(o.status),
      csv(paid),
      csv(dollars(o.subtotal_cents)),
      csv(dollars(o.discount_cents)),
      csv(dollars(o.shipping_cents)),
      csv(dollars(o.gst_cents)),
      csv(dollars(o.total_cents)),
      csv(o.currency || "AUD"),
    ].join(",");
  });

  const body = [header.map(csv).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stratum3d-invoices-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
