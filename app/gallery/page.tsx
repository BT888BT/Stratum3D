"use client";

import { useState, useEffect } from "react";

type GalleryImage = {
  id: string;
  caption: string | null;
  name: string | null;
  material: string | null;
  category: string | null;
  blurData: string | null;
  url: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then((data: GalleryImage[]) => { setImages(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

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
        <h1 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 8 }}>GALLERY</h1>
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
        {images.map((img, i) => (
          <GalleryCard key={img.id} img={img} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}

function GalleryCard({ img, priority }: { img: GalleryImage; priority: boolean }) {
  const title = img.name || img.caption || "Untitled print";
  const specs = [
    ["Material", img.material],
    ["Category", img.category],
  ] as const;

  // Blur-up: the tiny inline placeholder (img.blurData) paints instantly with no
  // network request; the full image fades in over it once it finishes loading.
  const [loadedImg, setLoadedImg] = useState(false);

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // ref guards the cached-image race: a complete image may not fire onLoad
          ref={el => { if (el?.complete) setLoadedImg(true); }}
          onLoad={() => setLoadedImg(true)}
          style={{
            position: "relative", width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            opacity: loadedImg ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
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
