import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => {
  const codeRepository = { findFirst: vi.fn() };
  const application = { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() };
  return { db: { codeRepository, application } };
});

import { db } from "@/lib/db";
import { FLAGSHIP_APPLICATIONS, seedFlagshipApplications } from "@/lib/flagship-applications";

const mockDb = db as unknown as {
  codeRepository: { findFirst: ReturnType<typeof vi.fn> };
  application: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  mockDb.codeRepository.findFirst.mockReset();
  mockDb.application.findUnique.mockReset();
  mockDb.application.create.mockReset();
  mockDb.application.update.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("seedFlagshipApplications", () => {
  it("creates applications and links repos when missing", async () => {
    mockDb.codeRepository.findFirst.mockResolvedValue({ id: "repo_1" });
    mockDb.application.findUnique.mockResolvedValue(null);
    mockDb.application.create.mockResolvedValue({ id: "app_1" });

    const result = await seedFlagshipApplications([FLAGSHIP_APPLICATIONS[0]]);

    expect(result.created).toBe(1);
    expect(result.linked).toBe(1);
    expect(mockDb.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "immortality",
          visibility: "PUBLIC",
          codeRepositoryId: "repo_1",
        }),
      }),
    );
  });

  it("updates existing applications idempotently", async () => {
    mockDb.codeRepository.findFirst.mockResolvedValue({ id: "repo_1" });
    mockDb.application.findUnique.mockResolvedValue({ id: "app_existing" });
    mockDb.application.update.mockResolvedValue({ id: "app_existing" });

    const result = await seedFlagshipApplications([FLAGSHIP_APPLICATIONS[0]]);

    expect(result.updated).toBe(1);
    expect(result.created).toBe(0);
    expect(mockDb.application.update).toHaveBeenCalled();
  });

  it("records missing repos without failing the batch", async () => {
    mockDb.codeRepository.findFirst.mockResolvedValue(null);

    const result = await seedFlagshipApplications([
      { slug: "missing", name: "Missing", summary: "x", githubRepo: "NoSuchRepo" },
    ]);

    expect(result.missingRepos).toEqual(["NoSuchRepo"]);
    expect(result.linked).toBe(0);
  });
});
