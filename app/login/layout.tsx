import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Login — Stratum3D",
  robots: { index: false, follow: false },
};

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  // Already signed in → skip the password form.
  if (await isAdminAuthed()) {
    redirect("/admin/orders");
  }
  return <>{children}</>;
}
