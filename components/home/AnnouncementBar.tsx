"use client";

import { useEffect, useState } from "react";

const messages = [
  "FAST LOCAL PERTH TURNAROUND · MOST ORDERS SHIP IN 2–4 BUSINESS DAYS",
  "FREE LOCAL PICKUP IN PERTH · SHIPPING AUSTRALIA-WIDE",
  "INSTANT VOLUMETRIC QUOTES · NO HIDDEN FEES",
  "REPRINT PROMISE · IF WE DROP THE BALL, WE FIX IT",
];

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="announcement-bar" role="banner" aria-label="Announcements">
      <div className="announcement-inner">
        <span className="announcement-dot" aria-hidden />
        <div className="announcement-text-wrap">
          {messages.map((m, i) => (
            <span
              key={i}
              className={`announcement-msg ${i === idx ? "is-active" : ""}`}
            >
              {m}
            </span>
          ))}
        </div>
        <span className="announcement-dot" aria-hidden />
      </div>
    </div>
  );
}
