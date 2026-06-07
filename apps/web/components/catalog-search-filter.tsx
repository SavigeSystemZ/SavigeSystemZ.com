"use client";

import { useMemo, useState } from "react";
import { AppShowcaseCard } from "@/components/app-showcase-card";
import type { PublicApplicationDetailRecord } from "@/lib/catalog-resolver";

type CatalogSearchFilterProps = {
  applications: PublicApplicationDetailRecord[];
  games: PublicApplicationDetailRecord[];
  books: PublicApplicationDetailRecord[];
};

function matchesQuery(app: PublicApplicationDetailRecord, query: string): boolean {
  const haystack = [
    app.name,
    app.summary,
    app.tagline,
    app.label,
    app.codeRepository?.primaryLanguage,
    app.codeRepository?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function CatalogGrid({ apps }: { apps: PublicApplicationDetailRecord[] }) {
  if (apps.length === 0) {
    return (
      <p className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
        No catalog entries match this filter.
      </p>
    );
  }

  return (
    <div className="reveal-stagger grid gap-4 md:grid-cols-2">
      {apps.map((app) => (
        <AppShowcaseCard key={app.id} app={app} />
      ))}
    </div>
  );
}

export function CatalogSearchFilter({ applications, games, books }: CatalogSearchFilterProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const filteredApplications = useMemo(
    () => (normalized ? applications.filter((app) => matchesQuery(app, normalized)) : applications),
    [applications, normalized],
  );
  const filteredGames = useMemo(
    () => (normalized ? games.filter((app) => matchesQuery(app, normalized)) : games),
    [games, normalized],
  );
  const filteredBooks = useMemo(
    () => (normalized ? books.filter((app) => matchesQuery(app, normalized)) : books),
    [books, normalized],
  );

  const total = filteredApplications.length + filteredGames.length + filteredBooks.length;

  return (
    <div className="mt-8">
      <div className="sticky top-4 z-10 mb-8 rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-4 backdrop-blur">
        <label className="grid gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
          Search catalog
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, summary, language…"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          />
        </label>
        <nav className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
          <a href="#catalog-applications" className="signal-chip">
            Applications ({filteredApplications.length})
          </a>
          <a href="#catalog-games" className="signal-chip">
            Games ({filteredGames.length})
          </a>
          <a href="#catalog-books" className="signal-chip">
            Books ({filteredBooks.length})
          </a>
          <span className="signal-chip text-slate-500">{total} visible</span>
        </nav>
      </div>

      {filteredApplications.length > 0 ? (
        <section id="catalog-applications" className="mt-10 scroll-mt-28">
          <div className="mb-5 max-w-3xl">
            <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">Applications</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Software, platforms, operator tools, and Base44 app mirrors tracked from the SavigeSystemZ GitHub org.
            </p>
          </div>
          <CatalogGrid apps={filteredApplications} />
        </section>
      ) : null}

      {filteredGames.length > 0 ? (
        <section id="catalog-games" className="mt-10 scroll-mt-28">
          <div className="mb-5 max-w-3xl">
            <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">Games</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Playable and narrative game repos — Shards of Savige, GCAST tooling, and game scaffolds.
            </p>
          </div>
          <CatalogGrid apps={filteredGames} />
        </section>
      ) : null}

      {filteredBooks.length > 0 ? (
        <section id="catalog-books" className="mt-10 scroll-mt-28">
          <div className="mb-5 max-w-3xl">
            <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">Books & literature</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Fiction factories, writing systems, and literature-adjacent repos.
            </p>
          </div>
          <CatalogGrid apps={filteredBooks} />
        </section>
      ) : null}

      {total === 0 ? (
        <p className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
          No entries match &ldquo;{query}&rdquo;. Try a repo name, language, or summary keyword.
        </p>
      ) : null}
    </div>
  );
}
