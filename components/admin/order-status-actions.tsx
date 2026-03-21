"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const actions = [
  { label: "Mark printing", status: "printing" },
  { label: "Mark completed", status: "completed" },
  { label: "Mark cancelled", status: "cancelled" }
] as const;

export default function OrderStatusActions({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function updateStatus(status: string) {
    try {
      setLoading(status);
      setError("");

      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          status
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setLoading(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-xl font-semibold">Admin actions</h2>

      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.status}
            onClick={() => updateStatus(action.status)}
            disabled={loading !== null}
            className="rounded-2xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading === action.status ? "Updating..." : action.label}
          </button>
        ))}

        <button
          onClick={logout}
          className="rounded-2xl border border-red-900 px-4 py-2 text-sm text-red-200 hover:bg-red-950/40"
        >
          Log out
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
