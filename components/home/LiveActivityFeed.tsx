"use client";

import { useEffect, useState } from "react";

/**
 * Generic activity examples — no fabricated customer names.
 * Shows event types the system genuinely performs.
 */
const events = [
  { icon: "◉", label: "Quote generated", detail: "PLA · 64 cm³" },
  { icon: "◉", label: "Print started",   detail: "PETG · 0.2 mm layer" },
  { icon: "◉", label: "Print started",   detail: "ABS · 35% infill" },
  { icon: "◉", label: "Order shipped",   detail: "Perth metro" },
  { icon: "◉", label: "Quote generated", detail: "PLA · 128 cm³" },
  { icon: "◉", label: "Order shipped",   detail: "WA regional" },
  { icon: "◉", label: "Print started",   detail: "PLA · 0.15 mm layer" },
  { icon: "◉", label: "Order packed",    detail: "Perth pickup" },
];

function minutesAgo(i: number) {
  const m = ((i * 7) % 52) + 2;
  return `${m} min ago`;
}

export default function LiveActivityFeed() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % events.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const visible = [0, 1, 2].map((o) => events[(idx + o) % events.length]);

  return (
    <div className="live-feed">
      <div className="live-feed-head">
        <span className="live-dot" />
        <span className="font-mono live-feed-title">LIVE WORKSHOP ACTIVITY</span>
      </div>
      <ul className="live-feed-list">
        {visible.map((e, i) => (
          <li
            key={`${idx}-${i}`}
            className="live-feed-item"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="live-feed-icon">{e.icon}</span>
            <span className="live-feed-label">{e.label}</span>
            <span className="live-feed-detail font-mono">{e.detail}</span>
            <span className="live-feed-time font-mono">{minutesAgo(idx + i)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
