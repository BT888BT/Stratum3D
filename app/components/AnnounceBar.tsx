"use client";

import { usePathname } from "next/navigation";

// Announce bar — scrolls away naturally; marquee on phones (see globals.css).
// Hidden on admin pages.
//
// When a seasonal campaign is active the layout passes its message + promo code
// through; the bar's colours come from `data-campaign` on <html> (globals.css),
// so this component just swaps the copy. No campaign → default site copy.
//
// `sale` (neon events — EOFY / mid-year / Black Friday) amplifies the strip: a
// pulsing SALE badge, an accent-coloured promo chip and a stronger glow (styled
// off `.is-sale` in globals.css) so it clearly reads as a live deal.
type CampaignBar = { message: string; promoCode: string | null; sale?: boolean };

const DEFAULT_COPY =
  "Perth-based · Transparent volume pricing · No minimum order · Ships Australia-wide";

export default function AnnounceBar({ campaign }: { campaign?: CampaignBar | null }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const text = campaign?.message ?? DEFAULT_COPY;
  const promo = campaign?.promoCode?.trim() || null;
  const sale = campaign?.sale ?? false;

  const content = (
    <>
      {sale && <span className="announce-sale-badge">Sale</span>}
      <span>{text}</span>
      {promo && (
        <>
          {"  "}
          <span className="announce-promo">
            <span className="announce-promo-label">Code</span>
            <span className="announce-promo-code">{promo}</span>
          </span>
        </>
      )}
    </>
  );

  const itemStyle = {
    fontSize: 11,
    letterSpacing: "0.13em",
    textTransform: "uppercase" as const,
  };

  return (
    <div className={`announce-bar${sale ? " is-sale" : ""}`}>
      <div className="announce-track">
        <span className="font-mono announce-item" style={itemStyle}>
          {content}
        </span>
        <span className="font-mono announce-item announce-dup" aria-hidden="true" style={itemStyle}>
          {content}
        </span>
      </div>
    </div>
  );
}
