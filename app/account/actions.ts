"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidLogin } from "@/lib/mock-data";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

export type LoginState = { error?: string };

const COOKIE_OPTS = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { error: "Enter both your email and order code." };
  }
  if (!isValidLogin(email, code)) {
    return { error: "That email and order code don't match an order. Check both and try again." };
  }

  const token = createSessionToken(email);
  (await cookies()).set(SESSION_COOKIE, token, COOKIE_OPTS);
  redirect("/account");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/account");
}
