import type { GalleryPiece } from "@/lib/mock-data";

// On-brand generated artwork for each gallery piece — no photo assets needed.
// Each shape is drawn as a layered, printed-looking silhouette tinted with the
// piece's colour over the dark studio background.

export default function GalleryArt({ piece, height = 180 }: { piece: GalleryPiece; height?: number }) {
  const c = piece.colour;
  return (
    <div
      style={{
        height,
        position: "relative",
        background: `radial-gradient(120% 120% at 50% 0%, ${hexA(c, 0.16)} 0%, var(--bg2) 60%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* build-plate grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(180deg, transparent 30%, #000 100%)",
        }}
      />
      <svg width="120" height={Math.min(120, height - 40)} viewBox="0 0 120 120" style={{ position: "relative" }}>
        {renderShape(piece.shape, c)}
      </svg>
    </div>
  );
}

function renderShape(shape: GalleryPiece["shape"], c: string) {
  const stroke = c;
  const fill = hexA(c, 0.18);
  const common = { stroke, strokeWidth: 1.6, fill };
  switch (shape) {
    case "bust":
      return (
        <g {...common}>
          <path d="M40 110 Q40 60 60 50 Q80 60 80 110 Z" />
          <circle cx="60" cy="38" r="20" />
        </g>
      );
    case "case":
      return (
        <g {...common}>
          <rect x="28" y="40" width="64" height="46" rx="4" />
          <rect x="38" y="52" width="20" height="8" rx="2" opacity={0.7} />
          <rect x="64" y="52" width="16" height="8" rx="2" opacity={0.7} />
          <rect x="38" y="66" width="42" height="6" rx="2" opacity={0.5} />
        </g>
      );
    case "mech":
      return (
        <g {...common}>
          <polygon points="60,18 96,40 96,80 60,102 24,80 24,40" />
          <circle cx="60" cy="60" r="14" fill="none" />
          <circle cx="60" cy="60" r="5" />
        </g>
      );
    case "vase":
      return (
        <g {...common}>
          <path d="M44 30 Q40 60 50 78 Q44 96 60 102 Q76 96 70 78 Q80 60 76 30 Z" />
          <path d="M48 40 Q60 50 72 40" fill="none" opacity={0.5} />
          <path d="M48 54 Q60 64 72 54" fill="none" opacity={0.5} />
        </g>
      );
    case "mount":
      return (
        <g {...common}>
          <rect x="34" y="46" width="52" height="28" rx="4" />
          <rect x="52" y="30" width="16" height="18" rx="3" />
          <circle cx="44" cy="82" r="5" />
          <circle cx="76" cy="82" r="5" />
        </g>
      );
    case "mini":
    default:
      return (
        <g {...common}>
          <polygon points="60,22 70,46 60,58 50,46" />
          <path d="M50 46 L36 92 L60 78 L84 92 L70 46" />
          <rect x="50" y="92" width="20" height="8" rx="2" opacity={0.6} />
        </g>
      );
  }
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
