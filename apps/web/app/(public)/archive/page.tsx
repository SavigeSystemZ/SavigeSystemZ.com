import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { SectionHeading } from "@/components/section-heading";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";
import {
  archiveCategoryLabels,
  archiveCategoryOptions,
  type ArchiveCategoryRecord,
} from "@/lib/archive-taxonomy";

export const metadata: Metadata = {
  title: "Archive",
  description: "Linux builds, scripts, config layers, containers, research drops, and AI archive work.",
};

export const dynamic = "force-dynamic";

type ArchivePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    featured?: string;
  }>;
};

function buildArchiveHref(input: {
  q?: string;
  category?: string;
  featured?: boolean;
}): string {
  const qs = new URLSearchParams();
  if (input.q?.trim()) qs.set("q", input.q.trim());
  if (input.category) qs.set("category", input.category);
  if (input.featured) qs.set("featured", "1");
  const query = qs.toString();
  return query ? `/archive?${query}` : "/archive";
}

function matchesQuery(haystack: string[], query: string): boolean {
  if (!query) return true;
  const lowered = query.toLowerCase();
  return haystack.some((value) => value.toLowerCase().includes(lowered));
}

export default async function ArchivePage(props: ArchivePageProps) {
  const archiveEntries = await getPublicArchiveEntries();
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const category = archiveCategoryOptions.includes(searchParams.category as ArchiveCategoryRecord)
    ? (searchParams.category as ArchiveCategoryRecord)
    : "";
  const featuredOnly = searchParams.featured === "1";

  const featuredEntries = archiveEntries.filter((entry) => entry.featured);
  const filteredEntries = archiveEntries.filter((entry) => {
    if (category && entry.category !== category) return false;
    if (featuredOnly && !entry.featured) return false;
    return matchesQuery(
      [
        entry.title,
        entry.summary,
        entry.categoryLabel,
        entry.details ?? "",
        ...(entry.tags ?? []),
        ...(entry.stackItems ?? []),
      ],
      query,
    );
  });

  const categoryCounts = archiveCategoryOptions
    .map((currentCategory) => ({
      category: currentCategory,
      label: archiveCategoryLabels[currentCategory],
      count: archiveEntries.filter((entry) => entry.category === currentCategory).length,
      filteredCount: filteredEntries.filter((entry) => entry.category === currentCategory).length,
    }))
    .filter((item) => item.count > 0);

  const activeFilterCount = [Boolean(query), Boolean(category), featuredOnly].filter(Boolean).length;
  const featuredResults = filteredEntries.filter((entry) => entry.featured);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Engineering archive"
          title="A publication surface for the rest of the operator stack."
          description="This is where Linux builds, dotfiles, containers, VMs, research notes, books, AI work, and security tooling can live with the same level of framing as the application catalog."
          action={
            <Link href="/services" className="action-secondary text-sm">
              Commission archive work
            </Link>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { value: `${archiveEntries.length}`, label: "public archive drops" },
            { value: `${filteredEntries.length}`, label: activeFilterCount > 0 ? "filtered results" : "visible results" },
            { value: `${categoryCounts.filter((item) => item.filteredCount > 0).length}`, label: "active categories" },
          ].map((metric) => (
            <article key={metric.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Find a lane"
          title="Search the archive by system type, artifact format, or signal."
          description="Filters stay in the URL so the archive remains linkable, crawlable, and usable as the catalog grows."
        />

        <form method="GET" action="/archive" className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.45fr_0.25fr_0.2fr]">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search Linux builds, dotfiles, models, containers, notes…"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          />
          <select
            name="category"
            defaultValue={category}
            aria-label="Filter by category"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
          >
            <option value="">All categories</option>
            {categoryCounts.map((item) => (
              <option key={item.category} value={item.category}>
                {item.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              name="featured"
              value="1"
              defaultChecked={featuredOnly}
              className="rounded border-white/20 bg-slate-950"
            />
            Featured only
          </label>
          <div className="flex gap-2">
            <button type="submit" className="action-primary w-full justify-center text-xs">
              Apply
            </button>
            <Link href="/archive" className="action-secondary text-xs">
              Clear
            </Link>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={buildArchiveHref({ q: query, featured: featuredOnly })}
            className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] ${
              !category ? "bg-cyan-400/14 text-white ring-1 ring-cyan-300/30" : "border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            All
          </Link>
          {categoryCounts.map((item) => {
            const active = category === item.category;
            return (
              <Link
                key={item.category}
                href={buildArchiveHref({ q: query, category: item.category, featured: featuredOnly })}
                className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                  active
                    ? "bg-cyan-400/14 text-white ring-1 ring-cyan-300/30"
                    : "border border-white/10 text-slate-400 hover:border-cyan-300/30 hover:text-white"
                }`}
              >
                {item.label} · {activeFilterCount > 0 ? item.filteredCount : item.count}
              </Link>
            );
          })}
        </div>

        {activeFilterCount > 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Active filters: {query ? `query "${query}"` : null}
            {query && category ? " / " : null}
            {category ? archiveCategoryLabels[category] : null}
            {(query || category) && featuredOnly ? " / " : null}
            {featuredOnly ? "featured only" : null}
          </p>
        ) : null}
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Featured archive"
          title="High-signal entries positioned like systems, not loose files."
          description="Each archive entry gets the same treatment as a product surface: clear framing, build context, and a route into detail or access."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {(featuredResults.length > 0 ? featuredResults : featuredEntries.slice(0, 3)).map((entry) => (
            <ArchiveEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {categoryCounts
          .filter((item) => item.filteredCount > 0 || activeFilterCount === 0)
          .map((item) => (
            <article key={item.category} className="surface-panel rounded-[1.8rem] p-6">
              <p className="section-eyebrow">{item.label}</p>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                {activeFilterCount > 0 ? item.filteredCount : item.count} published entries currently visible inside
                this lane.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                This category can hold public showcase drops, private-ready work, and future release-linked archives.
              </p>
            </article>
          ))}
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Full archive"
          title="The broader foundry output in one searchable lane."
          description="The long-term goal is to let the archive scale without losing shape, whether the entry is a config pack, a research drop, a model artifact, or a controlled private kit."
        />
        {filteredEntries.length === 0 ? (
          <div className="mt-8 rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.02] px-5 py-10 text-sm leading-7 text-slate-400">
            No archive entries match the current filter set. Clear the filters or broaden the search terms.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {filteredEntries.map((entry) => (
              <ArchiveEntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
