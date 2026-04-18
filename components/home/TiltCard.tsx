"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { CSSProperties, ReactNode, useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
};

export default function TiltCard({ children, className, style, max = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.5 };
  const sx = useSpring(mx, springConfig);
  const sy = useSpring(my, springConfig);

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const sheenX = useTransform(sx, (v) => `${v * 100}%`);
  const sheenY = useTransform(sy, (v) => `${v * 100}%`);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className ?? ""}`}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="tilt-card-inner">{children}</div>
      <motion.div
        className="tilt-card-sheen"
        style={{ ["--mx" as string]: sheenX, ["--my" as string]: sheenY } as CSSProperties}
        aria-hidden
      />
    </motion.div>
  );
}
