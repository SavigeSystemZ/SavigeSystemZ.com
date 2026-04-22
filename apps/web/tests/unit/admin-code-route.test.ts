import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetAuthContext,
  mockRequireOwner,
  mockWriteAuditLog,
  mockSetCodeRepositoryApplicationLinks,
  mockSafeParse,
  mockCodeRepositoryUpdate,
} = vi.hoisted(() => ({
  mockGetAuthContext: vi.fn(),
  mockRequireOwner: vi.fn(),
  mockWriteAuditLog: vi.fn(),
  mockSetCodeRepositoryApplicationLinks: vi.fn(),
  mockSafeParse: vi.fn(),
  mockCodeRepositoryUpdate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthContext: mockGetAuthContext,
  requireOwner: mockRequireOwner,
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: mockWriteAuditLog,
}));

vi.mock("@/lib/code-repository", () => ({
  codeRepositoryPatchSchema: { safeParse: mockSafeParse },
  setCodeRepositoryApplicationLinks: mockSetCodeRepositoryApplicationLinks,
  syncCodeRepository: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    codeRepository: {
      update: mockCodeRepositoryUpdate,
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { PATCH } from "@/app/api/admin/code/[id]/route";

describe("PATCH /api/admin/code/[id]", () => {
  beforeEach(() => {
    mockGetAuthContext.mockReset();
    mockRequireOwner.mockReset();
    mockWriteAuditLog.mockReset();
    mockSetCodeRepositoryApplicationLinks.mockReset();
    mockSafeParse.mockReset();
    mockCodeRepositoryUpdate.mockReset();
    mockGetAuthContext.mockResolvedValue({ userId: "owner_1" });
    mockRequireOwner.mockReturnValue(null);
  });

  it("updates visibility and writes visibility audit log", async () => {
    mockSafeParse.mockReturnValue({ success: true, data: { visibility: "PUBLIC" } });
    mockCodeRepositoryUpdate.mockResolvedValue({
      id: "repo_1",
      visibility: "PUBLIC",
      applications: [],
    });

    const req = new Request("http://localhost/api/admin/code/repo_1", {
      method: "PATCH",
      body: JSON.stringify({ visibility: "PUBLIC" }),
      headers: { "content-type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "repo_1" }) });

    expect(res.status).toBe(200);
    expect(mockSetCodeRepositoryApplicationLinks).not.toHaveBeenCalled();
    expect(mockCodeRepositoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "repo_1" },
        data: { visibility: "PUBLIC" },
      }),
    );
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "code.repository.visibility",
        targetId: "repo_1",
        metadata: { visibility: "PUBLIC" },
      }),
    );
  });
});
