import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-8 py-12 md:grid-cols-2 md:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
          Stratum3D
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          Upload files, get a quote, place the order.
        </h1>
        <p className="max-w-xl text-base text-neutral-300 md:text-lg">
          A clean 3D print ordering flow with file upload, pricing, payment,
          and order tracking.
        </p>
        <div className="flex gap-4">
          <Link
            href="/quote"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            Start quote
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:bg-neutral-900"
          >
            View admin
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-sm text-neutral-400">Flow</p>
            <p className="mt-2 text-lg">
              Upload → Quote → Checkout → Paid Order
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-sm text-neutral-400">Version 1</p>
            <p className="mt-2 text-lg">
              Server-side pricing, Supabase storage, Stripe checkout
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
