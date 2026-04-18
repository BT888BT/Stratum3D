"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function StickyQuoteCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hideOnRoute =
    pathname?.startsWith("/quote") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login");

  useEffect(() => {
    if (hideOnRoute) { setVisible(false); return; }
    const onScroll = () => {
      const triggered = window.scrollY > 800;
      const nearBottom =
        window.innerHeight + window.scrollY >
        document.documentElement.scrollHeight - 400;
      setVisible(triggered && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnRoute]);

  if (hideOnRoute) return null;

  return (
    <div
      className={`sticky-cta ${visible ? "sticky-cta-show" : ""}`}
      aria-hidden={!visible}
    >
      <div className="sticky-cta-inner">
        <div className="sticky-cta-text">
          <span className="sticky-cta-title font-display">
            Ready to print?
          </span>
          <span className="sticky-cta-sub font-mono">
            INSTANT QUOTE · NO SIGN-UP NEEDED
          </span>
        </div>
        <Link href="/quote" className="sticky-cta-btn">
          Get Quote →
        </Link>
      </div>
    </div>
  );
}
