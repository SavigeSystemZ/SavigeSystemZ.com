import type { Metadata } from "next";
import Link from "next/link";
import { Panel, SectionHeading, StatusChip } from "@savige/ui";
import { CatalogSearchFilter } from "@/components/catalog-search-filter";
import { getCatalogKindFromApplication } from "@/lib/catalog-from-repos";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import { foundryLanes } from "@/lib/showcase-content";

/** Catalog reads the DB when available; avoid build-time Prisma without DATABASE_URL. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications",
  description: "Browse the SavigeSystemZ software catalog — applications, games, and books from the GitHub org.",
};

export default async function ApplicationsPage() {
  const appCatalog = await getPublicCatalogWithReleases();
  const applications = appCatalog.filter((app) => getCatalogKindFromApplication(app) === "application");
  const games = appCatalog.filter((app) => getCatalogKindFromApplication(app) === "game");
  const books = appCatalog.filter((app) => getCatalogKindFromApplication(app) === "book");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Panel className="rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Catalog"
          title="Every SavigeSystemZ GitHub repo — applications, games, and books — in one foundry catalog."
          description="Each entry mirrors public source from the org, ships with showcase media and a v0.1.0 release lane, and lists pricing as TBD until commercial lanes are opened."
          action={
            <Link href="/downloads" className="action-secondary text-sm">
              Jump to downloads
            </Link>
          }
        />
        <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { value: `${appCatalog.length}`, label: "total entries" },
            { value: `${applications.length}`, label: "applications" },
            { value: `${games.length}`, label: "games" },
            { value: `${books.length}`, label: "books" },
          ].map((metric) => (
            <div key={metric.label} className="glow-hover rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </Panel>

      <CatalogSearchFilter applications={applications} games={games} books={books} />

      <section className="reveal-stagger mt-8 grid gap-4 xl:grid-cols-3">
        {foundryLanes.map((lane) => (
          <article key={lane.title} className="surface-panel glow-hover rounded-[1.8rem] p-6">
            <p className="section-eyebrow">{lane.title}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">{lane.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {lane.items.map((item) => (
                <StatusChip key={item} className="text-xs uppercase tracking-[0.24em] text-slate-200">
                  {item}
                </StatusChip>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
