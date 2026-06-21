import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stratum3D — Affordable 3D Printing in Perth | Fast Local FDM Service",
  description: "Perth's affordable 3D printing service. Print in PLA, PETG & ABS — upload your STL for an instant quote and fast local turnaround. Pickup in Perth or shipping Australia-wide.",
  keywords: "3D printing Perth, 3D print service Perth, affordable 3D printing, FDM printing Perth, PLA printing Perth, hobby 3D printing Australia, 3D printing service Western Australia, custom 3D prints Perth, STL printing, local 3D printing, cheap 3D printing Perth",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Stratum3D — Affordable 3D Printing in Perth",
    description: "Perth's affordable 3D printing in PLA, PETG & ABS. Upload your STL → instant quote → fast local turnaround.",
    url: "https://www.stratum3d.com.au",
    siteName: "Stratum3D",
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://www.stratum3d.com.au",
  },
};

// Structured data for Google — LocalBusiness + 3D printing service
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Stratum3D",
  description: "Affordable local 3D printing service in Perth, Western Australia. FDM printing in PLA, PETG & ABS for hobbyists, makers and small projects.",
  url: "https://www.stratum3d.com.au",
  areaServed: {
    "@type": "State",
    name: "Western Australia",
    containedInPlace: { "@type": "Country", name: "Australia" },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Perth",
    addressRegion: "WA",
    addressCountry: "AU",
  },
  logo: {
    "@type": "ImageObject",
    url: "https://www.stratum3d.com.au/logo.png",
    width: 512,
    height: 512,
  },
  priceRange: "$",
  serviceType: ["3D Printing", "FDM Printing", "Rapid Prototyping", "Custom 3D Prints"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "3D Printing Materials",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "PLA 3D Printing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "PETG 3D Printing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "ABS 3D Printing" } },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="geo.region" content="AU-WA" />
        <meta name="geo.placename" content="Perth" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

          {/* Announce bar — scrolls away naturally; marquee on phones (see globals.css) */}
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

          {/* Header */}
          <header style={{
            borderBottom: "1px solid var(--border)",
            background: "rgba(14,10,6,0.9)",
            backdropFilter: "blur(16px)",
            position: "sticky", top: 0, zIndex: 50
          }}>
            <div style={{
              maxWidth: 1200, margin: "0 auto",
              padding: "0 clamp(16px, 4vw, 32px)",
              height: 60,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Stratum3D logo" width={32} height={32} style={{ display: "block" }} />
                <span className="font-display" style={{ fontSize: 22, color: "var(--text)", letterSpacing: "0.06em" }}>
                  STRATUM<span style={{ color: "var(--orange)" }}>3D</span>
                </span>
              </Link>

              <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Link href="/gallery" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Gallery</Link>
                <Link href="/guide" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Guide</Link>
                <Link href="/account" className="nav-link" style={{ textDecoration: "none" }}>Track Order</Link>
                <Link href="/quote" className="btn-primary" style={{ fontSize: 14, padding: "8px 20px", marginLeft: 6 }}>
                  Get Quote
                </Link>
              </nav>
            </div>
          </header>

          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)" }}>
            {children}
          </main>

          <footer style={{ borderTop: "1px solid var(--border)", padding: "20px clamp(16px, 4vw, 32px)" }}>
            <div style={{
              maxWidth: 1200, margin: "0 auto",
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between", gap: 16
            }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em" }}>
                © {new Date().getFullYear()} STRATUM3D · PERTH, WA
              </span>
              <div style={{ display: "flex", gap: 20 }}>
                <Link href="/privacy" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>Privacy</Link>
                <Link href="/terms" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>Terms</Link>
              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}
