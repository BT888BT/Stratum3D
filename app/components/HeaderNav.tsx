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
      <nav className="admin-header-nav" aria-label="Admin navigation">
        <Link href="/admin/orders" className="btn-ghost admin-primary-link">Orders</Link>
        <Link href="/admin/settings" className="btn-ghost admin-primary-link">Settings</Link>
        <Link href="/admin/gallery" className="btn-ghost admin-secondary-link">Gallery Management</Link>
        <Link href="/admin/reviews" className="btn-ghost admin-secondary-link">Reviews</Link>
        <Link href="/admin/colours" className="btn-ghost admin-secondary-link">Colour Management</Link>
        <Link href="/admin/discount-codes" className="btn-ghost admin-secondary-link">Discount Codes</Link>
        <Link href="/admin/campaigns" className="btn-ghost admin-secondary-link">Campaigns</Link>
        <form action="/api/admin/logout" method="POST" className="admin-logout-form">
          <button type="submit" className="btn-ghost">Log out</button>
        </form>
      </nav>
    );
  }

  return (
    <nav className="public-header-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Link href="/gallery" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Gallery</Link>
      <Link href="/reviews" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Reviews</Link>
      <Link href="/guide" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Guide</Link>
      <Link href="/account" className="nav-link" style={{ textDecoration: "none" }}>Track Order</Link>
      <Link href="/quote" className="btn-primary" style={{ fontSize: 15, padding: "10px 22px", marginLeft: 6 }}>
        Get Quote
      </Link>
    </nav>
  );
}
