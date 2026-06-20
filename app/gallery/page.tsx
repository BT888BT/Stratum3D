"use client";

import { useState, useEffect, useRef } from "react";

type GalleryImage = {
  id: string;
  caption: string | null;
  name: string | null;
  material: string | null;
  category: string | null;
  blurData: string | null;
  previewUrl: string | null;
  url: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Three-tier progressive load:
  //   1. blur placeholder paints instantly (inline)
  //   2. low-quality previews load fast for EVERY image — the grid looks "done"
  //   3. only once all previews are in do we start swapping in high quality
  const [previewsLoaded, setPreviewsLoaded] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then((data: GalleryImage[]) => { setImages(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Safety net: if some previews stall/fail, start high quality anyway.
  useEffect(() => {
    if (!loaded || images.length === 0) return;
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [loaded, images.length]);

  const startHigh = images.length > 0 && (previewsLoaded >= images.length || timedOut);

  if (!loaded) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 40, opacity: 0.3 }}>📷</span>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No images in the gallery yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "clamp(24px, 4vw, 40px)", textAlign: "center" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 0, lineHeight: 1 }}>GALLERY</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)" }}>
          A selection of recent prints from our workshop.
        </p>
      </div>

      {/* 4-wide responsive grid — collapses to fewer columns on narrow screens */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "clamp(12px, 1.5vw, 20px)",
      }}>
        {images.map(img => (
          <GalleryCard
            key={img.id}
            img={img}
            startHigh={startHigh}
            onPreviewLoad={() => setPreviewsLoaded(c => c + 1)}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryCard({ img, startHigh, onPreviewLoad }: {
  img: GalleryImage;
  startHigh: boolean;
  onPreviewLoad: () => void;
}) {
  const title = img.name || img.caption || "Untitled print";
  const specs = [
    ["Material", img.material],
    ["Category", img.category],
  ] as const;

  const [previewShown, setPreviewShown] = useState(false);
  const [highShown, setHighShown] = useState(false);
  const notified = useRef(false);

  // Count this preview towards the page-level gate exactly once (whether it
  // loaded, was cached, or errored — so the gate can't get stuck).
  function markPreview() {
    setPreviewShown(true);
    if (notified.current) return;
    notified.current = true;
    onPreviewLoad();
  }

  // Tier 2 source: the real low-quality preview, or the high image if this row
  // has no preview (older/pre-migration rows).
  const previewSrc = img.previewUrl || img.url;
  // Only do a separate high-quality swap when a distinct preview actually exists.
  const hasHighSwap = !!img.previewUrl;

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "var(--bg2)" }}>
        {/* Tier 1 — instant inline blur */}
        {img.blurData && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.blurData}
            alt=""
            aria-hidden
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              filter: "blur(12px)", transform: "scale(1.1)",
            }}
          />
        )}

        {/* Tier 2 — low-quality preview, loaded eagerly for every image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewSrc}
          alt={title}
          loading="eager"
          decoding="async"
          ref={el => { if (el?.complete) markPreview(); }}
          onLoad={markPreview}
          onError={markPreview}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            opacity: previewShown ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Tier 3 — high quality, only begins loading once all previews are in */}
        {hasHighSwap && startHigh && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            onLoad={() => setHighShown(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              opacity: highShown ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />
        )}
      </div>

      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{
          margin: 0, fontSize: 14, color: "var(--text)", fontWeight: 600, lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={title}>
          {title}
        </p>

        <div style={{ display: "grid", gap: 5 }}>
          {specs.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>
                {label}
              </span>
              <span style={{
                fontSize: 12, color: value ? "var(--text-dim)" : "var(--muted)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "70%", textAlign: "right",
              }} title={value || undefined}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
