import {
  BASE44_REPO_OVERRIDES,
  EXTENDED_CATALOG_OVERRIDES,
  FEATURED_CATALOG_OVERRIDES,
} from "@/lib/catalog-rich-copy";

export { FEATURED_CATALOG_OVERRIDES } from "@/lib/catalog-rich-copy";

export type CatalogKind = "application" | "game" | "book";

export type FlagshipApplicationSeed = {
  slug: string;
  name: string;
  summary: string;
  githubRepo: string;
  label?: string;
  tagline?: string;
  audience?: string;
  priceLabel?: string;
  releaseChannel?: string;
  details?: string;
  highlights?: string[];
  surfaceAreas?: string[];
  stackItems?: string[];
  featured?: boolean;
};

export const CATALOG_PRICE_LABEL = "TBD";

/** GitHub repos excluded from the public catalog (fixtures, mirrors, etc.). */
export const EXCLUDED_GITHUB_REPOS = new Set(["Hello-World"]);

export const GAME_GITHUB_REPOS = new Set([
  "SOSTheFirstCrown",
  "ShardsOfSavige",
  "gh-gcast",
  "GAMST",
]);

export const BOOK_GITHUB_REPOS = new Set(["FWST"]);

export const FEATURED_GITHUB_REPOS = new Set([
  "Immortality",
  "LedgerLoop",
  "SavigeSystemZ.com",
  "etherweave",
  "Vetraxis",
]);

/** Stable public slugs — preserve existing URLs when expanding the catalog. */
const LEGACY_SLUG_BY_REPO: Record<string, string> = {
  Immortality: "immortality",
  LedgerLoop: "ledgerloop",
  "SavigeSystemZ.com": "savigesystemz-com",
  etherweave: "etherweave",
  Vetraxis: "vetraxis",
  CleanoutConnect: "cleanoutconnect",
  SavigeAI: "savigeai",
  ContextCore: "contextcore",
  CandleCompass: "candlecompass",
  DeepWeave: "deepweave",
  SteadyStack: "steadystack",
  RSIGlobe: "rsiglobe",
  FWST: "fwst",
  SOSTheFirstCrown: "sos-the-first-crown",
  ShardsOfSavige: "shardsofsavige",
  "gh-gcast": "gh-gcast",
  GAMST: "gamst",
};

export type RepoCatalogInput = {
  githubRepo: string;
  name: string;
  description: string | null;
  primaryLanguage: string | null;
};

export function catalogKindForGithubRepo(githubRepo: string): CatalogKind {
  if (GAME_GITHUB_REPOS.has(githubRepo)) return "game";
  if (BOOK_GITHUB_REPOS.has(githubRepo)) return "book";
  return "application";
}

export function catalogKindLabel(kind: CatalogKind): string {
  if (kind === "game") return "Game";
  if (kind === "book") return "Book";
  return "Application";
}

export function getCatalogKindFromApplication(app: {
  label?: string | null;
  slug: string;
}): CatalogKind {
  if (app.label === "Game") return "game";
  if (app.label === "Book") return "book";

  const repoEntry = Object.entries(LEGACY_SLUG_BY_REPO).find(([, slug]) => slug === app.slug);
  if (repoEntry) {
    const [repo] = repoEntry;
    if (GAME_GITHUB_REPOS.has(repo)) return "game";
    if (BOOK_GITHUB_REPOS.has(repo)) return "book";
  }

  if (["sos-the-first-crown", "shardsofsavige", "gh-gcast", "gamst"].includes(app.slug)) return "game";
  if (app.slug === "fwst") return "book";
  return "application";
}

export function applicationSlugFromGithubRepo(githubRepo: string): string {
  if (LEGACY_SLUG_BY_REPO[githubRepo]) return LEGACY_SLUG_BY_REPO[githubRepo];
  return githubRepo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function defaultAudience(kind: CatalogKind): string {
  if (kind === "game") return "Players, worldbuilders, and interactive fiction fans";
  if (kind === "book") return "Writers, editors, and fiction operators";
  return "Operators, builders, and technical evaluators";
}

function defaultHighlights(kind: CatalogKind, repo: RepoCatalogInput): string[] {
  if (kind === "game") return ["Playable world", "Savige universe", "Source on GitHub", "Catalog entry"];
  if (kind === "book") return ["Structured fiction", "Writing factory", "Source on GitHub", "Catalog entry"];
  const lang = repo.primaryLanguage?.trim();
  return lang ? ["GitHub mirror", lang, "Catalog entry", "Release lane"] : ["GitHub mirror", "Catalog entry", "Release lane", "Foundry tracked"];
}

function defaultSurfaces(kind: CatalogKind): string[] {
  if (kind === "game") return ["World bible", "Play loop", "Asset pipeline", "Release notes"];
  if (kind === "book") return ["Manuscript factory", "Story structure", "Export lane", "Release notes"];
  return ["Catalog page", "Source repository", "Release lane", "Operator notes"];
}

function defaultSummary(kind: CatalogKind, repo: RepoCatalogInput): string {
  const cleaned = repo.description?.trim();
  if (cleaned) return cleaned;
  const kindLabel = catalogKindLabel(kind).toLowerCase();
  return `${repo.name} — a SavigeSystemZ ${kindLabel} tracked in the foundry catalog with mirrored GitHub source.`;
}

function defaultTagline(kind: CatalogKind, repo: RepoCatalogInput): string {
  const cleaned = repo.description?.trim();
  if (cleaned) {
    const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0]?.trim();
    if (firstSentence && firstSentence.length >= 24) return firstSentence;
    return cleaned.length > 140 ? `${cleaned.slice(0, 137).trimEnd()}…` : cleaned;
  }
  const kindLabel = catalogKindLabel(kind).toLowerCase();
  return `${repo.name} — a SavigeSystemZ ${kindLabel} with mirrored GitHub source and a public foundry catalog entry.`;
}

