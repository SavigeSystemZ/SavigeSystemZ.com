import { describe, expect, it } from "vitest";
import { buildCatalogMediaCopy } from "@/lib/catalog-media-copy";
import { buildCatalogSeedFromRepo } from "@/lib/catalog-from-repos";

describe("catalog-media-copy", () => {
  it("builds descriptive screenshot copy from repo metadata", () => {
    const app = buildCatalogSeedFromRepo({
      githubRepo: "Immortality",
      name: "Immortality",
      description: "Longevity intelligence platform.",
      primaryLanguage: "TypeScript",
    });
    const copy = buildCatalogMediaCopy(app, {
      primaryLanguage: "TypeScript",
      description: "Longevity intelligence platform.",
      defaultBranch: "main",
      starCount: 12,
    });
    expect(copy.screenshot.title).toMatch(/GitHub repository snapshot/i);
    expect(copy.screenshot.description).toMatch(/Immortality/i);
    expect(copy.screenshot.description).toMatch(/TypeScript/i);
    expect(copy.screenshot.description).toMatch(/main/i);
  });
});
