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
  storageBackend: "GITHUB" | "SELF_HOSTED";
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

export type PublicRepositoryDetailRecord = PublicCodeRepositoryRecord & {
  updatedAt: string;
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
  storageBackend: "GITHUB" | "SELF_HOSTED";
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
    storageBackend: row.storageBackend,
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

export type PublicCodeRepositoryWithCatalogRecord = PublicCodeRepositoryRecord & {
  linkedApplicationSlug: string | null;
  previewMediaUrl: string | null;
};

export async function listPublicReposWithCatalog(): Promise<PublicCodeRepositoryWithCatalogRecord[]> {
  try {
    const rows = await db.codeRepository.findMany({
      where: { visibility: "PUBLIC" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        visibility: true,
        storageBackend: true,
        githubUrl: true,
        githubOwner: true,
        githubRepo: true,
        defaultBranch: true,
        primaryLanguage: true,
        starCount: true,
        forkCount: true,
        openIssueCount: true,
        latestCommitSha: true,
        latestCommitMessage: true,
        latestCommitAt: true,
        applications: {
          where: { visibility: "PUBLIC" },
          select: {
            slug: true,
            media: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: { mediaUrl: true, title: true },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ latestCommitAt: "desc" }, { updatedAt: "desc" }],
    });

    const results: PublicCodeRepositoryWithCatalogRecord[] = [];
    for (const row of rows) {
      const mapped = mapPublicCodeRepository(row);
      if (!mapped) continue;
      const app = row.applications[0];
      const screenshot = app?.media.find(
        (item) =>
          item.mediaUrl.includes("/screenshots/") ||
          item.title.toLowerCase().includes("repository preview"),
      );
      results.push({
        ...mapped,
        linkedApplicationSlug: app?.slug ?? null,
        previewMediaUrl: screenshot?.mediaUrl ?? app?.media[0]?.mediaUrl ?? null,
      });
    }
    return results;
  } catch {
    return [];
  }
}

export async function listPublicRepos(): Promise<PublicCodeRepositoryRecord[]> {
  try {
    const rows = await db.codeRepository.findMany({
      where: { visibility: "PUBLIC" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        visibility: true,
        storageBackend: true,
        githubUrl: true,
        githubOwner: true,
        githubRepo: true,
        defaultBranch: true,
        primaryLanguage: true,
        starCount: true,
        forkCount: true,
        openIssueCount: true,
        latestCommitSha: true,
        latestCommitMessage: true,
        latestCommitAt: true,
      },
      orderBy: [{ latestCommitAt: "desc" }, { updatedAt: "desc" }],
      take: 60,
    });
    return rows
      .map((row) => mapPublicCodeRepository(row))
      .filter((row): row is PublicCodeRepositoryRecord => row !== null);
  } catch {
    return [];
  }
}

export async function getPublicRepoBySlug(slug: string): Promise<PublicRepositoryDetailRecord | null> {
  return getEntitledRepoBySlug(slug, null, false);
}

export async function getEntitledRepoBySlug(slug: string, userId: string | null, isOwner: boolean): Promise<PublicRepositoryDetailRecord | null> {
  try {
    const row = await db.codeRepository.findFirst({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        storageBackend: true,
        githubUrl: true,
        githubOwner: true,
        githubRepo: true,
        defaultBranch: true,
        primaryLanguage: true,
        starCount: true,
        forkCount: true,
        openIssueCount: true,
        latestCommitSha: true,
        latestCommitMessage: true,
        latestCommitAt: true,
        updatedAt: true,
        visibility: true,
        applications: {
          select: { id: true },
        }
      },
    });
    if (!row) return null;

    if (row.visibility === "DRAFT" && !isOwner) return null;
    
    if (row.visibility === "PRIVATE" && !isOwner) {
      if (!userId) return null;
      if (row.applications.length === 0) return null;
      const license = await db.license.findFirst({
        where: {
          userId,
          applicationId: { in: row.applications.map((a) => a.id) },
          status: "ACTIVE",
        },
      });
      if (!license) return null;
    }

    const mapped = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      storageBackend: row.storageBackend,
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
    return { ...mapped, updatedAt: row.updatedAt.toISOString() };
  } catch {
    return null;
  }
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
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
