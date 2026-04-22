import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => {
  const codeRepository = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  };
  const application = {
    updateMany: vi.fn(),
    findMany: vi.fn(),
  };
  const db = {
    codeRepository,
    application,
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(db)),
  };
  return { db };
});

vi.mock("@/lib/github-client", () => ({
  parseGithubRepoRef: vi.fn(),
  fetchGithubRepo: vi.fn(),
  fetchGithubLatestCommit: vi.fn(),
}));

import { db } from "@/lib/db";
import {
  fetchGithubLatestCommit,
  fetchGithubRepo,
  parseGithubRepoRef,
} from "@/lib/github-client";
import {
  createCodeRepositoryFromGithub,
  setCodeRepositoryApplicationLinks,
  syncCodeRepository,
} from "@/lib/code-repository";

const mockDb = db as unknown as {
  codeRepository: {
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  application: {
    updateMany: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockParse = parseGithubRepoRef as unknown as ReturnType<typeof vi.fn>;
const mockFetchRepo = fetchGithubRepo as unknown as ReturnType<typeof vi.fn>;
const mockFetchCommit = fetchGithubLatestCommit as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  for (const fn of Object.values(mockDb.codeRepository)) fn.mockReset();
  for (const fn of Object.values(mockDb.application)) fn.mockReset();
  mockDb.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(mockDb));
  mockParse.mockReset();
  mockFetchRepo.mockReset();
  mockFetchCommit.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createCodeRepositoryFromGithub", () => {
  it("rejects an unparseable ref", async () => {
    mockParse.mockReturnValue(null);
    await expect(
      createCodeRepositoryFromGithub({ githubRef: "not a repo" }),
    ).rejects.toThrow(/parse GitHub ref/i);
    expect(mockFetchRepo).not.toHaveBeenCalled();
  });

  it("creates a tracked repository with metadata + latest commit", async () => {
    mockParse.mockReturnValue({ owner: "alice", repo: "portfolio" });
    mockFetchRepo.mockResolvedValue({
      fullName: "alice/portfolio",
      name: "portfolio",
      owner: "alice",
      description: "A little site",
      htmlUrl: "https://github.com/alice/portfolio",
      homepage: null,
      defaultBranch: "main",
      language: "TypeScript",
      stargazersCount: 12,
      forksCount: 3,
      openIssuesCount: 1,
      visibility: "public",
      pushedAt: "2026-04-01T00:00:00Z",
    });
    mockFetchCommit.mockResolvedValue({
      sha: "abc1234def5678",
      message: "Initial scaffold",
      committedAt: "2026-04-01T00:00:00Z",
    });
    mockDb.codeRepository.findFirst.mockResolvedValue(null);
    mockDb.codeRepository.create.mockImplementation(async ({ data }) => ({ id: "repo_1", ...data }));

    const created = await createCodeRepositoryFromGithub({
      githubRef: "alice/portfolio",
      visibility: "PUBLIC",
    });

    expect(created).toMatchObject({
      slug: "alice-portfolio",
      name: "portfolio",
      provider: "GITHUB",
      visibility: "PUBLIC",
      githubOwner: "alice",
      githubRepo: "portfolio",
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
      starCount: 12,
      latestCommitSha: "abc1234def5678",
      syncStatus: "OK",
    });
    expect(mockDb.codeRepository.create).toHaveBeenCalledTimes(1);
  });

  it("refuses to track a repo that already exists", async () => {
    mockParse.mockReturnValue({ owner: "alice", repo: "portfolio" });
    mockFetchRepo.mockResolvedValue({
      fullName: "alice/portfolio",
      name: "portfolio",
      owner: "alice",
      description: null,
      htmlUrl: "https://github.com/alice/portfolio",
      homepage: null,
      defaultBranch: "main",
      language: null,
      stargazersCount: 0,
      forksCount: 0,
      openIssuesCount: 0,
      visibility: "public",
      pushedAt: null,
    });
    mockDb.codeRepository.findFirst.mockResolvedValue({ id: "existing", slug: "alice-portfolio" });

    await expect(
      createCodeRepositoryFromGithub({ githubRef: "alice/portfolio" }),
    ).rejects.toThrow(/already tracked/i);
    expect(mockDb.codeRepository.create).not.toHaveBeenCalled();
  });
});

describe("syncCodeRepository", () => {
  it("records the error on failure instead of throwing", async () => {
    mockDb.codeRepository.findUnique.mockResolvedValue({
      id: "repo_1",
      provider: "GITHUB",
      githubOwner: "alice",
      githubRepo: "portfolio",
      latestCommitSha: "old",
      latestCommitMessage: "old",
      latestCommitAt: new Date("2026-01-01"),
    });
    mockFetchRepo.mockRejectedValue(new Error("GitHub /repos/alice/portfolio → 404 Not Found"));
    mockDb.codeRepository.update.mockImplementation(async ({ data }) => ({
      id: "repo_1",
      syncStatus: data.syncStatus,
      syncError: data.syncError,
    }));

    const result = await syncCodeRepository("repo_1");

    expect(result.syncStatus).toBe("ERROR");
    expect(result.syncError).toMatch(/404/);
    expect(mockDb.codeRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "repo_1" },
        data: expect.objectContaining({ syncStatus: "ERROR" }),
      }),
    );
  });

  it("rejects non-GitHub repositories", async () => {
    mockDb.codeRepository.findUnique.mockResolvedValue({
      id: "repo_2",
      provider: "LOCAL",
      githubOwner: null,
      githubRepo: null,
    });
    await expect(syncCodeRepository("repo_2")).rejects.toThrow(/GitHub-backed/);
  });
});

describe("setCodeRepositoryApplicationLinks", () => {
  it("throws when the repository does not exist", async () => {
    mockDb.codeRepository.findUnique.mockResolvedValue(null);
    await expect(setCodeRepositoryApplicationLinks("missing", ["app_1"])).rejects.toThrow(/not found/i);
    expect(mockDb.application.updateMany).not.toHaveBeenCalled();
  });

  it("clears previously-linked apps not in the new set and sets the new links", async () => {
    mockDb.codeRepository.findUnique.mockResolvedValueOnce({ id: "repo_1" });
    mockDb.application.updateMany.mockResolvedValue({ count: 0 });
    mockDb.codeRepository.findUnique.mockResolvedValueOnce({
      id: "repo_1",
      applications: [{ id: "app_a", slug: "a", name: "A", visibility: "PUBLIC" }],
    });

    const result = await setCodeRepositoryApplicationLinks("repo_1", ["app_a"]);

    expect(mockDb.application.updateMany).toHaveBeenNthCalledWith(1, {
      where: { codeRepositoryId: "repo_1", id: { notIn: ["app_a"] } },
      data: { codeRepositoryId: null },
    });
    expect(mockDb.application.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: { in: ["app_a"] } },
      data: { codeRepositoryId: "repo_1" },
    });
    expect(result?.applications).toHaveLength(1);
  });

  it("clears all links when given an empty array", async () => {
    mockDb.codeRepository.findUnique.mockResolvedValueOnce({ id: "repo_1" });
    mockDb.application.updateMany.mockResolvedValue({ count: 2 });
    mockDb.codeRepository.findUnique.mockResolvedValueOnce({ id: "repo_1", applications: [] });

    await setCodeRepositoryApplicationLinks("repo_1", []);

    expect(mockDb.application.updateMany).toHaveBeenCalledTimes(1);
    expect(mockDb.application.updateMany).toHaveBeenCalledWith({
      where: { codeRepositoryId: "repo_1", id: { notIn: ["__none__"] } },
      data: { codeRepositoryId: null },
    });
  });
});
