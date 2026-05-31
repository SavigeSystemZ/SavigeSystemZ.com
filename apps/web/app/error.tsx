"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Root error boundary for the App Router. Renders **inside** RootLayout —
 * must NOT include `<html>` / `<body>`. The standalone `app/global-error.tsx`
 * sibling handles errors that escape the root layout itself.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the dev console; production logs flow through the platform.
    console.error("[app/error] unhandled boundary", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-red-300">Error</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">Something went wrong</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        We caught the problem and prevented further damage. You can retry or head back home.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-slate-500">ref: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-cyan-300/60 bg-cyan-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-500/20"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 hover:border-white/30"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
