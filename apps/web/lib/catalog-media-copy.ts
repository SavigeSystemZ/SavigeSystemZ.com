import type { FlagshipApplicationSeed } from "@/lib/catalog-from-repos";
import { catalogKindForGithubRepo, catalogKindLabel, FEATURED_GITHUB_REPOS } from "@/lib/catalog-from-repos";

export type CatalogMediaCopy = {
  hero: {
    title: string;
    altText: string;
    description: string;
  };
  screenshot: {
    title: string;
    altText: string;
    description: string;
  };
};

type RepoMeta = {
  primaryLanguage?: string | null;
  description?: string | null;
  starCount?: number | null;
  defaultBranch?: string | null;
};

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function buildCatalogMediaCopy(app: FlagshipApplicationSeed, repo?: RepoMeta): CatalogMediaCopy {
  const kind = catalogKindForGithubRepo(app.githubRepo);
  const kindLabel = catalogKindLabel(kind).toLowerCase();
  const lang = repo?.primaryLanguage?.trim() || app.stackItems?.[0]?.trim();
  const repoDescription = repo?.description?.trim() || app.summary;
  const branch = repo?.defaultBranch?.trim() || "main";
  const stars =
    typeof repo?.starCount === "number" && repo.starCount > 0 ? `${repo.starCount} GitHub stars` : null;

  const isFeatured = FEATURED_GITHUB_REPOS.has(app.githubRepo);
  const heroDescription = truncate(
    isFeatured
      ? [app.tagline, app.details, app.summary].filter(Boolean).join(" ")
      : [app.tagline, app.details].filter(Boolean).join(" — ") || app.summary,
    isFeatured ? 480 : 320,
  );

  const screenshotDescription = truncate(
    [
      `Live Open Graph snapshot of SavigeSystemZ/${app.githubRepo} on GitHub`,
      isFeatured ? app.summary : null,
      lang ? `Primary language: ${lang}` : null,
      `Default branch: ${branch}`,
      stars,
      !isFeatured && repoDescription !== app.summary ? repoDescription : null,
      isFeatured && app.details ? app.details : null,
      `This ${kindLabel} is cataloged on SavigeSystemZ.com with mirrored source, release lane v0.1.0, and pricing marked TBD.`,
    ]
      .filter(Boolean)
      .join(". "),
    isFeatured ? 520 : 420,
  );

  return {
    hero: {
      title: `${app.name} — foundry showcase`,
      altText: `Branded showcase artwork representing ${app.name} in the SavigeSystemZ catalog`,
      description: heroDescription,
    },
    screenshot: {
      title: `${app.name} — GitHub repository snapshot`,
      altText: `Social preview image of the ${app.githubRepo} repository hosted under SavigeSystemZ on GitHub`,
      description: screenshotDescription,
    },
  };
}

export function buildCatalogReleaseChangelog(app: FlagshipApplicationSeed, repo?: RepoMeta): string {
  const lang = repo?.primaryLanguage?.trim();
  const parts = [
    `Catalog release v0.1.0 for ${app.name}.`,
    app.tagline ? truncate(app.tagline, 160) : truncate(app.summary, 160),
    lang ? `Mirrored from GitHub (${lang}, branch ${repo?.defaultBranch ?? "main"}).` : "Mirrored from the public GitHub default branch.",
    "Commercial pricing is TBD; source archive download is available now.",
  ];
  return parts.join(" ");
}
