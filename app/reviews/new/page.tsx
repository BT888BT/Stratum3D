"use client";

import { useState } from "react";
import Link from "next/link";

const MAX_LENGTH = 100;

export default function NewReviewPage() {
  // step: "write" → fill out the form, "done" → submitted
  const [step, setStep] = useState<"write" | "done">("write");
  const [orderNumber, setOrderNumber] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!orderNumber.trim()) {
      setError("Please enter your order code.");
      return;
    }
    if (!text) {
      setError("Your review can't be empty.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, body: text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Couldn't save your review.");
      } else {
        setStep("done");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  const remaining = MAX_LENGTH - body.length;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: "clamp(20px, 4vw, 32px)", textAlign: "center" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(30px, 4.5vw, 48px)", marginBottom: 4, lineHeight: 1 }}>
          LEAVE A REVIEW
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)" }}>
          Enter your order code to leave a verified review.
        </p>
      </div>

      {step === "write" && (
        <form onSubmit={submitReview} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="orderNumber" className="eyebrow">Order code</label>
            <input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. S3D-0001"
              autoComplete="off"
              className="input-field"
              required
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="body" className="eyebrow">Your review</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="How was your print?"
              maxLength={MAX_LENGTH}
              rows={4}
              className="input-field"
              style={{ resize: "vertical", minHeight: 90, fontFamily: "inherit" }}
              required
            />
            <p style={{ fontSize: 12, color: remaining <= 10 ? "var(--orange)" : "var(--muted)", margin: 0, textAlign: "right" }}>
              {remaining} characters left
            </p>
          </div>
          {error && <div className="error-box">{error}</div>}
          <button type="submit" className="btn-primary" disabled={busy || !orderNumber.trim() || !body.trim()} style={{ marginTop: 4 }}>
            {busy ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 40 }}>🙏</span>
          <h2 className="font-display" style={{ fontSize: 24, margin: 0 }}>Thank you for reviewing!</h2>
          <Link href="/" className="btn-ghost" style={{ marginTop: 4 }}>
            Back to home
          </Link>
        </div>
      )}
    </div>
  );
}
