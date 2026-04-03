import type { ApplicationRecord } from "@savige/domain";
import { appCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";

export type PublicReleaseAssetRecord = {
  id: string;
  fileName: string;
  fileUrl: string;
  checksum: string | null;
  visibility: "PUBLIC" | "ENTITLED" | "PRIVATE";
  createdAt: string;
};

export type PublicApplicationVersionRecord = {
  id: string;
  version: string;
  changelog: string;
  createdAt: string;
  assets: PublicReleaseAssetRecord[];
};

export type PublicApplicationMediaRecord = {
  id: string;
  title: string;
  altText: string;
  description: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
};

export type PublicApplicationDetailRecord = ApplicationRecord & {
  media: PublicApplicationMediaRecord[];
  versions: PublicApplicationVersionRecord[];
};

function mapVisibility(v: string): ApplicationRecord["visibility"] {
  if (v === "PUBLIC") return "public";
  if (v === "PRIVATE") return "private";
  return "draft";
}

function splitStoredList(value?: string | null): string[] | undefined {
  if (!value) return undefined;
  const items = Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
  return items.length > 0 ? items : undefined;
}

function mapRow(row: {
  id: string;
  slug: string;
  name: string;
  summary: string;
  label?: string | null;
  tagline?: string | null;
  audience?: string | null;
  priceLabel?: string | null;
  releaseChannel?: string | null;
  details?: string | null;
  highlights?: string | null;
  surfaceAreas?: string | null;
  stackItems?: string | null;
  visibility: string;
  featured: boolean;
}): ApplicationRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    label: row.label ?? undefined,
    tagline: row.tagline ?? undefined,
    audience: row.audience ?? undefined,
    priceLabel: row.priceLabel ?? undefined,
    releaseChannel: row.releaseChannel ?? undefined,
    details: row.details ?? undefined,
    highlights: splitStoredList(row.highlights),
    surfaceAreas: splitStoredList(row.surfaceAreas),
    stackItems: splitStoredList(row.stackItems),
    visibility: mapVisibility(row.visibility),
    featured: row.featured,
  };
}

function mapVersion(version: {
  id: string;
  version: string;
  changelog: string;
  createdAt: Date;
  assets: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    checksum: string | null;
    visibility: "PUBLIC" | "ENTITLED" | "PRIVATE";
    createdAt: Date;
  }>;
}): PublicApplicationVersionRecord {
  return {
    id: version.id,
    version: version.version,
    changelog: version.changelog,
    createdAt: version.createdAt.toISOString(),
    assets: version.assets.map((asset) => ({
      id: asset.id,
      fileName: asset.fileName,
      fileUrl: asset.fileUrl,
      checksum: asset.checksum,
      visibility: asset.visibility,
      createdAt: asset.createdAt.toISOString(),
    })),
  };
}

function mapApplicationWithVersions(row: {
  id: string;
  slug: string;
  name: string;
  summary: string;
  label?: string | null;
  tagline?: string | null;
  audience?: string | null;
  priceLabel?: string | null;
  releaseChannel?: string | null;
  details?: string | null;
  highlights?: string | null;
  surfaceAreas?: string | null;
  stackItems?: string | null;
  visibility: string;
  featured: boolean;
  media: Array<{
    id: string;
    title: string;
    altText: string;
    description: string | null;
    mediaUrl: string;
    thumbnailUrl: string | null;
    featured: boolean;
    sortOrder: number;
    createdAt: Date;
  }>;
  versions: Array<{
    id: string;
    version: string;
    changelog: string;
    createdAt: Date;
    assets: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      checksum: string | null;
      visibility: "PUBLIC" | "ENTITLED" | "PRIVATE";
      createdAt: Date;
    }>;
  }>;
}): PublicApplicationDetailRecord {
  return {
    ...mapRow(row),
    media: row.media.map((item) => ({
      id: item.id,
      title: item.title,
      altText: item.altText,
      description: item.description,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl,
      featured: item.featured,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
    })),
    versions: row.versions.map(mapVersion),
  };
}

/**
 * Public catalog: prefers database rows (`visibility = PUBLIC`), falls back to static `appCatalog` if empty or on error.
 */
export async function getPublicCatalog(): Promise<ApplicationRecord[]> {
  try {
    const rows = await db.application.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map(mapRow);
    }
  } catch {
    // DB unavailable or misconfigured — demo static catalog
  }
  return appCatalog;
}

/**
 * Single application by slug: DB first (PUBLIC only for anonymous catalog), then static catalog.
 */
export async function getPublicApplicationBySlug(slug: string): Promise<ApplicationRecord | null> {
  try {
    const row = await db.application.findFirst({
      where: { slug, visibility: "PUBLIC" },
    });
    if (row) return mapRow(row);
  } catch {
    // fall through
  }
  return appCatalog.find((a) => a.slug === slug) ?? null;
}

/**
 * Public catalog with release data for download/detail surfaces.
 */
export async function getPublicCatalogWithReleases(): Promise<PublicApplicationDetailRecord[]> {
  try {
    const rows = await db.application.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      include: {
        media: {
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
        versions: {
          orderBy: [{ createdAt: "desc" }],
          include: {
            assets: {
              where: { visibility: { in: ["PUBLIC", "ENTITLED"] } },
              orderBy: [{ createdAt: "desc" }],
            },
          },
        },
      },
    });
    if (rows.length > 0) {
      return rows.map(mapApplicationWithVersions);
    }
  } catch {
    // DB unavailable or misconfigured — demo static catalog
  }

  return appCatalog.map((app) => ({
    ...app,
    media: [],
    versions: [],
  }));
}

/**
 * Single application with public release data.
 */
export async function getPublicApplicationWithReleasesBySlug(
  slug: string,
): Promise<PublicApplicationDetailRecord | null> {
  try {
    const row = await db.application.findFirst({
      where: { slug, visibility: "PUBLIC" },
      include: {
        media: {
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
        versions: {
          orderBy: [{ createdAt: "desc" }],
          include: {
            assets: {
              where: { visibility: { in: ["PUBLIC", "ENTITLED"] } },
              orderBy: [{ createdAt: "desc" }],
            },
          },
        },
      },
    });
    if (row) return mapApplicationWithVersions(row);
  } catch {
    // fall through
  }

  const fallback = appCatalog.find((a) => a.slug === slug);
  return fallback ? { ...fallback, media: [], versions: [] } : null;
}
