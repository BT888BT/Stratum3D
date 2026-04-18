"use client";

import { ReactNode } from "react";

type Props = {
  items: ReactNode[];
  speed?: number; // seconds per loop
  reverse?: boolean;
};

export default function Marquee({ items, speed = 40, reverse = false }: Props) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div
        className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
