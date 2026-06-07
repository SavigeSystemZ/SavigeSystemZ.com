import type { ApplicationRecord } from "@savige/domain";
import Image from "next/image";
import Link from "next/link";
import type { PublicApplicationMediaRecord, PublicCodeRepositoryRecord } from "@/lib/catalog-resolver";
import { catalogMediaKind, catalogMediaKindLabel, pickCatalogPreviewMedia } from "@/lib/catalog-media-display";
import { getShowcaseApplication } from "@/lib/showcase-content";

type AppShowcaseCardProps = {
  app: ApplicationRecord & {
    media?: PublicApplicationMediaRecord[];
    codeRepository?: PublicCodeRepositoryRecord | null;
  };
};

export function AppShowcaseCard({ app }: AppShowcaseCardProps) {
  const showcase = getShowcaseApplication(app);
  const preview = pickCatalogPreviewMedia(app.media);
  const previewKind = preview ? catalogMediaKindLabel(catalogMediaKind(preview)) : null;
  const language = app.codeRepository?.primaryLanguage?.trim();
  const detailHref = `/applications/${app.slug}`;

  return (
    <article className="surface-panel group flex h-full flex-col gap-5 p-6">
      {preview ? (
        <Link href={detailHref} className="block outline-none ring-cyan-300/40 focus-visible:ring-2">
          <figure className="relative min-h-[14rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/90">
            <div className="relative min-h-[14rem]">
              <Image
                src={preview.thumbnailUrl ?? preview.mediaUrl}
                alt={preview.altText}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`${
                  preview.mediaUrl.includes("/screenshots/") || preview.mediaUrl.includes("/manual/")
                    ? "object-contain object-center"
                    : "object-cover object-center"
                } bg-slate-950 transition-transform duration-700 group-hover:scale-[1.02]`}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.9)_88%)]" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              {previewKind ? (
                <p className="text-[0.68rem] uppercase tracking-[0.26em] text-cyan-100/70">{previewKind}</p>
              ) : null}
              <p className="mt-2 text-sm font-medium text-white">{preview.title}</p>
              {preview.description ? (
                <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-300">{preview.description}</p>
              ) : null}
            </figcaption>
          </figure>
        </Link>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-300/80">
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
          {showcase.label}
        </span>
        {language ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-200">
            {language}
          </span>
        ) : null}
        {app.featured ? (
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-amber-100">
            Featured
          </span>
        ) : null}
      </div>

      <div>
        <Link href={detailHref} className="group/title block outline-none">
          <h3 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white group-hover/title:text-cyan-100">
            {app.name}
          </h3>
        </Link>
        <p className="mt-3 text-sm leading-7 text-slate-200">{showcase.headline}</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">{showcase.operationalFocus}</p>
        {app.codeRepository?.description ? (
          <p className="mt-3 text-sm leading-7 text-slate-500">{app.codeRepository.description}</p>
        ) : null}
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
        <Link href={detailHref} className="action-secondary text-sm">
          View system
        </Link>
      </div>
    </article>
  );
}
