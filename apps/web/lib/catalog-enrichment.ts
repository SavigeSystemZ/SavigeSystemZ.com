import { fetchGithubReadme, isGithubMockMode } from "@/lib/github-client";
import type { PublicApplicationDetailRecord } from "@/lib/catalog-resolver";
import { pickCatalogPreviewMedia } from "@/lib/catalog-media-display";

export type CatalogEnrichment = {
  githubDescription: string | null;
  primaryLanguage: string | null;
  starCount: number | null;
  forkCount: number | null;
  openIssueCount: number | null;
  latestCommitMessage: string | null;
  latestCommitSha: string | null;
  defaultBranch: string | null;
  readmeExcerpt: string | null;
  aboutText: string;
  ogImageUrl: string | null;
};

const readmeCache = new Map<string, string | null>();

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`>#~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraphExcerpt(markdown: string, maxLen = 320): string | null {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((block) => stripMarkdown(block))
    .filter((block) => block.length > 40 && !block.startsWith("!"));
  const first = blocks[0];
  if (!first) return null;
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen - 1).trim()}…`;
}

async function loadReadmeExcerpt(owner: string | null, repo: string | null): Promise<string | null> {
  if (!owner || !repo) return null;
  const key = `${owner}/${repo}`;
  if (readmeCache.has(key)) return readmeCache.get(key) ?? null;

  if (isGithubMockMode()) {
    const excerpt = `Mock README excerpt for ${repo} — deterministic catalog enrichment in CI.`;
    readmeCache.set(key, excerpt);
    return excerpt;
  }

  try {
    const readme = await fetchGithubReadme(owner, repo);
    const excerpt = readme?.content ? firstParagraphExcerpt(readme.content) : null;
    readmeCache.set(key, excerpt);
    return excerpt;
  } catch {
    readmeCache.set(key, null);
    return null;
  }
}

export async function buildCatalogEnrichment(
  app: PublicApplicationDetailRecord,
): Promise<CatalogEnrichment> {
  const repo = app.codeRepository;
  const readmeExcerpt = await loadReadmeExcerpt(repo?.githubOwner ?? null, repo?.githubRepo ?? null);
  const preview = pickCatalogPreviewMedia(app.media);

  const parts = [
    app.details?.trim(),
    repo?.description?.trim(),
    readmeExcerpt,
    app.summary?.trim(),
  ].filter((value): value is string => Boolean(value));

  const aboutText = parts.filter((value, index, arr) => arr.indexOf(value) === index).join("\n\n");

  return {
    githubDescription: repo?.description ?? null,
    primaryLanguage: repo?.primaryLanguage ?? null,
    starCount: repo?.starCount ?? null,
    forkCount: repo?.forkCount ?? null,
    openIssueCount: repo?.openIssueCount ?? null,
    latestCommitMessage: repo?.latestCommitMessage ?? null,
    latestCommitSha: repo?.latestCommitSha ?? null,
    defaultBranch: repo?.defaultBranch ?? null,
    readmeExcerpt,
    aboutText: aboutText || app.summary,
    ogImageUrl: preview?.mediaUrl ?? null,
  };
}
