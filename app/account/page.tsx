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

// The customer-facing progress journey. Terminal states (cancelled / refunded)
// are handled separately.
const STAGES = [
  { key: "order_received", label: "Order received" },
  { key: "paid", label: "Paid" },
  { key: "printing", label: "Printing" },
  { key: "order_shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
] as const;

// In-progress stage colour (distinct from the green "done" accent).
const YELLOW = "#facc15";

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
  const currentIndex = STAGES.findIndex((s) => s.key === result.status);

  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>Order</p>
          <p className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>
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
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {STAGES.map((stage, i) => {
              const isCompleted = result.status === "completed";
              const done = isCompleted || (currentIndex >= 0 && i < currentIndex);
              const active = !isCompleted && i === currentIndex;
              const reached = done || active;
              const isLast = i === STAGES.length - 1;
              // Connector to the LEFT is filled once we've reached this node;
              // connector to the RIGHT is filled once we've moved past it.
              const leftFilled = isCompleted || (currentIndex >= 0 && i <= currentIndex);
              const rightFilled = done;

              const dotColor = done ? "var(--accent)" : active ? YELLOW : "var(--bg2)";
              const dotBorder = done ? "var(--accent)" : active ? YELLOW : "var(--border-hi)";

              return (
                <div key={stage.key} style={{
                  flex: 1, position: "relative",
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  {/* Connecting status line (behind the dot) */}
                  {i > 0 && (
                    <div style={{
                      position: "absolute", top: 12, left: 0, right: "50%", height: 3,
                      background: leftFilled ? "var(--accent)" : "var(--border)",
                    }} />
                  )}
                  {!isLast && (
                    <div style={{
                      position: "absolute", top: 12, left: "50%", right: 0, height: 3,
                      background: rightFilled ? "var(--accent)" : "var(--border)",
                    }} />
                  )}

                  {/* Dot */}
                  <div style={{
                    position: "relative", zIndex: 1,
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: dotColor,
                    border: `2px solid ${dotBorder}`,
                    boxShadow: active ? `0 0 0 4px ${YELLOW}33` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Label */}
                  <p style={{
                    marginTop: 8, fontSize: 11, lineHeight: 1.25, textAlign: "center",
                    padding: "0 2px",
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
                <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
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
