import type { MetadataRoute } from "next";
import { appCatalog } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/applications",
  "/downloads",
  "/pricing",
  "/bio",
  "/services",
  "/reviews",
  "/creator",
  "/dashboard",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const catalogEntries: MetadataRoute.Sitemap = appCatalog.map((app) => ({
    url: `${base}/applications/${app.slug}`,
    lastModified: now,
  }));

  return [...staticEntries, ...catalogEntries];
}
