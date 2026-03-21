import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through — otherwise we get an infinite redirect loop
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("stratum3d_admin")?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessionCookie === expected) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"]
};
