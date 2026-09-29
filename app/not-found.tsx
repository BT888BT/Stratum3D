import Link from "next/link";

export default function NotFound() {
  return (
    <main className="message-page">
      <p className="eyebrow">404 · Page not found</p>
      <h1 className="font-display">THAT PAGE ISN&apos;T HERE</h1>
      <p>The address may have changed, or the page may have been removed.</p>
      <div className="message-actions">
        <Link className="btn-primary" href="/">Back to home</Link>
        <Link className="btn-ghost" href="/quote">Get a quote</Link>
      </div>
    </main>
  );
}
