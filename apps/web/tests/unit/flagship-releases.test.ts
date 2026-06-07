import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => {
  const application = { findUnique: vi.fn() };
  const applicationMedia = { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() };
  const applicationVersion = { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() };
  const releaseAsset = { findFirst: vi.fn(), create: vi.fn() };
  const codeRepository = { findMany: vi.fn() };
  return {
    db: { application, applicationMedia, applicationVersion, releaseAsset, codeRepository },
  };
});

vi.mock("@/lib/flagship-applications", () => ({
  buildFullCatalogSeeds: vi.fn().mockResolvedValue([
    {
      slug: "immortality",
      name: "Immortality",
      githubRepo: "Immortality",
      summary: "Test",
      featured: true,
    },
  ]),
}));

import { db } from "@/lib/db";
import { buildCatalogReleaseSeeds, seedFlagshipReleases } from "@/lib/flagship-releases";

const mockDb = db as unknown as {
  application: { findUnique: ReturnType<typeof vi.fn> };
  codeRepository: { findMany: ReturnType<typeof vi.fn> };
  applicationMedia: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  applicationVersion: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  releaseAsset: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  for (const table of Object.values(mockDb)) {
    for (const fn of Object.values(table)) fn.mockReset();
  }
  mockDb.codeRepository.findMany.mockResolvedValue([
    {
      githubRepo: "Immortality",
      description: "Longevity intelligence platform.",
      primaryLanguage: "TypeScript",
      starCount: 3,
      defaultBranch: "main",
    },
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildCatalogReleaseSeeds", () => {
  it("includes hero + repository screenshot media and public source assets only", async () => {
    const seeds = await buildCatalogReleaseSeeds();
    const immortality = seeds.find((seed) => seed.slug === "immortality");
    expect(immortality?.mediaItems).toHaveLength(2);
    expect(immortality?.mediaItems[0]?.title).toMatch(/repository snapshot/i);
    expect(immortality?.mediaItems[0]?.description).toMatch(/TypeScript/i);
    expect(immortality?.assets.every((asset) => asset.visibility === "PUBLIC")).toBe(true);
    expect(immortality?.changelog).toMatch(/TBD/i);
  });
});

describe("seedFlagshipReleases", () => {
  it("creates media, version, and assets for a linked application", async () => {
    mockDb.application.findUnique.mockResolvedValue({
      id: "app_1",
      codeRepository: { githubOwner: "SavigeSystemZ", githubRepo: "Immortality", defaultBranch: "main" },
    });
    mockDb.applicationMedia.findFirst.mockResolvedValue(null);
    mockDb.applicationVersion.findUnique.mockResolvedValue(null);
    mockDb.applicationVersion.create.mockResolvedValue({ id: "ver_1" });
    mockDb.releaseAsset.findFirst.mockResolvedValue(null);

    const result = await seedFlagshipReleases([
      {
        slug: "immortality",
        version: "0.1.0",
        changelog: "Initial release",
        mediaItems: [
          {
            title: "Immortality showcase",
            altText: "Immortality showcase",
            mediaUrl: "/showcase/immortality-oracle-grid.svg",
            featured: true,
            sortOrder: 0,
          },
          {
            title: "Immortality project preview",
            altText: "Immortality preview",
            mediaUrl: "/showcase/generated/immortality-preview.svg",
            featured: false,
            sortOrder: 1,
          },
        ],
        assets: [{ fileName: "immortality-source.zip", visibility: "PUBLIC" }],
      },
    ]);

    expect(result.mediaCreated).toBe(2);
    expect(result.versionsCreated).toBe(1);
    expect(result.assetsCreated).toBe(1);
    expect(mockDb.releaseAsset.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileUrl: "https://github.com/SavigeSystemZ/Immortality/archive/refs/heads/main.zip",
        }),
      }),
    );
  });
});
