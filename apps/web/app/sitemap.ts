import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/applications",
  "/archive",
  "/downloads",
  "/repos",
  "/pricing",
  "/bio",
  "/services",
  "/reviews",
  "/creator",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const [apps, archives, repos] = await Promise.all([
    db.application.findMany({
      where: { visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.archiveEntry.findMany({
      where: { visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.codeRepository.findMany({
      where: { visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const catalogEntries: MetadataRoute.Sitemap = apps.map((app) => ({
    url: `${base}/applications/${app.slug}`,
    lastModified: app.updatedAt,
  }));

  const archiveEntries: MetadataRoute.Sitemap = archives.map((entry) => ({
    url: `${base}/archive/${entry.slug}`,
    lastModified: entry.updatedAt,
  }));

  const repoEntries: MetadataRoute.Sitemap = repos.map((repo) => ({
    url: `${base}/repos/${repo.slug}`,
    lastModified: repo.updatedAt,
  }));

  return [...staticEntries, ...catalogEntries, ...archiveEntries, ...repoEntries];
}
