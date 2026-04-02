"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-red-400">Error</p>
          <h1 className="mt-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
