"use client";

import { useEffect, useState } from "react";

// Home-page hero tile: a thin-line cube in the site accent colour that slowly
// rotates and floats. Layer lines run around its sides; lines on the far side
// are drawn faint and dashed. Purely decorative — no claims about live jobs.
// Stays still for visitors who prefer reduced motion.

const CX = 200;
const CY = 190;
const SIZE = 92;              // half the cube's edge, in px
const PITCH = (26 * Math.PI) / 180; // camera looks down on the cube by this much
const LAYERS = 12;
const SPIN_DEG_PER_S = 14;
const START_DEG = 45;         // server render / reduced-motion angle

type V3 = [number, number, number];
type Pt = [number, number];

const VERTS: V3[] = [
  [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],   // bottom 0-3
  [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1],       // top 4-7
];

// Faces: outward normal + the edges (vertex pairs) that bound them.
const SIDES: { n: V3; a: [number, number, number, number] }[] = [
  { n: [0, 0, -1], a: [0, 1, 5, 4] },
  { n: [1, 0, 0],  a: [1, 2, 6, 5] },
  { n: [0, 0, 1],  a: [2, 3, 7, 6] },
  { n: [-1, 0, 0], a: [3, 0, 4, 7] },
];
const TOP = { n: [0, 1, 0] as V3, a: [4, 5, 6, 7] };
const BOTTOM = { n: [0, -1, 0] as V3, a: [0, 1, 2, 3] };

const f = (n: number) => n.toFixed(1);

function makeView(deg: number) {
  const t = (deg * Math.PI) / 180;
  const ct = Math.cos(t), st = Math.sin(t), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const rot = ([x, y, z]: V3): V3 => {
    const x1 = x * ct + z * st;
    const z1 = -x * st + z * ct;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  };
  const proj = (v: V3): Pt => {
    const [x, y] = rot(v);
    return [CX + x * SIZE, CY - y * SIZE];
  };
  const facing = (n: V3) => rot(n)[2] > 0.001;
  return { proj, facing };
}

function seg(a: Pt, b: Pt) {
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
}

function buildFrame(deg: number) {
  const { proj, facing } = makeView(deg);
  const front: string[] = [];
  const back: string[] = [];
  const edgesFront: string[] = [];
  const edgesBack: string[] = [];

  // Layer lines on each side face.
  for (const s of SIDES) {
    const [i0, i1] = s.a;
    const vis = facing(s.n);
    for (let k = 1; k <= LAYERS; k++) {
      const y = -1 + (2 * k) / (LAYERS + 1);
      const a = VERTS[i0], b = VERTS[i1];
      const d = seg(proj([a[0], y, a[2]]), proj([b[0], y, b[2]]));
      (vis ? front : back).push(d);
    }
  }

  // Cube edges: visible if any face that owns them faces the camera.
  const faces = [...SIDES, TOP, BOTTOM];
  const seen = new Set<string>();
  for (const face of faces) {
    for (let e = 0; e < 4; e++) {
      const i = face.a[e], j = face.a[(e + 1) % 4];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const owners = faces.filter((g) => g.a.includes(i) && g.a.includes(j));
      const d = seg(proj(VERTS[i]), proj(VERTS[j]));
      (owners.some((g) => facing(g.n)) ? edgesFront : edgesBack).push(d);
    }
  }

  return { front: front.join(""), back: back.join(""), edgesFront: edgesFront.join(""), edgesBack: edgesBack.join("") };
}

export default function HeroTile() {
  const [deg, setDeg] = useState(START_DEG);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setDeg(START_DEG + ((now - start) / 1000) * SPIN_DEG_PER_S);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const frame = buildFrame(deg);

  return (
    <div className="hero-tile">
      <svg className="hero-tile-svg" viewBox="0 0 400 400" role="img" aria-label="Line illustration of a layered cube">
        <ellipse className="hero-tile-shadow" cx={CX} cy="362" rx="110" ry="12" />
        <g className="hero-tile-float">
          <path className="hero-tile-back" d={frame.back} />
          <path className="hero-tile-edge-back" d={frame.edgesBack} />
          <path className="hero-tile-layers" d={frame.front} />
          <path className="hero-tile-edge" d={frame.edgesFront} />
        </g>
      </svg>
    </div>
  );
}
