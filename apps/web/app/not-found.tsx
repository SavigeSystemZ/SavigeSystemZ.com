import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        The page you requested does not exist or was moved.
      </p>
      <Link href="/" className="mt-8 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-500">
        Back to home
      </Link>
    </div>
  );
}
