import { createAdminClient } from "@/lib/supabase/admin";
import { formatAud } from "@/lib/utils";
import { business } from "@/lib/business";
import { notFound } from "next/navigation";
import InvoiceActions from "./invoice-actions";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: order }, { data: quoteItems }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase
      .from("quote_inputs")
      .select("*")
      .eq("order_id", id)
      .order("original_filename"),
  ]);

  if (!order) notFound();

  const isTaxInvoice = business.gstRegistered;
  const docTitle = isTaxInvoice ? "Tax Invoice" : "Invoice";

  // Whether THIS order actually carries GST. Driven by the stored amount, not
  // the current registration flag, so historical orders that were charged GST
  // still reconcile (Subtotal + Shipping + GST = Total). New orders store 0.
  const hasGst = (order.gst_cents ?? 0) > 0;

  const invoiceNo = order.order_number
    ? `S3D-${String(order.order_number).padStart(4, "0")}`
    : order.id.slice(0, 8).toUpperCase();

  const issued = new Date(order.created_at).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isPickup =
    order.delivery_method === "pickup" ||
    (!order.delivery_method && order.shipping_cents === 500);

  // Billing address lines (only for shipped orders that recorded one)
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

  const items = quoteItems ?? [];
  const discountCents = order.discount_cents ?? 0;
  const isPaid = order.stripe_payment_intent_id != null;

  return (
    <>
      {/* Light, print-friendly styling scoped to this page. The admin theme is
          dark; we force white here and hide the toolbar when printing. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 16mm; }
        }
        .invoice-sheet { color-scheme: light; }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        <InvoiceActions orderId={order.id} />

        <div
          className="invoice-sheet"
          style={{
            background: "#ffffff",
            color: "#1a1a1a",
            border: "1px solid #e5e0da",
            borderRadius: 10,
            padding: "40px 44px",
            fontFamily:
              "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {/* Header: seller + document title */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
              borderBottom: "2px solid #1a1a1a",
              paddingBottom: 20,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "0.04em" }}>
                STRATUM<span style={{ color: "#f97316" }}>3D</span>
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                {business.legalName}
              </p>
              {business.abn ? (
                <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>
                  ABN {business.abn}
                </p>
              ) : isTaxInvoice ? (
                <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>
                  ⚠ ABN not set — add it in lib/business.ts
                </p>
              ) : null}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {docTitle}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "#555" }}>
                <strong style={{ color: "#1a1a1a" }}>Invoice no.</strong> {invoiceNo}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>
                <strong style={{ color: "#1a1a1a" }}>Date issued</strong> {issued}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 700, color: isPaid ? "#0a7c42" : "#c2590a" }}>
                {isPaid ? "PAID" : "UNPAID"}
              </p>
            </div>
          </div>

          {/* Bill to */}
          <div style={{ marginTop: 24 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Bill to
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 600 }}>{order.customer_name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#555" }}>{order.email}</p>
            {addressLines.map((line, i) => (
              <p key={i} style={{ margin: "2px 0 0", fontSize: 13, color: "#555" }}>{line}</p>
            ))}
            {isPickup && (
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#555" }}>Parcel locker pickup</p>
            )}
          </div>

          {/* Line items */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 28 }}>
            <thead>
              <tr>
                {["Description", "Qty", "Amount"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "0 0 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#a09890",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      textAlign: i === 0 ? "left" : i === 1 ? "center" : "right",
                      borderBottom: "1px solid #1a1a1a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((it) => {
                  const specs = [it.material, it.colour].filter(Boolean).join(" · ");
                  return (
                    <tr key={it.id}>
                      <td style={{ padding: "12px 0", borderBottom: "1px solid #f0ece6", verticalAlign: "top" }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{it.original_filename || "Print item"}</p>
                        {specs && (
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>{specs}</p>
                        )}
                      </td>
                      <td style={{ padding: "12px 0", borderBottom: "1px solid #f0ece6", textAlign: "center", verticalAlign: "top", color: "#555" }}>
                        {it.quantity ?? 1}
                      </td>
                      <td style={{ padding: "12px 0", borderBottom: "1px solid #f0ece6", textAlign: "right", verticalAlign: "top", fontWeight: 600 }}>
                        {it.line_total_cents != null ? formatAud(it.line_total_cents) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: "12px 0", borderBottom: "1px solid #f0ece6", color: "#888", fontSize: 13 }}>
                    3D printing services
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <table style={{ width: 280, borderCollapse: "collapse" }}>
              <tbody>
                <TotalRow label={hasGst ? "Subtotal (ex GST)" : "Subtotal"} value={formatAud(order.subtotal_cents)} />
                {discountCents > 0 && (
                  <TotalRow
                    label={order.discount_code ? `Discount (${order.discount_code})` : "Discount"}
                    value={`-${formatAud(discountCents)}`}
                  />
                )}
                <TotalRow
                  label={isPickup ? "Pickup" : "Shipping"}
                  value={formatAud(order.shipping_cents)}
                />
                {hasGst && <TotalRow label="GST (10%)" value={formatAud(order.gst_cents)} />}
                <tr>
                  <td colSpan={2} style={{ paddingTop: 8, borderTop: "2px solid #1a1a1a" }} />
                </tr>
                <tr>
                  <td style={{ padding: "6px 0", fontSize: 15, fontWeight: 800 }}>
                    {hasGst ? "Total (inc GST)" : "Total"}
                  </td>
                  <td style={{ padding: "6px 0", textAlign: "right", fontSize: 15, fontWeight: 800, color: "#f97316" }}>
                    {formatAud(order.total_cents)} {order.currency || "AUD"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 36, paddingTop: 16, borderTop: "1px solid #e5e0da" }}>
            {hasGst ? (
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                Total price includes GST. Thank you for your business.
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                Thank you for your business.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "4px 0", fontSize: 13, color: "#555" }}>{label}</td>
      <td style={{ padding: "4px 0", textAlign: "right", fontSize: 13, color: "#1a1a1a" }}>{value}</td>
    </tr>
  );
}
