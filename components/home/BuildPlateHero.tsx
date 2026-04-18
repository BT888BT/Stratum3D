"use client";

import { useEffect, useRef, useState } from "react";

export default function BuildPlateHero() {
  const [layer, setLayer] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const LAYERS = 14;

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setLayer((l) => (l + 1) % (LAYERS + 6));
    };
    id = window.setInterval(tick, 320);
    return () => window.clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--plate-rx", `${(55 - y * 12).toFixed(2)}deg`);
    el.style.setProperty("--plate-rz", `${(-20 + x * 18).toFixed(2)}deg`);
  };

  const onLeave = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--plate-rx", `55deg`);
    el.style.setProperty("--plate-rz", `-20deg`);
  };

  return (
    <div
      ref={wrapRef}
      className="build-plate-wrap"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="build-plate-scene">
        <div className="build-plate-bed">
          <div className="build-plate-grid" />
          <div className="build-plate-scanline" />
          <div className="build-plate-axes">
            <span className="axis axis-x font-mono">X+</span>
            <span className="axis axis-y font-mono">Y+</span>
          </div>
        </div>

        <div className="build-stack">
          {Array.from({ length: LAYERS }).map((_, i) => {
            const visible = i < layer;
            const scale = 1 - Math.abs((i - LAYERS / 2) / LAYERS) * 0.35;
            return (
              <div
                key={i}
                className={`build-layer ${visible ? "build-layer-on" : ""}`}
                style={{
                  ["--lz" as string]: `${i * 6}px`,
                  ["--ls" as string]: scale.toFixed(3),
                  ["--ld" as string]: `${i * 40}ms`,
                }}
              />
            );
          })}
          <div
            className="build-nozzle"
            style={{
              ["--nz" as string]: `${Math.min(layer, LAYERS) * 6 + 18}px`,
            }}
          >
            <div className="build-nozzle-body" />
            <div className="build-nozzle-glow" />
          </div>
        </div>
      </div>

      <div className="build-hud">
        <div className="build-hud-row">
          <span className="font-mono hud-key">STATUS</span>
          <span className="font-mono hud-val hud-ok">● PRINTING</span>
        </div>
        <div className="build-hud-row">
          <span className="font-mono hud-key">LAYER</span>
          <span className="font-mono hud-val">
            {String(Math.min(layer, LAYERS)).padStart(3, "0")}/{String(LAYERS).padStart(3, "0")}
          </span>
        </div>
        <div className="build-hud-row">
          <span className="font-mono hud-key">NOZZLE</span>
          <span className="font-mono hud-val">215°C</span>
        </div>
      </div>
    </div>
  );
}
