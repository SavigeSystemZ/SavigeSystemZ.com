import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Versioned releases, checksums, and secure download flows.",
};

export default function DownloadsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Downloads and Releases</h1>
      <p className="mt-2 text-zinc-300">Versioned assets, checksums, and release history.</p>
      <div className="mt-6 rounded-lg border border-zinc-800 p-4">
        Immutable release artifacts and binary packages will be listed here.
      </div>
    </main>
  );
}
