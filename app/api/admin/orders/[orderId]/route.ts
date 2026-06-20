import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { orderId } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, order_number, stripe_payment_intent_id")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isPaid = order.stripe_payment_intent_id != null || order.status === "refunded";
  if (isPaid) {
    return NextResponse.json(
      { error: "Cannot delete a paid or refunded order." },
      { status: 403 }
    );
  }

  // Delete files from storage first
  const { data: files } = await supabase
    .from("order_files")
    .select("storage_path")
    .eq("order_id", orderId);

  if (files?.length) {
    const paths = files.map(f => f.storage_path);
    await supabase.storage.from("order-files").remove(paths);
  }

  // Cascade delete handles related rows
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
