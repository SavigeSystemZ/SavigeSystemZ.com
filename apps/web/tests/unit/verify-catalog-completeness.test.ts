import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    codeRepository: { findMany: vi.fn() },
    application: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/web-root", () => ({
  getWebAppRoot: () => "/tmp/web",
}));

import { db } from "@/lib/db";
import { verifyCatalogCompleteness } from "@/lib/verify-catalog-completeness";

describe("verifyCatalogCompleteness", () => {
  beforeEach(() => {
    vi.mocked(db.codeRepository.findMany).mockReset();
    vi.mocked(db.application.findMany).mockReset();
  });

  it("passes when repos, apps, media, and releases align", async () => {
    vi.mocked(db.codeRepository.findMany).mockResolvedValue([
      {
        id: "repo-1",
        githubRepo: "Immortality",
        slug: "savigesystemz-immortality",
        applications: [{ id: "app-1", slug: "immortality", visibility: "PUBLIC" }],
      },
    ] as never);
    vi.mocked(db.application.findMany).mockResolvedValue([
      {
        id: "app-1",
        slug: "immortality",
        codeRepositoryId: "repo-1",
        media: [
          { id: "m1", title: "Repository preview", mediaUrl: "/showcase/screenshots/immortality.png" },
          { id: "m2", title: "Showcase hero", mediaUrl: "/showcase/generated/immortality-hero.svg" },
        ],
        versions: [{ version: "0.1.0", assets: [{ id: "a1" }] }],
      },
    ] as never);

    const result = await verifyCatalogCompleteness({ requireScreenshotFile: false });
    expect(result.ok).toBe(true);
    expect(result.applicationCount).toBe(1);
  });

  it("reports missing application for catalog repo", async () => {
    vi.mocked(db.codeRepository.findMany).mockResolvedValue([
      {
        id: "repo-1",
        githubRepo: "Immortality",
        slug: "savigesystemz-immortality",
        applications: [],
      },
    ] as never);
    vi.mocked(db.application.findMany).mockResolvedValue([]);

    const result = await verifyCatalogCompleteness();
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === "missing_application")).toBe(true);
  });
});
