"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="message-page" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-display">WE COULDN&apos;T LOAD THIS PAGE</h1>
      <p>Please refresh and try again. If you were checking out, check your order status before retrying.</p>
      <div className="message-actions">
        <button type="button" className="btn-primary" onClick={reset}>Try again</button>
        <Link className="btn-ghost" href="/">Back to home</Link>
      </div>
    </main>
  );
}
