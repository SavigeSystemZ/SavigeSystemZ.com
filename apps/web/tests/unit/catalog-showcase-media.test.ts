import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { githubOpenGraphImageUrl, resolveScreenshotMediaUrl } from "@/lib/catalog-showcase-media";

const webRoot = path.resolve(process.cwd());

describe("catalog-showcase-media", () => {
  it("builds GitHub Open Graph screenshot URLs", () => {
    expect(githubOpenGraphImageUrl("SavigeSystemZ", "Immortality")).toBe(
      "https://opengraph.githubassets.com/1/SavigeSystemZ/Immortality",
    );
  });

  it("prefers ui-catalog capture when manual tier is absent", () => {
    const slug = "ledgerloop";
    const uiPath = path.join(webRoot, "public", "showcase", "ui-catalog", `${slug}.png`);
    if (!fs.existsSync(uiPath)) {
      return; // capture script not run in this environment
    }
    const manualPath = path.join(webRoot, "public", "showcase", "manual", slug, "preview.png");
    const hadManual = fs.existsSync(manualPath);
    if (hadManual) {
      const url = resolveScreenshotMediaUrl(slug, "LedgerLoop", "SavigeSystemZ", webRoot);
      expect(url).toBe("/showcase/manual/ledgerloop/preview.png");
      return;
    }
    const url = resolveScreenshotMediaUrl(slug, "LedgerLoop", "SavigeSystemZ", webRoot);
    expect(url).toBe("/showcase/ui-catalog/ledgerloop.png");
  });

  it("prefers manual preview.png when present", () => {
    const url = resolveScreenshotMediaUrl("ledgerloop", "LedgerLoop", "SavigeSystemZ", webRoot);
    expect(url).toBe("/showcase/manual/ledgerloop/preview.png");
  });

  it("uses ui-catalog when manual tier is absent", () => {
    const url = resolveScreenshotMediaUrl("immortality", "Immortality", "SavigeSystemZ", webRoot);
    expect(url).toBe("/showcase/ui-catalog/immortality.png");
  });

  it("falls back to GitHub OG when no cached screenshot exists", () => {
    const url = resolveScreenshotMediaUrl("missing-slug-xyz", "MissingRepo", "SavigeSystemZ", "/tmp/web-root");
    expect(url).toContain("opengraph.githubassets.com");
  });
});
