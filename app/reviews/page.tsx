"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Review = {
  id: string;
  firstName: string;
  body: string;
  createdAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data: Review[]) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "clamp(24px, 4vw, 40px)", textAlign: "center" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 0, lineHeight: 1 }}>REVIEWS</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)", marginBottom: 16 }}>
          What our customers say about their prints.
        </p>
        <Link href="/reviews/new" className="btn-primary" style={{ fontSize: 14, padding: "10px 24px" }}>
          Leave a review →
        </Link>
      </div>

      {!loaded ? (
        <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 40, opacity: 0.3 }}>💬</span>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No reviews yet — be the first to leave one.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "clamp(12px, 1.5vw, 20px)",
        }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 14.5, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>“{r.body}”</p>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{r.firstName}</div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginTop: 2 }}>
                  Verified order
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
