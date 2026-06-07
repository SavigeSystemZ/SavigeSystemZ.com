import { buildCatalogMediaCopy, buildCatalogReleaseChangelog } from "@/lib/catalog-media-copy";
import { resolveCatalogMediaUrls } from "@/lib/catalog-showcase-media";
import { db } from "@/lib/db";
import { buildFullCatalogSeeds } from "@/lib/flagship-applications";

export type FlagshipReleaseAssetSeed = {
  fileName: string;
  visibility: "PUBLIC" | "ENTITLED";
};

export type FlagshipReleaseMediaSeed = {
  title: string;
  altText: string;
  mediaUrl: string;
  featured: boolean;
  description?: string;
  sortOrder: number;
};

export type FlagshipReleaseSeed = {
  slug: string;
  version: string;
  changelog: string;
  mediaItems: FlagshipReleaseMediaSeed[];
  assets: FlagshipReleaseAssetSeed[];
};

function githubArchiveUrl(owner: string, repo: string, branch: string): string {
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/archive/refs/heads/${encodeURIComponent(branch)}.zip`;
}

/** Release + media definitions for every catalog application. */
export async function buildCatalogReleaseSeeds(): Promise<FlagshipReleaseSeed[]> {
  const apps = await buildFullCatalogSeeds();
  const repoRows = await db.codeRepository.findMany({
    where: {
      provider: "GITHUB",
      githubOwner: "SavigeSystemZ",
      githubRepo: { in: apps.map((app) => app.githubRepo) },
    },
    select: {
      githubRepo: true,
      description: true,
      primaryLanguage: true,
      starCount: true,
      defaultBranch: true,
    },
  });
  const repoByName = new Map(repoRows.map((row) => [row.githubRepo, row]));

  return apps.map((app) => {
    const repo = repoByName.get(app.githubRepo);
    const media = resolveCatalogMediaUrls(app.slug, app.githubRepo);
    const copy = buildCatalogMediaCopy(app, repo ?? undefined);

    return {
      slug: app.slug,
      version: "0.1.0",
      changelog: buildCatalogReleaseChangelog(app, repo ?? undefined),
      mediaItems: [
        {
          title: copy.screenshot.title,
          altText: copy.screenshot.altText,
          mediaUrl: media.screenshot,
          featured: false,
          description: copy.screenshot.description,
          sortOrder: 0,
        },
        {
          title: copy.hero.title,
          altText: copy.hero.altText,
          mediaUrl: media.hero,
          featured: false,
          description: copy.hero.description,
          sortOrder: 1,
        },
      ],
      assets: [
        {
          fileName: `${app.githubRepo.toLowerCase()}-source.zip`,
          visibility: "PUBLIC",
        },
      ],
    };
  });
}

export type SeedFlagshipReleasesResult = {
  mediaCreated: number;
  mediaUpdated: number;
  versionsCreated: number;
  assetsCreated: number;
  skipped: string[];
};

export async function seedFlagshipReleases(
  seeds?: FlagshipReleaseSeed[],
): Promise<SeedFlagshipReleasesResult> {
  const releaseSeeds = seeds ?? (await buildCatalogReleaseSeeds());
  const result: SeedFlagshipReleasesResult = {
    mediaCreated: 0,
    mediaUpdated: 0,
    versionsCreated: 0,
    assetsCreated: 0,
    skipped: [],
  };

  for (const seed of releaseSeeds) {
    const app = await db.application.findUnique({
      where: { slug: seed.slug },
      include: { codeRepository: { select: { githubOwner: true, githubRepo: true, defaultBranch: true } } },
    });
    if (!app) {
      result.skipped.push(seed.slug);
      continue;
    }

    const owner = app.codeRepository?.githubOwner ?? "SavigeSystemZ";
    const repo = app.codeRepository?.githubRepo ?? seed.slug;
    const branch = app.codeRepository?.defaultBranch ?? "main";
    const archiveUrl = githubArchiveUrl(owner, repo, branch);

    const keepTitles = seed.mediaItems.map((item) => item.title);
    await db.applicationMedia.deleteMany({
      where: {
        applicationId: app.id,
        title: { notIn: keepTitles },
      },
    });

    for (const mediaSeed of seed.mediaItems) {
      const existingMedia = await db.applicationMedia.findFirst({
        where: { applicationId: app.id, title: mediaSeed.title },
      });
      if (existingMedia) {
        await db.applicationMedia.update({
          where: { id: existingMedia.id },
          data: {
            altText: mediaSeed.altText,
            description: mediaSeed.description ?? null,
            mediaUrl: mediaSeed.mediaUrl,
            thumbnailUrl: mediaSeed.mediaUrl,
            featured: mediaSeed.featured,
            sortOrder: mediaSeed.sortOrder,
          },
        });
        result.mediaUpdated += 1;
      } else {
        await db.applicationMedia.create({
          data: {
            applicationId: app.id,
            title: mediaSeed.title,
            altText: mediaSeed.altText,
            description: mediaSeed.description ?? null,
            mediaUrl: mediaSeed.mediaUrl,
            thumbnailUrl: mediaSeed.mediaUrl,
            featured: mediaSeed.featured,
            sortOrder: mediaSeed.sortOrder,
          },
        });
        result.mediaCreated += 1;
      }
    }

    let version = await db.applicationVersion.findUnique({
      where: { applicationId_version: { applicationId: app.id, version: seed.version } },
    });
    if (!version) {
      version = await db.applicationVersion.create({
        data: {
          applicationId: app.id,
          version: seed.version,
          changelog: seed.changelog,
        },
      });
      result.versionsCreated += 1;
    } else {
      await db.applicationVersion.update({
        where: { id: version.id },
        data: { changelog: seed.changelog },
      });
    }

    for (const assetSeed of seed.assets) {
      const existingAsset = await db.releaseAsset.findFirst({
        where: { versionId: version.id, fileName: assetSeed.fileName },
      });
      if (existingAsset) continue;

      await db.releaseAsset.create({
        data: {
          versionId: version.id,
          fileName: assetSeed.fileName,
          fileUrl: archiveUrl,
          visibility: assetSeed.visibility,
          checksum: null,
        },
      });
      result.assetsCreated += 1;
    }
  }

  return result;
}
