import { redirect } from "next/navigation";

// /admin → orders dashboard. Signed-out visitors never reach this: the
// middleware and admin layout send them to /login first.
export default function AdminIndex() {
  redirect("/admin/orders");
}
