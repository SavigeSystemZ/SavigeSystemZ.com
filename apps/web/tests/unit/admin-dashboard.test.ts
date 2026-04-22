import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockApplicationFindMany,
  mockArchiveFindMany,
  mockCodeRepositoryCount,
  mockCodeRepositoryFindMany,
  mockCreatorSubmissionCount,
  mockCreatorSubmissionFindMany,
  mockProjectRequestCount,
  mockProjectRequestFindMany,
  mockAuditLogFindMany,
} = vi.hoisted(() => ({
  mockApplicationFindMany: vi.fn(),
  mockArchiveFindMany: vi.fn(),
  mockCodeRepositoryCount: vi.fn(),
  mockCodeRepositoryFindMany: vi.fn(),
  mockCreatorSubmissionCount: vi.fn(),
  mockCreatorSubmissionFindMany: vi.fn(),
  mockProjectRequestCount: vi.fn(),
  mockProjectRequestFindMany: vi.fn(),
  mockAuditLogFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    application: { findMany: mockApplicationFindMany },
    archiveEntry: { findMany: mockArchiveFindMany },
    codeRepository: { count: mockCodeRepositoryCount, findMany: mockCodeRepositoryFindMany },
    creatorSubmission: { count: mockCreatorSubmissionCount, findMany: mockCreatorSubmissionFindMany },
    projectRequest: { count: mockProjectRequestCount, findMany: mockProjectRequestFindMany },
    auditLog: { findMany: mockAuditLogFindMany },
  },
}));

import { getAdminDashboardSummary } from "@/lib/admin-dashboard";

describe("getAdminDashboardSummary", () => {
  beforeEach(() => {
    mockApplicationFindMany.mockReset();
    mockArchiveFindMany.mockReset();
    mockCodeRepositoryCount.mockReset();
    mockCodeRepositoryFindMany.mockReset();
    mockCreatorSubmissionCount.mockReset();
    mockCreatorSubmissionFindMany.mockReset();
    mockProjectRequestCount.mockReset();
    mockProjectRequestFindMany.mockReset();
    mockAuditLogFindMany.mockReset();
  });

  it("builds fix-next queue from draft blockers and counters", async () => {
    mockApplicationFindMany.mockResolvedValue([
      {
        id: "app_1",
        name: "Draft App",
        slug: "draft-app",
        label: null,
        tagline: null,
        audience: null,
        priceLabel: null,
        releaseChannel: null,
        details: null,
        media: [],
        versions: [],
      },
    ]);
    mockArchiveFindMany.mockResolvedValue([
      {
        id: "arc_1",
        title: "Draft Archive",
        slug: "draft-archive",
        stageLabel: null,
        artifactFormat: null,
        previewImageUrl: null,
        previewThumbnailUrl: null,
        details: null,
        tags: null,
        stackItems: null,
        artifactUrl: null,
        artifactLabel: null,
      },
    ]);
    mockCodeRepositoryCount
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    mockCodeRepositoryFindMany.mockResolvedValue([
      { id: "repo_1", name: "Core Repo", provider: "GITHUB", syncError: "Webhook failed" },
    ]);
    mockCreatorSubmissionCount.mockResolvedValueOnce(3).mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    mockCreatorSubmissionFindMany.mockResolvedValue([
      { id: "sub_1", title: "Neon Toolkit", type: "APPLICATION", status: "PENDING" },
    ]);
    mockProjectRequestCount.mockResolvedValueOnce(4).mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    mockProjectRequestFindMany.mockResolvedValue([
      { id: "req_1", title: "Owner request", status: "PENDING" },
    ]);
    mockAuditLogFindMany
      .mockResolvedValueOnce(Array.from({ length: 20 }).map(() => ({ action: "code.repository.sync-all" })))
      .mockResolvedValueOnce(Array.from({ length: 5 }).map(() => ({ action: "code.repository.sync-all" })));

    const summary = await getAdminDashboardSummary("7d");

    expect(summary.window).toBe("7d");
    expect(summary.generatedAt).toMatch(/T/);
    expect(summary.repoSyncErrorCount).toBe(2);
    expect(summary.pendingModerationCount).toBe(3);
    expect(summary.pendingRequestCount).toBe(4);
    expect(summary.recentAuditAnomalyCount).toBe(1);
    expect(summary.launchBlockerCount).toBeGreaterThan(0);
    expect(summary.fixNext.length).toBeGreaterThan(0);
    expect(summary.fixNext[0]?.severity).toMatch(/critical|high|medium/);
    expect(summary.drilldowns.repoSyncErrors.length).toBe(1);
    expect(summary.drilldowns.pendingModeration.length).toBe(1);
    expect(summary.drilldowns.pendingRequests.length).toBe(1);
    expect(summary.drilldowns.auditAnomalies[0]?.action).toBe("code.repository.sync-all");
    expect(summary.trends.auditAnomalies.delta).toBe(1);
    expect(summary.trends.moderationInflow.delta).toBe(3);
    expect(summary.trends.requestInflow.delta).toBe(3);
    expect(summary.trends.repoErrorInflow.delta).toBe(1);
    expect(summary.spikes.moderationInflow).toBe(true);
    expect(summary.spikes.requestInflow).toBe(true);
    expect(summary.spikes.auditAnomalies).toBe(false);
  });
});
