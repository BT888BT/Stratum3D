import { redirect } from "next/navigation";

// Common typo for /admin/orders.
export default function AdminOrderRedirect() {
  redirect("/admin/orders");
}
