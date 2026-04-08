import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Statuses that lock an order from deletion (paid orders are protected)
const LOCKED_STATUSES = ["paid", "printing", "order_ready", "pickup_ready", "completed"];

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
    .select("id, status, order_number")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (LOCKED_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: `Cannot delete a ${order.status} order. Issue a refund first if payment was taken.` },
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
