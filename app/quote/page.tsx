import QuoteForm from "@/components/forms/quote-form";

export default function QuotePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
          Quote
        </p>
        <h1 className="text-3xl font-semibold md:text-5xl">
          Upload your model and configure the print.
        </h1>
      </div>

      <QuoteForm />
    </section>
  );
}
