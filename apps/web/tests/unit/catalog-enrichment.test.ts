import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/github-client", () => ({
  fetchGithubReadme: vi.fn(async () => ({
    sha: "abc",
    path: "README.md",
    content: "# Demo\n\nA longer README paragraph that should become an excerpt for catalog enrichment surfaces.",
  })),
  isGithubMockMode: vi.fn(() => false),
}));

import { buildCatalogEnrichment } from "@/lib/catalog-enrichment";
import type { PublicApplicationDetailRecord } from "@/lib/catalog-resolver";

const baseApp: PublicApplicationDetailRecord = {
  id: "app-1",
  slug: "immortality",
  name: "Immortality",
  summary: "Longevity intelligence platform.",
  details: "Deep operational details for Immortality.",
  visibility: "public",
  featured: true,
  media: [
    {
      id: "m1",
      title: "Repository preview — Immortality",
      altText: "Immortality screenshot",
      description: null,
      mediaUrl: "/showcase/screenshots/immortality.png",
      thumbnailUrl: null,
      featured: true,
      sortOrder: 0,
      createdAt: "2026-06-07T00:00:00.000Z",
    },
  ],
  versions: [],
  codeRepository: {
    id: "repo-1",
    slug: "savigesystemz-immortality",
    name: "Immortality",
    description: "GitHub description for Immortality.",
    storageBackend: "GITHUB",
    githubUrl: "https://github.com/SavigeSystemZ/Immortality",
    githubOwner: "SavigeSystemZ",
    githubRepo: "Immortality",
    defaultBranch: "main",
    primaryLanguage: "TypeScript",
    starCount: 12,
    forkCount: 2,
    openIssueCount: 1,
    latestCommitSha: "abc1234",
    latestCommitMessage: "chore: sync catalog",
    latestCommitAt: "2026-06-07T00:00:00.000Z",
  },
};

describe("buildCatalogEnrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges details, GitHub metadata, and README excerpt", async () => {
    const enrichment = await buildCatalogEnrichment(baseApp);
    expect(enrichment.aboutText).toContain("Deep operational details");
    expect(enrichment.readmeExcerpt).toMatch(/README paragraph/);
    expect(enrichment.primaryLanguage).toBe("TypeScript");
    expect(enrichment.ogImageUrl).toBe("/showcase/screenshots/immortality.png");
  });
});
