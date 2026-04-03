import type { ApplicationRecord } from "@savige/domain";
import Link from "next/link";
import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";
import { getShowcaseApplication } from "@/lib/showcase-content";

type AppShowcaseCardProps = {
  app: ApplicationRecord & { media?: PublicApplicationMediaRecord[] };
};

export function AppShowcaseCard({ app }: AppShowcaseCardProps) {
  const showcase = getShowcaseApplication(app);
  const preview = app.media?.[0] ?? null;

  return (
    <article className="surface-panel group flex h-full flex-col gap-5 p-6">
      {preview ? (
        <div className="relative min-h-[14rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/70">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${preview.thumbnailUrl ?? preview.mediaUrl})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.84)_84%)]" />
          <div className="relative flex min-h-[14rem] items-end p-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-cyan-100/70">Visual frame</p>
              <p className="mt-2 text-sm font-medium text-white">{preview.title}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-300/80">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
          {showcase.label}
        </span>
        {app.featured ? (
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-amber-100">
            Featured
          </span>
        ) : null}
      </div>

      <div>
        <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{app.name}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{app.summary}</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">{showcase.operationalFocus}</p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <dt className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-500">Audience</dt>
          <dd className="mt-2 text-slate-100">{showcase.audience}</dd>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <dt className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-500">Release lane</dt>
          <dd className="mt-2 text-slate-100">{showcase.releaseChannel}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {showcase.highlights.map((highlight) => (
          <span
            key={highlight}
            className="signal-chip bg-white/[0.04] text-[0.7rem] uppercase tracking-[0.24em] text-slate-300"
          >
            {highlight}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="text-sm text-slate-400">
          <span className="font-medium text-slate-100">{showcase.priceModel}</span>
        </div>
        <Link href={`/applications/${app.slug}`} className="action-secondary text-sm">
          View system
        </Link>
      </div>
    </article>
  );
}
