"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ReactNode, useRef } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
};

const MotionLink = motion(Link);

export default function MagneticButton({
  href,
  children,
  className,
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      ref={ref}
      href={href}
      className={`magnetic-btn ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="magnetic-btn-inner">{children}</span>
      <span className="magnetic-btn-glow" aria-hidden />
    </MotionLink>
  );
}
