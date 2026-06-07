import { describe, expect, it } from "vitest";
import {
  applicationSlugFromGithubRepo,
  buildCatalogSeedFromRepo,
  buildCatalogSeedsFromRepos,
  catalogKindForGithubRepo,
  getCatalogKindFromApplication,
} from "@/lib/catalog-from-repos";

describe("catalog-from-repos", () => {
  it("classifies games, books, and applications", () => {
    expect(catalogKindForGithubRepo("FWST")).toBe("book");
    expect(catalogKindForGithubRepo("SOSTheFirstCrown")).toBe("game");
    expect(catalogKindForGithubRepo("Immortality")).toBe("application");
  });

  it("preserves legacy slugs for flagship apps", () => {
    expect(applicationSlugFromGithubRepo("SavigeSystemZ.com")).toBe("savigesystemz-com");
    expect(applicationSlugFromGithubRepo("AegisWire-44")).toBe("aegiswire-44");
  });

  it("sets pricing to TBD for auto-generated seeds", () => {
    const seed = buildCatalogSeedFromRepo({
      githubRepo: "BudgetBeacon",
      name: "BudgetBeacon",
      description: null,
      primaryLanguage: "Shell",
    });
    expect(seed.priceLabel).toBe("TBD");
    expect(seed.label).toBe("Finance signal");
  });

  it("builds one seed per repo and skips excluded fixtures", () => {
    const seeds = buildCatalogSeedsFromRepos([
      { githubRepo: "Immortality", name: "Immortality", description: "Longevity", primaryLanguage: "TypeScript" },
      { githubRepo: "Hello-World", name: "Hello-World", description: "Fixture", primaryLanguage: null },
      { githubRepo: "FWST", name: "FWST", description: "Fiction factory", primaryLanguage: "Go" },
    ]);
    expect(seeds).toHaveLength(2);
    expect(seeds.find((seed) => seed.slug === "fwst")?.label).toBe("Book");
  });

  it("detects catalog kind from persisted application rows", () => {
    expect(getCatalogKindFromApplication({ slug: "fwst", label: "Book" })).toBe("book");
    expect(getCatalogKindFromApplication({ slug: "sos-the-first-crown", label: "Game" })).toBe("game");
    expect(getCatalogKindFromApplication({ slug: "immortality", label: "Longevity intelligence" })).toBe("application");
  });
});
