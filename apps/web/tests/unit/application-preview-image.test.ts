import { describe, expect, it } from "vitest";
import { pickCatalogPreviewMedia } from "@/lib/catalog-media-display";

describe("ApplicationPreviewImage helpers", () => {
  it("prefers repository screenshot media for preview selection", () => {
    const preview = pickCatalogPreviewMedia([
      {
        id: "1",
        title: "Showcase hero",
        altText: "hero",
        description: null,
        mediaUrl: "/showcase/generated/demo-hero.svg",
        thumbnailUrl: null,
        featured: false,
        sortOrder: 1,
        createdAt: "2026-06-07T00:00:00.000Z",
      },
      {
        id: "2",
        title: "Repository preview — demo",
        altText: "screenshot",
        description: null,
        mediaUrl: "/showcase/screenshots/demo.png",
        thumbnailUrl: null,
        featured: true,
        sortOrder: 0,
        createdAt: "2026-06-07T00:00:00.000Z",
      },
    ]);

    expect(preview?.mediaUrl).toBe("/showcase/screenshots/demo.png");
  });
});
