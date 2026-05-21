import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stratum3d_admin")?.value;

  if (token) {
    await revokeSession(token);
  }

  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.stratum3d.com.au"));

  response.cookies.set("stratum3d_admin", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
