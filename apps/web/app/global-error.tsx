"use client";

import { useEffect } from "react";

/**
 * Catches errors in the RootLayout itself. Must define its own `<html>` /
 * `<body>` because RootLayout has been torn down by the time this renders.
 * For nested errors that surface inside a working layout, see
 * `app/error.tsx`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] root boundary", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-red-300">Critical error</p>
          <h1 className="mt-3 text-2xl font-semibold">The site failed to load</h1>
          <p className="mt-3 text-sm text-zinc-400">
            The root layout itself errored. Reload to recover; if the problem persists, the issue
            has already been logged.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-zinc-500">ref: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-500"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
