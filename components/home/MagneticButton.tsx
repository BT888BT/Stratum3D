"use client";

import Link from "next/link";
import { ReactNode, useRef } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
};

export default function MagneticButton({
  href,
  children,
  className,
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.setProperty("--tx", `${(x * strength).toFixed(2)}px`);
    el.style.setProperty("--ty", `${(y * strength).toFixed(2)}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", `0px`);
    el.style.setProperty("--ty", `0px`);
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={`magnetic-btn ${className ?? ""}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="magnetic-btn-inner">{children}</span>
      <span className="magnetic-btn-glow" aria-hidden />
    </Link>
  );
}
