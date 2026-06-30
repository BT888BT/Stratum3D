"use client";

import { useState, useEffect } from "react";

type Review = {
  id: string;
  order_number: number | null;
  first_name: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function orderLabel(n: number | null) {
  return n ? `S3D-${String(n).padStart(4, "0")}` : "—";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/reviews");
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, action: "approve" | "reject" | "delete") {
    if (action === "delete" && !confirm("Delete this review permanently?")) return;
    setBusy(id);
    setError("");
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Action failed.");
    } else {
      await load();
    }
    setBusy(null);
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const others = reviews.filter((r) => r.status !== "pending");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Dashboard</p>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Reviews</h1>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading...</p>
      ) : (
        <>
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="eyebrow">Pending approval ({pending.length})</p>
            {pending.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Nothing waiting for approval.</p>
            ) : (
              pending.map((r) => (
                <ReviewRow key={r.id} r={r} busy={busy === r.id} onAct={act} />
              ))
            )}
          </section>

          {others.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p className="eyebrow">Approved & rejected</p>
              {others.map((r) => (
                <ReviewRow key={r.id} r={r} busy={busy === r.id} onAct={act} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ReviewRow({ r, busy, onAct }: {
  r: Review;
  busy: boolean;
  onAct: (id: string, action: "approve" | "reject" | "delete") => void;
}) {
  return (
    <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{r.first_name}</span>
          <span className={`badge badge-${r.status === "approved" ? "completed" : r.status === "rejected" ? "cancelled" : "pending_approval"}`}>
            {r.status}
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{orderLabel(r.order_number)}</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: 0 }}>“{r.body}”</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {r.status !== "approved" && (
          <button className="btn-ghost" disabled={busy} onClick={() => onAct(r.id, "approve")} style={{ fontSize: 12 }}>Approve</button>
        )}
        {r.status !== "rejected" && (
          <button className="btn-ghost" disabled={busy} onClick={() => onAct(r.id, "reject")} style={{ fontSize: 12 }}>Reject</button>
        )}
        <button className="btn-danger" disabled={busy} onClick={() => onAct(r.id, "delete")} style={{ fontSize: 12 }}>Delete</button>
      </div>
    </div>
  );
}
