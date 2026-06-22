"use client";

import Link from "next/link";

/**
 * Toolbar shown above the invoice in the admin UI. Hidden when printing
 * (see the `.no-print` rule in the invoice page) so it never lands on the PDF.
 */
export default function InvoiceActions({ orderId }: { orderId: string }) {
  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      <Link
        href={`/admin/orders/${orderId}`}
        style={{ fontSize: 13, color: "#888", textDecoration: "none" }}
      >
        ← Back to order
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          background: "#0e0a06",
          border: "none",
          borderRadius: 6,
          padding: "8px 18px",
          cursor: "pointer",
        }}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
