"use client";

import { useEffect, useState } from "react";

export default function ScrollPrintRail() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? (doc.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-rail" aria-hidden>
      <div className="scroll-rail-track" />
      <div className="scroll-rail-fill" style={{ width: `${pct}%` }} />
      <div
        className="scroll-rail-head"
        style={{ left: `calc(${pct}% - 6px)` }}
      >
        <div className="scroll-rail-nozzle" />
      </div>
      <div className="scroll-rail-pct font-mono">
        {pct.toFixed(0).padStart(3, "0")}%
      </div>
    </div>
  );
}
