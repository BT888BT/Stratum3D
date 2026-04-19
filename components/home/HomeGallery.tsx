"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type GalleryImage = {
  id: string;
  caption: string | null;
  url: string;
};

export default function HomeGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then((data: GalleryImage[]) => { setImages(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (images.length > 1) {
      timerRef.current = setInterval(() => {
        setSliding("left");
        setTimeout(() => {
          setCurrent(c => (c + 1) % images.length);
          setSliding(null);
        }, 420);
      }, 5000);
    }
  }, [images.length]);

  const goNext = useCallback(() => {
    if (sliding) return;
    setSliding("left");
    setTimeout(() => { setCurrent(c => (c + 1) % images.length); setSliding(null); }, 420);
    resetTimer();
  }, [images.length, resetTimer, sliding]);

  const goPrev = useCallback(() => {
    if (sliding) return;
    setSliding("right");
    setTimeout(() => { setCurrent(c => (c - 1 + images.length) % images.length); setSliding(null); }, 420);
    resetTimer();
  }, [images.length, resetTimer, sliding]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (!loaded || images.length === 0) return null;

  const getIndex = (offset: number) => (current + offset + images.length) % images.length;
  const prevImg = images.length > 1 ? images[getIndex(-1)] : null;
  const currImg = images[current];
  const nextImg = images.length > 1 ? images[getIndex(1)] : null;

  const slideTransform = sliding === "left"
    ? "translateX(-10%)"
    : sliding === "right"
    ? "translateX(10%)"
    : "translateX(0)";

  return (
    <section className="hg-section">
      {/* Section header */}
      <div className="hg-header">
        <div className="hg-header-left">
          <span className="hg-eyebrow">Recent prints from the shop</span>
          <h2 className="hg-heading">The work speaks.</h2>
        </div>
        <Link href="/gallery" className="hg-all-link">
          Full gallery <span className="btn-arrow">→</span>
        </Link>
      </div>

      {/* Carousel stage */}
      <div className="hg-stage">
        {/* Orange radial glow backdrop */}
        <div className="hg-glow" aria-hidden />

        {/* Slide strip */}
        <div
          className="hg-strip"
          style={{
            transform: slideTransform,
            transition: sliding ? "transform 0.42s cubic-bezier(0.2,0.8,0.2,1)" : "none",
          }}
        >
          {/* Prev thumbnail */}
          {prevImg && (
            <div
              className="hg-thumb hg-thumb-prev"
              onClick={goPrev}
              role="button"
              aria-label="Previous image"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && goPrev()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prevImg.url} alt="" className="hg-thumb-img" />
            </div>
          )}

          {/* Main image */}
          <div className="hg-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={currImg.id}
              src={currImg.url}
              alt={currImg.caption || "3D printed part"}
              className="hg-main-img"
            />
            {/* Gloss border highlight */}
            <div className="hg-main-border" aria-hidden />
            {/* Counter badge */}
            <div className="hg-counter" aria-label={`Image ${current + 1} of ${images.length}`}>
              {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
            {/* Caption */}
            {currImg.caption && (
              <div className="hg-caption">
                <p className="hg-caption-text">{currImg.caption}</p>
              </div>
            )}
          </div>

          {/* Next thumbnail */}
          {nextImg && (
            <div
              className="hg-thumb hg-thumb-next"
              onClick={goNext}
              role="button"
              aria-label="Next image"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && goNext()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nextImg.url} alt="" className="hg-thumb-img" />
            </div>
          )}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button className="hg-nav hg-nav-prev" onClick={goPrev} aria-label="Previous image">‹</button>
            <button className="hg-nav hg-nav-next" onClick={goNext} aria-label="Next image">›</button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="hg-dots" role="tablist" aria-label="Gallery navigation">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to image ${i + 1}`}
              className={`hg-dot${i === current ? " hg-dot-active" : ""}`}
              onClick={() => { setCurrent(i); resetTimer(); }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
