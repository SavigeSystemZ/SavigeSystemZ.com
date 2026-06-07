import { describe, expect, it } from "vitest";
import { buildCatalogSeedFromRepo, getRichCatalogOverride } from "@/lib/catalog-from-repos";

describe("catalog-rich-copy", () => {
  it("returns featured front-page depth for Immortality", () => {
    const override = getRichCatalogOverride({
      githubRepo: "Immortality",
      name: "Immortality",
      description: "Longevity science intelligence platform",
      primaryLanguage: "TypeScript",
    });
    expect(override.featured).toBe(true);
    expect(override.highlights).toContain("ORACLE AI");
    expect(override.details).toMatch(/compound/i);
  });

  it("returns Base44 mirror copy for -44 repos", () => {
    const seed = buildCatalogSeedFromRepo({
      githubRepo: "VulnFlow-44",
      name: "VulnFlow-44",
      description: "Base44 App: VulnFlow Scanner",
      primaryLanguage: "JavaScript",
    });
    expect(seed.label).toBe("Base44 mirror");
    expect(seed.details).toMatch(/VulnFlow|vulnerability flow/i);
    expect(seed.highlights).toContain("Base44 export");
  });

  it("enriches unnamed shell repos with inferred catalog copy", () => {
    const seed = buildCatalogSeedFromRepo({
      githubRepo: "GhostZ",
      name: "GhostZ",
      description: null,
      primaryLanguage: "Shell",
    });
    expect(seed.details).toMatch(/GhostZ/i);
    expect(seed.highlights?.length).toBeGreaterThan(2);
  });
});
