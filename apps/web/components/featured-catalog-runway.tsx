import Link from "next/link";
import type { PublicApplicationDetailRecord } from "@/lib/catalog-resolver";
import { ApplicationPreviewImage } from "@/components/application-preview-image";

type FeaturedCatalogRunwayProps = {
  apps: PublicApplicationDetailRecord[];
};

export function FeaturedCatalogRunway({ apps }: FeaturedCatalogRunwayProps) {
  if (apps.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => (
        <Link
          key={app.id}
          href={`/applications/${app.slug}`}
          className="group block rounded-[1.6rem] outline-none ring-cyan-300/40 focus-visible:ring-2"
        >
          <ApplicationPreviewImage
            media={app.media}
            alt={app.name}
            variant="hero"
            showCaption
            className="transition duration-300 group-hover:border-cyan-300/30"
          />
          <p className="mt-3 text-sm font-medium text-white group-hover:text-cyan-100">{app.name}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-400">{app.summary}</p>
        </Link>
      ))}
    </div>
  );
}
