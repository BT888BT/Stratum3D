import "./globals.css";
import Link from "next/link";
import AnnounceBar from "./components/AnnounceBar";
import HeaderNav from "./components/HeaderNav";
import type { Metadata } from "next";
import { Manrope, Bebas_Neue, IBM_Plex_Mono } from "next/font/google";

// Self-hosted via next/font — fonts are downloaded at build time and served
// from our own origin, removing the render-blocking request to fonts.googleapis.com.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

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
    url: "https://www.stratum3d.com.au/logo.webp",
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
    <html lang="en" className={`${manrope.variable} ${bebasNeue.variable} ${ibmPlexMono.variable}`}>
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

          <AnnounceBar />

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
                <img src="/logo.webp" alt="Stratum3D logo" width={32} height={32} style={{ display: "block" }} />
                <span className="font-display" style={{ fontSize: 22, color: "var(--text)", letterSpacing: "0.06em" }}>
                  STRATUM<span style={{ color: "var(--orange)" }}>3D</span>
                </span>
              </Link>

              <HeaderNav />
            </div>
          </header>

          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)" }}>
            {children}
          </main>

          <footer style={{ borderTop: "1px solid var(--border)", padding: "20px clamp(16px, 4vw, 32px)" }}>
            <div style={{
              maxWidth: 1200, margin: "0 auto",
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "center", gap: 16
            }}>
              <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em" }}>
                © {new Date().getFullYear()} STRATUM3D · PERTH, WA
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Link href="/privacy" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>Privacy</Link>
                <Link href="/terms" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>Terms</Link>

                {/* Social icons — not linked yet */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Instagram */}
                  <svg
                    width={18} height={18} viewBox="0 0 24 24" fill="none"
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    aria-label="Instagram" role="img"
                  >
                    <defs>
                      <linearGradient id="ig-gradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#FEDA75" />
                        <stop offset="0.25" stopColor="#FA7E1E" />
                        <stop offset="0.5" stopColor="#D62976" />
                        <stop offset="0.75" stopColor="#962FBF" />
                        <stop offset="1" stopColor="#4F5BD5" />
                      </linearGradient>
                    </defs>
                    <g stroke="url(#ig-gradient)">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </g>
                  </svg>

                  {/* TikTok */}
                  <svg
                    width={18} height={18} viewBox="0 0 24 24" fill="none"
                    aria-label="TikTok" role="img"
                  >
                    <path
                      fill="#25F4EE"
                      d="M18.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-2.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 4 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.12z"
                    />
                    <path
                      fill="#FE2C55"
                      d="M20.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-1.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 6 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.12z"
                    />
                    <path
                      fill="#000000"
                      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.12z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}
