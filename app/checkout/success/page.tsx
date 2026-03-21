import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
      <h1 className="text-3xl font-semibold">Payment successful</h1>
      <p className="mt-4 text-neutral-300">
        Your order has been received. We will review the file and proceed with
        production.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black"
      >
        Back to home
      </Link>
    </section>
  );
}
