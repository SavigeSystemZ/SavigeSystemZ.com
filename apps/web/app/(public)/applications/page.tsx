import type { Metadata } from "next";
import Link from "next/link";
import { appCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Applications",
  description: "Browse the SavigeSystemZ software catalog and product detail pages.",
};

export default function ApplicationsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Applications Catalog</h1>
      <p className="mt-2 text-zinc-300">Filter and discover software by platform, pricing, and maturity.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {appCatalog.map((app) => (
          <article key={app.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-xl text-cyan-300">{app.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{app.summary}</p>
            <Link href={`/applications/${app.slug}`} className="mt-3 inline-block text-sm">
              Open detail page
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
