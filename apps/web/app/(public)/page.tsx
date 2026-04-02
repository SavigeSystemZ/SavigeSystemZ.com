import Link from "next/link";
import { Hero } from "@/components/hero";
import { appCatalog } from "@/lib/catalog";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
      <Hero />
      <section className="rounded-xl border border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-zinc-100">Featured Applications</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {appCatalog.map((app) => (
            <article key={app.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="font-medium text-cyan-300">{app.name}</h3>
              <p className="mt-2 text-sm text-zinc-300">{app.summary}</p>
              <Link href={`/applications/${app.slug}`} className="mt-3 inline-block text-sm text-zinc-100">
                View details
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-zinc-100">Founder and Capability Profile</h2>
        <p className="mt-2 text-zinc-300">
          Portfolio depth, operating philosophy, and technical capability for customers and recruiters.
        </p>
        <Link href="/bio" className="mt-3 inline-block text-cyan-300">
          Explore profile
        </Link>
      </section>
    </main>
  );
}
