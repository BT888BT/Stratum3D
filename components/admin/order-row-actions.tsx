"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LOCKED_STATUSES = ["paid", "printing", "order_ready", "pickup_ready", "completed"];

export default function OrderRowActions({ orderId, status }: { orderId: string; status: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const locked = LOCKED_STATUSES.includes(status);

  if (locked) {
    return (
      <span title="Locked — order has been paid" style={{ fontSize: 16, opacity: 0.4, cursor: "default" }}>🔒</span>
    );
  }

  if (confirm) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={async () => {
            setLoading(true);
            await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
            router.refresh();
          }}
          disabled={loading}
          style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, border: "none", background: "var(--red)", color: "white", cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer" }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="Delete order"
      style={{ fontSize: 14, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "2px 4px", borderRadius: 4 }}
    >
      ✕
    </button>
  );
}
