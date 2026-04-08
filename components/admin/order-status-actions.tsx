"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { label: "Order Received",  status: "order_received", color: "var(--accent)" },
  { label: "Printing",        status: "printing",        color: "var(--amber)" },
  { label: "Order Shipped",   status: "order_shipped",   color: "var(--green)" },
  { label: "Completed",       status: "completed",       color: "var(--green)" },
] as const;

const LOCKED_DELETE = ["paid", "refunded"];

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [emailResult, setEmailResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

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
      setEmailResult(data.emailSent ? "Email sent to customer." : "Status updated.");
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

  const isLocked = LOCKED_DELETE.includes(currentStatus);
  const isRefunded = currentStatus === "refunded";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Note */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Note (optional — sent to customer)</span>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="input-field"
          style={{ resize: "vertical", minHeight: 64, fontSize: 13 }}
          placeholder="e.g. Your order is in the print queue..."
        />
      </label>

      {/* Status buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ACTIONS.map(action => {
          const isCurrent = currentStatus === action.status;
          return (
            <button
              key={action.status}
              onClick={() => updateStatus(action.status)}
              disabled={loading !== null || isCurrent || isRefunded}
              style={{
                background: isCurrent ? `${action.color}15` : "transparent",
                border: `1px solid ${action.color}${isCurrent ? "44" : "22"}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: action.color,
                fontSize: 13,
                cursor: isCurrent || isRefunded ? "default" : "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: loading !== null ? 0.5 : isCurrent ? 0.7 : isRefunded ? 0.35 : 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isCurrent && !isRefunded && loading === null) e.currentTarget.style.background = `${action.color}11`; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
            >
              <span>
                {loading === action.status ? "Updating..." : isCurrent ? `● ${action.label}` : `Mark as ${action.label}`}
              </span>
              {!isCurrent && <span style={{ opacity: 0.4 }}>→</span>}
            </button>
          );
        })}
      </div>

      {emailResult && (
        <div style={{
          fontSize: 12, padding: "8px 12px", borderRadius: 6,
          background: "rgba(0,229,160,0.08)", color: "var(--green)",
          border: "1px solid rgba(0,229,160,0.2)",
        }}>
          {emailResult}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <hr className="divider" />

      {/* Delete */}
      <div>
        <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Danger Zone</p>
        {isLocked ? (
          <div style={{ fontSize: 12, color: "var(--muted)", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8 }}>
            Order is locked — cannot be deleted once payment has been received or a refund issued.
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
          <div style={{ padding: "12px 14px", border: "1px solid rgba(255,90,90,0.3)", borderRadius: 8, background: "rgba(255,90,90,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>Delete this order?</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Permanently removes the order and all uploaded files.</p>
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
