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

export type PublicCodeRepositoryRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  githubUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  defaultBranch: string | null;
  primaryLanguage: string | null;
  starCount: number | null;
  forkCount: number | null;
  openIssueCount: number | null;
  latestCommitSha: string | null;
  latestCommitMessage: string | null;
  latestCommitAt: string | null;
};

export type PublicApplicationDetailRecord = ApplicationRecord & {
  media: PublicApplicationMediaRecord[];
  versions: PublicApplicationVersionRecord[];
  codeRepository: PublicCodeRepositoryRecord | null;
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

type CodeRepositoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  visibility: string;
  githubUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  defaultBranch: string | null;
  primaryLanguage: string | null;
  starCount: number | null;
  forkCount: number | null;
  openIssueCount: number | null;
  latestCommitSha: string | null;
  latestCommitMessage: string | null;
  latestCommitAt: Date | null;
};

function mapPublicCodeRepository(row: CodeRepositoryRow | null | undefined): PublicCodeRepositoryRecord | null {
  if (!row || row.visibility !== "PUBLIC") return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    githubUrl: row.githubUrl,
    githubOwner: row.githubOwner,
    githubRepo: row.githubRepo,
    defaultBranch: row.defaultBranch,
    primaryLanguage: row.primaryLanguage,
    starCount: row.starCount,
    forkCount: row.forkCount,
    openIssueCount: row.openIssueCount,
    latestCommitSha: row.latestCommitSha,
    latestCommitMessage: row.latestCommitMessage,
    latestCommitAt: row.latestCommitAt ? row.latestCommitAt.toISOString() : null,
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
  codeRepository?: CodeRepositoryRow | null;
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
    codeRepository: mapPublicCodeRepository(row.codeRepository ?? null),
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
        codeRepository: true,
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
    codeRepository: null,
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
        codeRepository: true,
      },
    });
    if (row) return mapApplicationWithVersions(row);
  } catch {
    // fall through
  }

  const fallback = appCatalog.find((a) => a.slug === slug);
  return fallback ? { ...fallback, media: [], versions: [], codeRepository: null } : null;
}
