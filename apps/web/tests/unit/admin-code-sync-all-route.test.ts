import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAuthContext, mockRequireOwner, mockWriteAuditLog, mockListCodeRepositories, mockSyncCodeRepository } =
  vi.hoisted(() => ({
    mockGetAuthContext: vi.fn(),
    mockRequireOwner: vi.fn(),
    mockWriteAuditLog: vi.fn(),
    mockListCodeRepositories: vi.fn(),
    mockSyncCodeRepository: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  getAuthContext: mockGetAuthContext,
  requireOwner: mockRequireOwner,
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: mockWriteAuditLog,
}));

vi.mock("@/lib/code-repository", () => ({
  listCodeRepositories: mockListCodeRepositories,
  syncCodeRepository: mockSyncCodeRepository,
}));

import { POST } from "@/app/api/admin/code/sync-all/route";

describe("POST /api/admin/code/sync-all", () => {
  beforeEach(() => {
    mockGetAuthContext.mockReset();
    mockRequireOwner.mockReset();
    mockWriteAuditLog.mockReset();
    mockListCodeRepositories.mockReset();
    mockSyncCodeRepository.mockReset();
    mockGetAuthContext.mockResolvedValue({ userId: "owner_1" });
    mockRequireOwner.mockReturnValue(null);
  });

  it("syncs repositories serially and writes one audit entry", async () => {
    mockListCodeRepositories.mockResolvedValue([{ id: "repo_1" }, { id: "repo_2" }]);
    mockSyncCodeRepository
      .mockResolvedValueOnce({ id: "repo_1", syncStatus: "OK", syncError: null })
      .mockResolvedValueOnce({ id: "repo_2", syncStatus: "ERROR", syncError: "rate limit" });

    const response = await POST();
    const body = (await response.json()) as {
      results: Array<{ id: string; syncStatus: "OK" | "ERROR"; syncError: string | null }>;
    };

    expect(response.status).toBe(200);
    expect(mockSyncCodeRepository).toHaveBeenCalledTimes(2);
    expect(body.results).toEqual([
      { id: "repo_1", syncStatus: "OK", syncError: null },
      { id: "repo_2", syncStatus: "ERROR", syncError: "rate limit" },
    ]);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "code.repository.sync-all",
        metadata: { repositoryIds: ["repo_1", "repo_2"], count: 2 },
      }),
    );
  });
});
