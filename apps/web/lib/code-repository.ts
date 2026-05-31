import { z } from "zod";
import { db } from "@/lib/db";
import {
  fetchGithubLatestCommit,
  fetchGithubRepo,
  parseGithubRepoRef,
} from "@/lib/github-client";

export const codeRepositoryCreateSchema = z.object({
  githubRef: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "DRAFT"]).optional(),
});

export type CodeRepositoryCreateInput = z.infer<typeof codeRepositoryCreateSchema>;

export const codeRepositoryPatchSchema = z.object({
  applicationIds: z.array(z.string().min(1).max(64)).max(50).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "DRAFT"]).optional(),
}).refine((input) => input.applicationIds !== undefined || input.visibility !== undefined, {
  message: "At least one field must be provided",
});

export type CodeRepositoryPatchInput = z.infer<typeof codeRepositoryPatchSchema>;

function toSlug(owner: string, repo: string): string {
  return `${owner}-${repo}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export async function createCodeRepositoryFromGithub(input: CodeRepositoryCreateInput) {
  const ref = parseGithubRepoRef(input.githubRef);
  if (!ref) {
    throw new Error("Could not parse GitHub ref — use `owner/repo` or a github.com URL.");
  }

  const repo = await fetchGithubRepo(ref.owner, ref.repo);
  const slug = input.slug ?? toSlug(repo.owner, repo.name);

  const existing = await db.codeRepository.findFirst({
    where: {
      OR: [
        { slug },
        { provider: "GITHUB", githubOwner: repo.owner, githubRepo: repo.name },
      ],
    },
  });
  if (existing) {
    throw new Error(`Repository already tracked (slug=${existing.slug}).`);
  }

  const latest = await fetchGithubLatestCommit(repo.owner, repo.name, repo.defaultBranch);

  return db.codeRepository.create({
    data: {
      slug,
      name: repo.name,
      description: repo.description ?? null,
      provider: "GITHUB",
      visibility: input.visibility ?? "DRAFT",
      githubOwner: repo.owner,
      githubRepo: repo.name,
      githubUrl: repo.htmlUrl,
      defaultBranch: repo.defaultBranch ?? null,
      homepageUrl: repo.homepage ?? null,
      primaryLanguage: repo.language ?? null,
      starCount: repo.stargazersCount,
      forkCount: repo.forksCount,
      openIssueCount: repo.openIssuesCount,
      latestCommitSha: latest?.sha ?? null,
      latestCommitMessage: latest?.message ?? null,
      latestCommitAt: latest?.committedAt ? new Date(latest.committedAt) : null,
      syncStatus: "OK",
      syncError: null,
      lastSyncedAt: new Date(),
    },
  });
}

export async function syncCodeRepository(id: string, options?: { force?: boolean }) {
  const row = await db.codeRepository.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");

  if (!options?.force && row.syncStatus === "OK" && row.lastSyncedAt) {
    if (Date.now() - row.lastSyncedAt.getTime() < 5 * 60 * 1000) {
      return row; // debounce sync if recent
    }
  }
  if (row.provider !== "GITHUB" || !row.githubOwner || !row.githubRepo) {
    throw new Error("Only GitHub-backed repositories can be synced.");
  }
  try {
    const repo = await fetchGithubRepo(row.githubOwner, row.githubRepo);
    const latest = await fetchGithubLatestCommit(repo.owner, repo.name, repo.defaultBranch);
    return await db.codeRepository.update({
      where: { id },
      data: {
        name: repo.name,
        description: repo.description ?? null,
        githubUrl: repo.htmlUrl,
        defaultBranch: repo.defaultBranch ?? null,
        homepageUrl: repo.homepage ?? null,
        primaryLanguage: repo.language ?? null,
        starCount: repo.stargazersCount,
        forkCount: repo.forksCount,
        openIssueCount: repo.openIssuesCount,
        latestCommitSha: latest?.sha ?? row.latestCommitSha,
        latestCommitMessage: latest?.message ?? row.latestCommitMessage,
        latestCommitAt: latest?.committedAt ? new Date(latest.committedAt) : row.latestCommitAt,
        syncStatus: "OK",
        syncError: null,
        lastSyncedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return db.codeRepository.update({
      where: { id },
      data: { syncStatus: "ERROR", syncError: message, lastSyncedAt: new Date() },
    });
  }
}

export async function syncCodeRepositoryByGithubRef(owner: string, repo: string, options?: { force?: boolean }) {
  const row = await db.codeRepository.findFirst({
    where: { provider: "GITHUB", githubOwner: owner, githubRepo: repo },
  });
  if (!row) {
    throw new Error("Repository not tracked");
  }
  return syncCodeRepository(row.id, options);
}

export async function listCodeRepositories() {
  return db.codeRepository.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      applications: {
        select: { id: true, slug: true, name: true, visibility: true },
        orderBy: [{ name: "asc" }],
      },
    },
  });
}

export async function setCodeRepositoryApplicationLinks(
  repositoryId: string,
  applicationIds: string[],
) {
  const repo = await db.codeRepository.findUnique({ where: { id: repositoryId } });
  if (!repo) throw new Error("Not found");

  const ids = Array.from(new Set(applicationIds));

  return db.$transaction(async (tx) => {
    await tx.application.updateMany({
      where: { codeRepositoryId: repositoryId, id: { notIn: ids.length > 0 ? ids : ["__none__"] } },
      data: { codeRepositoryId: null },
    });
    if (ids.length > 0) {
      await tx.application.updateMany({
        where: { id: { in: ids } },
        data: { codeRepositoryId: repositoryId },
      });
    }
    return tx.codeRepository.findUnique({
      where: { id: repositoryId },
      include: {
        applications: {
          select: { id: true, slug: true, name: true, visibility: true },
          orderBy: [{ name: "asc" }],
        },
      },
    });
  });
}

export async function listApplicationsForLinking() {
  return db.application.findMany({
    select: { id: true, slug: true, name: true, visibility: true, codeRepositoryId: true },
    orderBy: [{ name: "asc" }],
  });
}
