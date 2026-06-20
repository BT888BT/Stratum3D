"use client";

import { useEffect, useState } from "react";
import { ORDER_FEED } from "@/lib/mock-data";

// Subtle "someone just ordered" social proof. Appears bottom-left,
// cycles slowly, and can be dismissed for the session. Deliberately
// understated — no countdowns, no fake urgency, no flashing.

export default function OrderToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("s3d_toast_off")) {
      setDismissed(true);
      return;
    }

    let i = 0;
    // First one appears after a calm delay.
    const start = setTimeout(function show() {
      setIndex(i % ORDER_FEED.length);
      setVisible(true);
      // Visible for 5s, then hide for 9s, then advance.
      setTimeout(() => setVisible(false), 5000);
      i += 1;
      schedule();
    }, 4500);

    let loop: ReturnType<typeof setTimeout>;
    function schedule() {
      loop = setTimeout(() => {
        setIndex(i % ORDER_FEED.length);
        setVisible(true);
        setTimeout(() => setVisible(false), 5000);
        i += 1;
        schedule();
      }, 14000);
    }

    return () => {
      clearTimeout(start);
      clearTimeout(loop);
    };
  }, []);

  if (dismissed) return null;

  const item = ORDER_FEED[index];

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        left: "clamp(12px, 3vw, 24px)",
        bottom: "clamp(12px, 3vw, 24px)",
        zIndex: 60,
        maxWidth: 290,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          background: "rgba(20,15,8,0.96)",
          border: "1px solid var(--border-hi)",
          borderRadius: 12,
          padding: "12px 14px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: 8,
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" stroke="var(--orange)" strokeWidth="1.5" fill="rgba(249,115,22,0.12)" />
            <circle cx="16" cy="16" r="3" fill="var(--orange)" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 700 }}>{item.name}</strong> in {item.suburb} ordered a {item.item}
          </div>
          <div className="font-mono" style={{ fontSize: 9.5, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 3, textTransform: "uppercase" }}>
            {item.material} · {item.minsAgo} min ago
          </div>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
            try { sessionStorage.setItem("s3d_toast_off", "1"); } catch {}
          }}
          aria-label="Dismiss"
          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
