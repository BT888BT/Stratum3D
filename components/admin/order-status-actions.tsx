"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAud } from "@/lib/utils";

// Statuses that represent the payment/quote pipeline
const PAYMENT_STATUSES = ["draft", "checkout_pending", "paid"] as const;

// Production actions available after payment
const PRODUCTION_ACTIONS = [
  { label: "Mark as Printing",      status: "printing",      color: "var(--amber)" },
  { label: "Mark as Order Ready",   status: "order_ready",   color: "var(--green)" },
  { label: "Mark as Pickup Ready",  status: "pickup_ready",  color: "var(--orange)" },
  { label: "Mark as Completed",     status: "completed",     color: "var(--green)" },
  { label: "Mark as Cancelled",     status: "cancelled",     color: "var(--red)" },
] as const;

const PAYMENT_LABEL: Record<string, string> = {
  draft:            "Quote",
  checkout_pending: "Payment Required",
  paid:             "Paid",
};

const LOCKED_DELETE = ["paid", "printing", "order_ready", "pickup_ready", "completed"];

export default function OrderStatusActions({
  orderId,
  currentStatus,
  stripePaymentIntentId,
  totalCents,
}: {
  orderId: string;
  currentStatus: string;
  stripePaymentIntentId?: string | null;
  totalCents?: number;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [emailResult, setEmailResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const router = useRouter();

  const isPaid = PAYMENT_STATUSES.includes(currentStatus as typeof PAYMENT_STATUSES[number])
    ? currentStatus === "paid"
    : true; // any production status means payment was confirmed

  const paymentStatus = PAYMENT_STATUSES.includes(currentStatus as typeof PAYMENT_STATUSES[number])
    ? currentStatus
    : "paid";

  const isLocked = LOCKED_DELETE.includes(currentStatus);

  async function updateStatus(status: string) {
    try {
      setLoading(status);
      setError("");
      setEmailResult(null);
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");

      if (data.emailSent) {
        setEmailResult(`Email sent to customer.`);
      } else if (data.emailError) {
        setEmailResult(`Updated — email failed: ${data.emailError}`);
      } else {
        setEmailResult("Status updated.");
      }
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setLoading(null);
    }
  }

  async function deleteOrder() {
    try {
      setLoading("delete");
      setError("");
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setLoading(null);
      setShowDeleteConfirm(false);
    }
  }

  async function issueRefund() {
    try {
      setLoading("refund");
      setError("");
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed.");
      setEmailResult(`Refund issued${data.amountCents ? ` (${formatAud(data.amountCents)})` : ""}. Order marked as cancelled.`);
      setShowRefundConfirm(false);
      setRefundReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Section 1: Payment Status ─────────────────── */}
      <div>
        <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Payment</p>
        <div style={{ display: "flex", gap: 6 }}>
          {PAYMENT_STATUSES.map((s) => {
            const isActive = paymentStatus === s;
            const isReached = PAYMENT_STATUSES.indexOf(s) <= PAYMENT_STATUSES.indexOf(paymentStatus as typeof PAYMENT_STATUSES[number]);
            const color = s === "paid" ? "var(--green)" : s === "checkout_pending" ? "var(--amber)" : "var(--text-dim)";
            return (
              <div
                key={s}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  textAlign: "center",
                  border: `1px solid ${isActive ? color : isReached ? `${color}44` : "var(--border)"}`,
                  background: isActive ? `${color}18` : "transparent",
                  opacity: isReached ? 1 : 0.4,
                }}
              >
                <p style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? color : "var(--text-dim)" }}>
                  {s === "paid" && isActive ? "✓ PAID" : PAYMENT_LABEL[s]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Always-visible PAID badge when order has been paid */}
        {isPaid && !PAYMENT_STATUSES.includes(currentStatus as typeof PAYMENT_STATUSES[number]) && (
          <div style={{
            marginTop: 8,
            padding: "6px 12px",
            borderRadius: 6,
            background: "rgba(0,229,160,0.1)",
            border: "1px solid rgba(0,229,160,0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>✓ PAID</span>
          </div>
        )}
      </div>

      <hr className="divider" />

      {/* ── Section 2: Production Status ─────────────────── */}
      <div>
        <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Production</p>

        <div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Note (optional — sent to customer)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field"
              style={{ resize: "vertical", minHeight: 64, fontSize: 13 }}
              placeholder="e.g. Your print is queued for tomorrow morning..."
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRODUCTION_ACTIONS.map((action) => {
              const isCurrentStatus = currentStatus === action.status;
              return (
                <button
                  key={action.status}
                  onClick={() => updateStatus(action.status)}
                  disabled={loading !== null || isCurrentStatus}
                  style={{
                    background: isCurrentStatus ? `${action.color}15` : "transparent",
                    border: `1px solid ${action.color}${isCurrentStatus ? "44" : "22"}`,
                    borderRadius: 8,
                    padding: "9px 14px",
                    color: action.color,
                    fontSize: 13,
                    cursor: isCurrentStatus ? "default" : "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                    opacity: loading !== null ? 0.5 : isCurrentStatus ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={e => { if (!isCurrentStatus && loading === null) e.currentTarget.style.background = `${action.color}11`; }}
                  onMouseLeave={e => { if (!isCurrentStatus) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>
                    {loading === action.status ? "Updating..." : isCurrentStatus ? `● ${action.label.replace("Mark as ", "")}` : action.label}
                  </span>
                  {!isCurrentStatus && <span style={{ opacity: 0.4 }}>→</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {emailResult && (
        <div style={{
          fontSize: 12,
          padding: "8px 12px",
          borderRadius: 6,
          background: emailResult.includes("failed") ? "rgba(255,90,90,0.08)" : "rgba(0,229,160,0.08)",
          color: emailResult.includes("failed") ? "var(--red)" : "var(--green)",
          border: `1px solid ${emailResult.includes("failed") ? "rgba(255,90,90,0.2)" : "rgba(0,229,160,0.2)"}`,
        }}>
          {emailResult}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <hr className="divider" />

      {/* ── Refund ─────────────────────────────────────────── */}
      {stripePaymentIntentId && (
        <div>
          <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Stripe Refund</p>
          {!showRefundConfirm ? (
            <button
              onClick={() => setShowRefundConfirm(true)}
              disabled={loading !== null}
              style={{
                width: "100%", padding: "9px 14px", borderRadius: 8, fontSize: 13,
                border: "1px solid rgba(255,90,90,0.3)", background: "transparent",
                color: "var(--red)", cursor: "pointer", textAlign: "left",
              }}
            >
              Issue Full Refund via Stripe →
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: "1px solid rgba(255,90,90,0.3)", borderRadius: 8, background: "rgba(255,90,90,0.05)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>
                Refund {totalCents ? formatAud(totalCents) : "full amount"}?
              </p>
              <p style={{ fontSize: 12, color: "var(--text-dim)" }}>This will immediately refund the customer via Stripe and cancel the order.</p>
              <input
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                className="input-field"
                placeholder="Reason (optional)"
                style={{ fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={issueRefund}
                  disabled={loading !== null}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 13, border: "none", background: "var(--red)", color: "white", cursor: loading ? "default" : "pointer" }}
                >
                  {loading === "refund" ? "Processing..." : "Confirm Refund"}
                </button>
                <button
                  onClick={() => { setShowRefundConfirm(false); setRefundReason(""); }}
                  disabled={loading !== null}
                  style={{ padding: "8px 12px", borderRadius: 6, fontSize: 13, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <hr className="divider" />

      {/* ── Delete Order ────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Danger Zone</p>
        {isLocked ? (
          <div style={{ fontSize: 12, color: "var(--muted)", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8 }}>
            🔒 This order is locked and cannot be deleted.
            {currentStatus === "paid" || currentStatus === "printing" || currentStatus === "order_ready" || currentStatus === "pickup_ready"
              ? " Issue a refund to cancel it."
              : ""}
          </div>
        ) : !showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading !== null}
            style={{
              width: "100%", padding: "9px 14px", borderRadius: 8, fontSize: 13,
              border: "1px solid rgba(255,90,90,0.3)", background: "transparent",
              color: "var(--red)", cursor: "pointer", textAlign: "left",
            }}
          >
            Delete Order →
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", border: "1px solid rgba(255,90,90,0.3)", borderRadius: 8, background: "rgba(255,90,90,0.05)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>Delete this order?</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>This permanently removes the order and all associated files.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={deleteOrder}
                disabled={loading !== null}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 13, border: "none", background: "var(--red)", color: "white", cursor: loading ? "default" : "pointer" }}
              >
                {loading === "delete" ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading !== null}
                style={{ padding: "8px 12px", borderRadius: 6, fontSize: 13, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
