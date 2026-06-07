import { describe, expect, it } from "vitest";
import { pickCatalogPreviewMedia, sortCatalogMediaForDisplay } from "@/lib/catalog-media-display";
import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";

const screenshot: PublicApplicationMediaRecord = {
  id: "1",
  title: "App — GitHub repository snapshot",
  altText: "screenshot",
  description: "repo snapshot",
  mediaUrl: "/showcase/screenshots/demo.png",
  thumbnailUrl: "/showcase/screenshots/demo.png",
  featured: false,
  sortOrder: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const showcase: PublicApplicationMediaRecord = {
  id: "2",
  title: "App — foundry showcase",
  altText: "showcase",
  description: "showcase art",
  mediaUrl: "/showcase/generated/demo-hero.svg",
  thumbnailUrl: "/showcase/generated/demo-hero.svg",
  featured: true,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("catalog-media-display", () => {
  it("sorts repository screenshots ahead of showcase art", () => {
    const sorted = sortCatalogMediaForDisplay([showcase, screenshot]);
    expect(sorted[0]?.mediaUrl).toContain("/screenshots/");
  });

  it("picks screenshot media for catalog cards", () => {
    expect(pickCatalogPreviewMedia([showcase, screenshot])?.mediaUrl).toContain("/screenshots/");
  });
});
