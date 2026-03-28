"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { label: "Mark as Printing", status: "printing", color: "var(--amber)" },
  { label: "Mark as Completed", status: "completed", color: "var(--green)" },
  { label: "Mark as Cancelled", status: "cancelled", color: "var(--red)" },
] as const;

export default function OrderStatusActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [emailResult, setEmailResult] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  async function updateStatus(status: string) {
    try {
      setLoading(status);
      setError("");
      setEmailResult(null);
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, note: note || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");

      // Show email feedback
      if (data.emailSent) {
        setEmailResult("Customer email sent successfully.");
      } else if (data.emailError) {
        setEmailResult(`Status updated but email failed: ${data.emailError}`);
      } else {
        setEmailResult("Status updated (no email for this status).");
      }

      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setLoading(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Note (optional — sent to customer)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field"
            style={{ resize: "vertical", minHeight: 72, fontSize: 13 }}
            placeholder="e.g. Your print is queued for tomorrow morning..."
          />
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ACTIONS.map((action) => {
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
                padding: "10px 16px",
                color: action.color,
                fontSize: 13,
                cursor: isCurrentStatus ? "default" : "pointer",
                textAlign: "left",
                transition: "background 0.15s",
                opacity: loading !== null ? 0.5 : isCurrentStatus ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
              onMouseEnter={e => { if (!isCurrentStatus) e.currentTarget.style.background = `${action.color}11`; }}
              onMouseLeave={e => { if (!isCurrentStatus) e.currentTarget.style.background = "transparent"; }}
            >
              <span>
                {loading === action.status
                  ? "Updating..."
                  : isCurrentStatus
                  ? `● Currently ${action.status}`
                  : action.label}
              </span>
              {!isCurrentStatus && <span style={{ opacity: 0.4 }}>→</span>}
            </button>
          );
        })}
      </div>

      {emailResult && (
        <div style={{
          fontSize: 12,
          padding: "8px 12px",
          borderRadius: 6,
          background: emailResult.includes("failed")
            ? "rgba(255,90,90,0.08)"
            : "rgba(0,229,160,0.08)",
          color: emailResult.includes("failed")
            ? "var(--red)"
            : "var(--green)",
          border: `1px solid ${emailResult.includes("failed") ? "rgba(255,90,90,0.2)" : "rgba(0,229,160,0.2)"}`,
        }}>
          {emailResult}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <hr className="divider" />

      <button onClick={logout} className="btn-danger" style={{ fontSize: 12, padding: "8px 16px" }}>
        Log out
      </button>
    </div>
  );
}
