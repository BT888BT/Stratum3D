"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { DecoType } from "@/lib/campaigns";

// Light decorative overlay for the active campaign. Purely cosmetic:
//  • fixed full-screen layer, pointer-events:none, aria-hidden — never intercepts
//    clicks and is invisible to assistive tech,
//  • hidden on /admin,
//  • CSS honours prefers-reduced-motion (particles freeze/hide), and
//  • `neon` sale themes pass count 0, so nothing renders — the announce bar glow
//    carries those, keeping the busiest pages fast.
const GLYPH: Record<DecoType, string> = {
  snow: "❄",
  spark: "✦",
  heart: "♥",
  egg: "🥚",
  dot: "●",
  bat: "🦇",
  neon: "",
};

const RISERS: DecoType[] = ["heart", "dot"]; // float up; everything else falls

export default function HolidayDecor({ deco, count }: { deco: DecoType; count: number }) {
  const pathname = usePathname();

  // Randomised per mount — decorative only, no need for stability across renders.
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 9 + Math.random() * 9,
        size: 10 + Math.random() * 14,
        drift: Math.random() * 40 - 20,
        opacity: 0.35 + Math.random() * 0.4,
      })),
    [count]
  );

  if (pathname?.startsWith("/admin")) return null;
  if (count <= 0 || !GLYPH[deco]) return null;

  const rising = RISERS.includes(deco);

  return (
    <div className="holiday-decor" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={rising ? "decor-particle decor-rise" : "decor-particle decor-fall"}
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // custom prop consumed by the keyframes for a little horizontal sway
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          {GLYPH[deco]}
        </span>
      ))}
    </div>
  );
}
