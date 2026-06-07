import { describe, expect, it } from "vitest";
import { catalogShowcasePaths, renderCatalogShowcaseSvg } from "@/lib/catalog-showcase-svg";

describe("catalog-showcase-svg", () => {
  it("renders unique hero and preview SVG frames", () => {
    const hero = renderCatalogShowcaseSvg({
      slug: "budgetbeacon",
      name: "BudgetBeacon",
      githubRepo: "BudgetBeacon",
      summary: "Personal finance tooling",
      primaryLanguage: "Shell",
      variant: "hero",
    });
    const preview = renderCatalogShowcaseSvg({
      slug: "budgetbeacon",
      name: "BudgetBeacon",
      githubRepo: "BudgetBeacon",
      summary: "Personal finance tooling",
      primaryLanguage: "Shell",
      variant: "preview",
    });

    expect(hero).toContain("BudgetBeacon");
    expect(preview).toContain("PROJECT PREVIEW");
    expect(hero).not.toEqual(preview);
  });

  it("maps featured slugs to custom hero art and generated previews", () => {
    expect(catalogShowcasePaths("immortality").hero).toBe("/showcase/immortality-oracle-grid.svg");
    expect(catalogShowcasePaths("immortality").preview).toBe("/showcase/generated/immortality-preview.svg");
    expect(catalogShowcasePaths("budgetbeacon").hero).toBe("/showcase/generated/budgetbeacon.svg");
  });
});
