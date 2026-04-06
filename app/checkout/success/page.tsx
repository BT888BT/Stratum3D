import Link from "next/link";
export default function CheckoutSuccessPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card-orange" style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: "clamp(32px,5vw,56px)" }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>✓</div>
        <span className="eyebrow" style={{ marginBottom: 12 }}>Order Confirmed</span>
        <h1 className="font-display" style={{ fontSize: "clamp(36px,5vw,52px)", marginBottom: 16 }}>PAYMENT SUCCESSFUL</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
          Your order is confirmed and payment received. You'll get email updates as your print progresses through production.
        </p>
        <Link href="/" className="btn-primary">Back to Home →</Link>
      </div>
    </div>
  );
}
