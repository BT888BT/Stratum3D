import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function generateSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode("stratum3d-admin-session"));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin login page and login API are public
  if (pathname === "/login" || pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const sessionCookie = request.cookies.get("stratum3d_admin")?.value;
  const expectedToken = await generateSessionToken(expected);

  if (sessionCookie === expectedToken) {
    return NextResponse.next();
  }

  // API routes get a 401 JSON response, pages get redirected
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
