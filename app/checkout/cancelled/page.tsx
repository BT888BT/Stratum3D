import Link from "next/link";
export default function CheckoutCancelledPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: "clamp(32px,5vw,56px)", borderColor: "var(--border-hi)" }}>
        <div style={{ fontSize: 52, marginBottom: 20, opacity: 0.3 }}>✕</div>
        <span className="eyebrow" style={{ marginBottom: 12, color: "var(--red)" }}>Cancelled</span>
        <h1 className="font-display" style={{ fontSize: "clamp(36px,5vw,52px)", marginBottom: 16 }}>ORDER NOT COMPLETED</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
          Payment was cancelled. You can start a new quote anytime.
        </p>
        <Link href="/quote" className="btn-primary">Return to Quote →</Link>
      </div>
    </div>
  );
}
