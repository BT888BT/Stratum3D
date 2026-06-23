"use client";

import { usePathname } from "next/navigation";

// Announce bar — scrolls away naturally; marquee on phones (see globals.css).
// Hidden on admin pages.
export default function AnnounceBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="announce-bar">
      <div className="announce-track">
        <span className="font-mono announce-item" style={{ fontSize: 11, color: "var(--text)", letterSpacing: "0.13em", textTransform: "uppercase" }}>
          Perth-based&nbsp;·&nbsp;Transparent volume pricing&nbsp;·&nbsp;No minimum order&nbsp;·&nbsp;Ships Australia-wide
        </span>
        <span className="font-mono announce-item announce-dup" aria-hidden="true" style={{ fontSize: 11, color: "var(--text)", letterSpacing: "0.13em", textTransform: "uppercase" }}>
          Perth-based&nbsp;·&nbsp;Transparent volume pricing&nbsp;·&nbsp;No minimum order&nbsp;·&nbsp;Ships Australia-wide
        </span>
      </div>
    </div>
  );
}