function defaultDetails(kind: CatalogKind, repo: RepoCatalogInput): string {
  const cleaned = repo.description?.trim();
  const lang = repo.primaryLanguage?.trim();
  const kindLabel = catalogKindLabel(kind).toLowerCase();
  const parts = [
    cleaned,
    lang ? `Built primarily in ${lang}.` : null,
    `Tracked as a ${kindLabel} in the SavigeSystemZ foundry with GitHub source mirror, showcase media, and v0.1.0 release lane.`,
  ].filter(Boolean);
  return parts.join(" ");
}

function inferNameBasedOverride(repo: RepoCatalogInput): Partial<FlagshipApplicationSeed> | null {
  if (repo.description?.trim()) return null;
  const kind = catalogKindForGithubRepo(repo.githubRepo);
  const name = repo.name;
  return {
    tagline: `${name} — ${catalogKindLabel(kind).toLowerCase()} in the SavigeSystemZ GitHub org with foundry catalog tracking.`,
    details: `${name} is tracked in the SavigeSystemZ foundry catalog with mirrored GitHub source, showcase media, v0.1.0 release lane, and pricing marked TBD.${repo.primaryLanguage ? ` Primary language: ${repo.primaryLanguage}.` : ""}`,
    highlights: [
      repo.primaryLanguage ?? "GitHub mirror",
      "Catalog entry",
      "Release lane",
      catalogKindLabel(kind),
    ],
    surfaceAreas: ["Catalog page", "Source repository", "Release notes", "Showcase media"],
    stackItems: repo.primaryLanguage ? [repo.primaryLanguage, "GitHub mirror"] : ["GitHub mirror", "SavigeSystemZ catalog"],
  };
}

export function getRichCatalogOverride(repo: RepoCatalogInput): Partial<FlagshipApplicationSeed> {
  const layers = [
    FEATURED_CATALOG_OVERRIDES[repo.githubRepo],
    EXTENDED_CATALOG_OVERRIDES[repo.githubRepo],
    BASE44_REPO_OVERRIDES[repo.githubRepo],
    inferNameBasedOverride(repo),
  ].filter(Boolean) as Partial<FlagshipApplicationSeed>[];

  return Object.assign({}, ...layers);
}

/** @deprecated Use FEATURED_CATALOG_OVERRIDES / getRichCatalogOverride — kept for legacy imports. */
export const CATALOG_OVERRIDES = FEATURED_CATALOG_OVERRIDES;

export function buildCatalogSeedFromRepo(repo: RepoCatalogInput): FlagshipApplicationSeed {
  const kind = catalogKindForGithubRepo(repo.githubRepo);
  const override = getRichCatalogOverride(repo);
  const summary = override.summary ?? defaultSummary(kind, repo);
  const stackFromLang = repo.primaryLanguage?.trim() ? [repo.primaryLanguage.trim()] : [];

  const base: FlagshipApplicationSeed = {
    slug: applicationSlugFromGithubRepo(repo.githubRepo),
    name: repo.name,
    githubRepo: repo.githubRepo,
    summary,
    label: override.label ?? (kind === "application" ? "Application" : catalogKindLabel(kind)),
    tagline: override.tagline ?? defaultTagline(kind, repo),
    audience: override.audience ?? defaultAudience(kind),
    priceLabel: CATALOG_PRICE_LABEL,
    releaseChannel: override.releaseChannel ?? "Catalog entry",
    details: override.details ?? defaultDetails(kind, repo),
    highlights: override.highlights ?? defaultHighlights(kind, repo),
    surfaceAreas: override.surfaceAreas ?? defaultSurfaces(kind),
    stackItems: override.stackItems ?? stackFromLang,
    featured: override.featured ?? FEATURED_GITHUB_REPOS.has(repo.githubRepo),
  };

  return { ...base, ...override, priceLabel: CATALOG_PRICE_LABEL, githubRepo: repo.githubRepo };
}

export function buildCatalogSeedsFromRepos(repos: RepoCatalogInput[]): FlagshipApplicationSeed[] {
  const seeds: FlagshipApplicationSeed[] = [];
  const seen = new Set<string>();

  for (const repo of repos) {
    if (EXCLUDED_GITHUB_REPOS.has(repo.githubRepo)) continue;
    const seed = buildCatalogSeedFromRepo(repo);
    if (seen.has(seed.slug)) continue;
    seen.add(seed.slug);
    seeds.push(seed);
  }

  return seeds.sort((a, b) => a.name.localeCompare(b.name));
}
