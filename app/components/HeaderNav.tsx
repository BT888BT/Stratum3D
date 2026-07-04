"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header nav — admin pages get the admin controls in this slot; everyone else
// gets the public site nav. Same actions as before, just relocated for admin.
export default function HeaderNav() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/admin/settings" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Settings</Link>
        <Link href="/admin/gallery" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Gallery Management</Link>
        <Link href="/admin/reviews" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Reviews</Link>
        <Link href="/admin/colours" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Colour Management</Link>
        <Link href="/admin/discount-codes" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Discount Codes</Link>
        <Link href="/admin/campaigns" className="btn-ghost" style={{ fontSize: 12, color: "var(--orange)", borderColor: "var(--orange)" }}>Campaigns</Link>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="btn-ghost" style={{ fontSize: 12, background: "var(--orange)", borderColor: "var(--orange)", color: "#fff", fontWeight: 700 }}>Log out</button>
        </form>
      </nav>
    );
  }

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Link href="/gallery" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Gallery</Link>
      <Link href="/reviews" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Reviews</Link>
      <Link href="/guide" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Guide</Link>
      <Link href="/account" className="nav-link" style={{ textDecoration: "none" }}>Track Order</Link>
      <Link href="/quote" className="btn-primary" style={{ fontSize: 14, padding: "8px 20px", marginLeft: 6 }}>
        Get Quote
      </Link>
    </nav>
  );
}
