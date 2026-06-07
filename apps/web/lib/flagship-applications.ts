import { db } from "@/lib/db";
import {
  buildCatalogSeedFromRepo,
  buildCatalogSeedsFromRepos,
  type FlagshipApplicationSeed,
  type RepoCatalogInput,
} from "@/lib/catalog-from-repos";
import { FEATURED_CATALOG_OVERRIDES } from "@/lib/catalog-rich-copy";

export type { FlagshipApplicationSeed } from "@/lib/catalog-from-repos";

function joinList(items: string[] | undefined): string | null {
  if (!items?.length) return null;
  return items.join("\n");
}

/** @deprecated Use buildCatalogSeedsFromRepos — kept for tests referencing curated entries. */
export const FLAGSHIP_APPLICATIONS: FlagshipApplicationSeed[] = Object.entries(FEATURED_CATALOG_OVERRIDES).map(
  ([githubRepo, override]) =>
    buildCatalogSeedFromRepo({
      githubRepo,
      name: override.name ?? githubRepo,
      description: override.summary ?? null,
      primaryLanguage: override.stackItems?.[0] ?? null,
    }),
);

export type SeedFlagshipApplicationsResult = {
  created: number;
  updated: number;
  linked: number;
  missingRepos: string[];
  totalSeeds: number;
};

export async function listSavigeReposForCatalog(): Promise<RepoCatalogInput[]> {
  const rows = await db.codeRepository.findMany({
    where: {
      provider: "GITHUB",
      visibility: "PUBLIC",
      githubOwner: "SavigeSystemZ",
      githubRepo: { not: null },
    },
    select: {
      githubRepo: true,
      name: true,
      description: true,
      primaryLanguage: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return rows
    .filter((row): row is typeof row & { githubRepo: string } => Boolean(row.githubRepo))
    .map((row) => ({
      githubRepo: row.githubRepo,
      name: row.name,
      description: row.description,
      primaryLanguage: row.primaryLanguage,
    }));
}

export async function buildFullCatalogSeeds(): Promise<FlagshipApplicationSeed[]> {
  const repos = await listSavigeReposForCatalog();
  return buildCatalogSeedsFromRepos(repos);
}

export async function seedFlagshipApplications(
  seeds?: FlagshipApplicationSeed[],
): Promise<SeedFlagshipApplicationsResult> {
  const catalogSeeds = seeds ?? (await buildFullCatalogSeeds());

  const result: SeedFlagshipApplicationsResult = {
    created: 0,
    updated: 0,
    linked: 0,
    missingRepos: [],
    totalSeeds: catalogSeeds.length,
  };

  for (const seed of catalogSeeds) {
    const repo = await db.codeRepository.findFirst({
      where: { provider: "GITHUB", githubOwner: "SavigeSystemZ", githubRepo: seed.githubRepo },
      select: { id: true },
    });
    if (!repo) {
      result.missingRepos.push(seed.githubRepo);
      continue;
    }

    const data = {
      name: seed.name,
      summary: seed.summary,
      label: seed.label ?? null,
      tagline: seed.tagline ?? null,
      audience: seed.audience ?? null,
      priceLabel: seed.priceLabel ?? "TBD",
      releaseChannel: seed.releaseChannel ?? null,
      details: seed.details ?? null,
      highlights: joinList(seed.highlights),
      surfaceAreas: joinList(seed.surfaceAreas),
      stackItems: joinList(seed.stackItems),
      visibility: "PUBLIC" as const,
      featured: seed.featured ?? false,
      codeRepositoryId: repo.id,
    };

    const existing = await db.application.findUnique({ where: { slug: seed.slug } });
    if (existing) {
      await db.application.update({ where: { slug: seed.slug }, data });
      result.updated += 1;
    } else {
      await db.application.create({ data: { slug: seed.slug, ...data } });
      result.created += 1;
    }
    result.linked += 1;
  }

  return result;
}
