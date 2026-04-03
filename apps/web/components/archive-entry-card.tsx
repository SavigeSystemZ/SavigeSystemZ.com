import Link from "next/link";
import type { ArchiveEntryRecord } from "@/lib/archive-catalog";
import { archiveCategoryThemes } from "@/lib/archive-taxonomy";

type ArchiveEntryCardProps = {
  entry: ArchiveEntryRecord;
};

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

export function ArchiveEntryCard({ entry }: ArchiveEntryCardProps) {
  const theme = archiveCategoryThemes[entry.category];
  const previewUrl = entry.previewThumbnailUrl ?? entry.previewImageUrl;

  return (
    <article className="surface-panel group flex h-full flex-col gap-5 p-6">
      <div className={`relative min-h-[14rem] overflow-hidden rounded-[1.5rem] border border-white/8 ${theme}`}>
        {previewUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.86)_84%)]" />
        <div className="relative flex min-h-[14rem] flex-col justify-between p-5">
          <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-100/85">
            <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1">
              {entry.categoryLabel}
            </span>
            {entry.featured ? (
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                Featured
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-300/80">
              {entry.stageLabel ?? "Foundry archive"}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{entry.artifactFormat ?? "Structured archive lane"}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{entry.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{entry.summary}</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">{entry.details ?? "Built to be showcased with stronger framing than a loose repo or one-off file drop."}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {entry.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="signal-chip bg-white/[0.04] text-[0.7rem] uppercase tracking-[0.24em] text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <div className="text-sm text-slate-400">
          <span className="font-medium text-slate-100">{entry.artifactFormat ?? entry.categoryLabel}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {entry.artifactUrl ? (
            <a
              href={entry.artifactUrl}
              className="action-secondary text-sm"
              target={isExternalUrl(entry.artifactUrl) ? "_blank" : undefined}
              rel={isExternalUrl(entry.artifactUrl) ? "noreferrer" : undefined}
            >
              {entry.artifactLabel ?? "Open artifact"}
            </a>
          ) : null}
          <Link href={`/archive/${entry.slug}`} className="action-primary text-sm">
            View archive
          </Link>
        </div>
      </div>
    </article>
  );
}
