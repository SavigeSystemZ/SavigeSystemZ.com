import Image from "next/image";
import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";
import {
  catalogMediaKind,
  catalogMediaKindLabel,
  pickCatalogPreviewMedia,
} from "@/lib/catalog-media-display";

type ApplicationPreviewImageProps = {
  media: PublicApplicationMediaRecord[] | undefined;
  alt: string;
  variant?: "card" | "hero" | "compact";
  showCaption?: boolean;
  priority?: boolean;
  className?: string;
};

const variantStyles = {
  card: {
    wrapper: "relative min-h-[13rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/70",
    image: "min-h-[13rem]",
    sizes: "(min-width: 768px) 420px, 100vw",
  },
  hero: {
    wrapper: "relative min-h-[14rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/90",
    image: "min-h-[14rem]",
    sizes: "(min-width: 1024px) 680px, 100vw",
  },
  compact: {
    wrapper: "relative min-h-[10rem] overflow-hidden rounded-[1.2rem] border border-white/8 bg-slate-950/70",
    image: "min-h-[10rem]",
    sizes: "(min-width: 768px) 320px, 100vw",
  },
} as const;

export function ApplicationPreviewImage({
  media,
  alt,
  variant = "card",
  showCaption = false,
  priority = false,
  className = "",
}: ApplicationPreviewImageProps) {
  const preview = pickCatalogPreviewMedia(media);
  const styles = variantStyles[variant];

  if (!preview) {
    return (
      <div
        className={`flex items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400 ${className}`}
      >
        Showcase media pending
      </div>
    );
  }

  const kind = catalogMediaKind(preview);
  const imageFit = kind === "screenshot" ? "object-contain object-center" : "object-cover object-center";

  return (
    <figure className={`group ${styles.wrapper} ${className}`}>
      <div className={`relative h-full w-full ${styles.image}`}>
        <Image
          src={preview.mediaUrl}
          alt={preview.altText || alt}
          fill
          sizes={styles.sizes}
          priority={priority}
          className={`${imageFit} bg-slate-950 transition-transform duration-700 group-hover:scale-[1.02]`}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.86)_84%)]" />
      {showCaption ? (
        <figcaption className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-cyan-100/70">
            {catalogMediaKindLabel(kind)}
          </p>
          <p className="mt-2 text-sm font-medium text-white">{preview.title}</p>
          {preview.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-300">{preview.description}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
