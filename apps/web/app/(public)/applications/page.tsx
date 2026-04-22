import type { Metadata } from "next";
import Link from "next/link";
import { AppShowcaseCard } from "@/components/app-showcase-card";
import { SectionHeading } from "@/components/section-heading";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import { foundryLanes } from "@/lib/showcase-content";

/** Catalog reads the DB when available; avoid build-time Prisma without DATABASE_URL. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications",
  description: "Browse the SavigeSystemZ software catalog and product detail pages.",
};

export default async function ApplicationsPage() {
  const appCatalog = await getPublicCatalogWithReleases();
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Applications"
          title="Catalog entries positioned like real systems, not dead portfolio tiles."
          description="This surface is built to hold launch-ready applications, internal tools, install kits, and operator software with enough context for buyers, collaborators, and technical evaluators to understand what each system is for."
          action={
            <Link href="/downloads" className="action-secondary text-sm">
              Jump to downloads
            </Link>
          }
        />
        <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { value: `${appCatalog.length}`, label: "public systems" },
            { value: `${appCatalog.filter((app) => app.featured).length}`, label: "featured launches" },
            { value: "Flexible", label: "delivery models" },
          ].map((metric) => (
            <div key={metric.label} className="glow-hover rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="reveal-stagger grid gap-4 md:grid-cols-2">
          {appCatalog.map((app) => (
            <AppShowcaseCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      <section className="reveal-stagger mt-8 grid gap-4 xl:grid-cols-3">
        {foundryLanes.map((lane) => (
          <article key={lane.title} className="surface-panel glow-hover rounded-[1.8rem] p-6">
            <p className="section-eyebrow">{lane.title}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">{lane.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {lane.items.map((item) => (
                <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
