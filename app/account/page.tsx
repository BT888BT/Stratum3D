"use client";

import { useState } from "react";
import { formatAud } from "@/lib/utils";

type LookupResult = {
  orderNumber: number;
  reference: string;
  status: string;
  createdAt: string;
  deliveryMethod: "pickup" | "shipping";
  items: {
    material: string | null;
    colour: string | null;
    infillPercent: number | null;
    quantity: number | null;
    lineTotalCents: number | null;
  }[];
  totals: {
    subtotalCents: number | null;
    gstCents: number | null;
    shippingCents: number | null;
    totalCents: number | null;
  };
  history: { status: string; at: string }[];
};

// The customer-facing progress journey, in real lifecycle order. Pre-payment
// states (draft / checkout_pending) and terminal states (cancelled / refunded)
// are handled separately below.
const STAGES = [
  { key: "pending_approval", label: "Under review" },
  { key: "order_received", label: "Confirmed" },
  { key: "printing", label: "Printing" },
  { key: "order_shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
] as const;

// Resolves a raw order status to its index on the STAGES journey above.
// Includes legacy "paid" (maps to the confirmed stage) so older orders still
// render a progress line rather than going all-grey.
const STATUS_STAGE_INDEX: Record<string, number> = {
  pending_approval: 0,
  order_received: 1,
  paid: 1,
  printing: 2,
  order_shipped: 3,
  completed: 4,
};

// In-progress stage colour (distinct from the green "done" accent).
const YELLOW = "#facc15";
// "Done" / accent colour, scoped locally to this page so the rest of the app
// (incl. admin) is unaffected.
const GREEN = "#00e5a0";

function prettyStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "clamp(24px, 4vw, 36px)" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(30px, 4.5vw, 48px)", marginBottom: 0, lineHeight: 1 }}>
          TRACK ORDER
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)" }}>
          Enter your email and order number to see the status of your print.
        </p>
      </div>

      {/* Lookup form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="email" className="eyebrow">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="orderNumber" className="eyebrow">Order number</label>
          <input
            id="orderNumber"
            type="text"
            required
            inputMode="numeric"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="S3D-0001"
            className="input-field"
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>{error}</p>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Checking…" : "Track order"}
        </button>
      </form>

      {result && <OrderResult result={result} />}
    </div>
  );
}

function OrderResult({ result }: { result: LookupResult }) {
  const isTerminal = result.status === "cancelled" || result.status === "refunded";
  // Pre-payment states haven't entered the progress journey yet.
  const isPrePayment = result.status === "draft" || result.status === "checkout_pending";
  const currentIndex = STATUS_STAGE_INDEX[result.status] ?? -1;

  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>Order</p>
          <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>
            {result.reference}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            Placed {new Date(result.createdAt).toLocaleDateString("en-AU", { dateStyle: "long" })}
          </p>
        </div>
        <span className={`badge badge-${result.status}`}>{prettyStatus(result.status)}</span>
      </div>

      {/* Progress timeline */}
      <div className="card">
        <p className="eyebrow" style={{ marginBottom: 18 }}>Progress</p>

        {isTerminal ? (
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: "var(--red-dim)", border: "1px solid #7f1d1d",
          }}>
            <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>
              This order has been {result.status}.
            </p>
          </div>
        ) : isPrePayment ? (
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: "var(--surface)", border: "1px solid var(--border)",
          }}>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
              Awaiting payment — your order will start tracking once checkout is complete.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            {STAGES.map((stage, i) => {
              const isCompleted = result.status === "completed";
              const done = isCompleted || (currentIndex >= 0 && i < currentIndex);
              const active = !isCompleted && i === currentIndex;
              const reached = done || active;

              const lineColor = done ? GREEN : active ? YELLOW : "var(--border)";

              return (
                <div key={stage.key} style={{
                  flex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                }}>
                  {/* Status line for this stage */}
                  <div style={{
                    width: "100%", height: 5, borderRadius: 3,
                    background: lineColor,
                    boxShadow: active ? `0 0 0 3px ${YELLOW}26` : "none",
                  }} />

                  {/* Label */}
                  <p style={{
                    fontSize: 11, lineHeight: 1.25, textAlign: "center", padding: "0 2px",
                    fontWeight: active ? 700 : 500,
                    color: active ? YELLOW : reached ? "var(--text)" : "var(--muted)",
                  }}>
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}
      {result.items.length > 0 && (
        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            Items — {result.items.length} print{result.items.length !== 1 ? "s" : ""}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.items.map((item, idx) => (
              <div key={idx} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 12, padding: "10px 12px",
                border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--orange)", flexShrink: 0 }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[item.material, item.colour].filter(Boolean).join(" · ") || "Custom print"}
                    {item.infillPercent != null ? ` · ${item.infillPercent}% infill` : ""}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-dim)", flexShrink: 0 }}>
                  ×{item.quantity ?? 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <p className="eyebrow" style={{ marginBottom: 14 }}>Summary</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <SummaryRow label="Delivery" value={result.deliveryMethod === "pickup" ? "Parcel locker pickup" : "Shipping — Australia Post"} />
          {result.totals.subtotalCents != null && <SummaryRow label="Subtotal" value={formatAud(result.totals.subtotalCents)} />}
          {result.totals.gstCents != null && <SummaryRow label="GST (10%)" value={formatAud(result.totals.gstCents)} />}
          {result.totals.shippingCents != null && (
            <SummaryRow
              label="Shipping"
              value={result.totals.shippingCents === 500 ? "Pickup ($5.00)" : formatAud(result.totals.shippingCents)}
            />
          )}
          {result.totals.totalCents != null && (
            <>
              <hr className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="font-display" style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: GREEN }}>
                  {formatAud(result.totals.totalCents)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}
