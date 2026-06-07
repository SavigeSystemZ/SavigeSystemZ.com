import Image from "next/image";
import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";
import {
  catalogMediaKind,
  catalogMediaKindLabel,
  sortCatalogMediaForDisplay,
} from "@/lib/catalog-media-display";

type ApplicationMediaGalleryProps = {
  items: PublicApplicationMediaRecord[];
  layout?: "hero" | "grid";
};

function MediaFrame({
  item,
  variant,
}: {
  item: PublicApplicationMediaRecord;
  variant: "primary" | "secondary";
}) {
  const kind = catalogMediaKind(item);
  const isScreenshot = kind === "screenshot";
  const minHeight = variant === "primary" ? "min-h-[22rem] sm:min-h-[26rem]" : "min-h-[12rem]";
  const imageFit = isScreenshot ? "object-contain object-center" : "object-cover object-center";

  return (
    <figure
      className={`group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/90 ${minHeight}`}
    >
      <div className={`relative h-full w-full ${variant === "primary" ? "min-h-[22rem] sm:min-h-[26rem]" : "min-h-[12rem]"}`}>
        <Image
          src={item.mediaUrl}
          alt={item.altText}
          fill
          sizes={variant === "primary" ? "(min-width: 1024px) 680px, 100vw" : "(min-width: 1024px) 420px, 100vw"}
          className={`${imageFit} bg-slate-950 transition-transform duration-700 group-hover:scale-[1.02]`}
          priority={variant === "primary"}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.92)_88%)]" />
      <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-cyan-100/85">
          <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1">
            {catalogMediaKindLabel(kind)}
          </span>
          {item.featured ? (
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-amber-100">
              Featured visual
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-base font-semibold text-white sm:text-lg">{item.title}</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-200">{item.description ?? item.altText}</p>
      </figcaption>
    </figure>
  );
}

export function ApplicationMediaGallery({ items, layout = "hero" }: ApplicationMediaGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-7 text-slate-400">
        Flagship media has not been attached to this application yet. Owner uploads and showcase artwork appear
        here once they are published.
      </div>
    );
  }

  const sorted = sortCatalogMediaForDisplay(items);

  if (layout === "grid") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((item) => (
          <MediaFrame key={item.id} item={item} variant="secondary" />
        ))}
      </div>
    );
  }

  const [primary, ...secondary] = sorted;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <MediaFrame item={primary} variant="primary" />
      <div className="grid gap-4">
        {secondary.length > 0 ? (
          secondary.map((item) => <MediaFrame key={item.id} item={item} variant="secondary" />)
        ) : (
          <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Gallery lane</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Additional visual frames can be attached here for workflows, release imagery, screenshots, or brand art.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
