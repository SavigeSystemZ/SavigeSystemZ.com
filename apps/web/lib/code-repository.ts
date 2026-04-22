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

export async function syncCodeRepository(id: string) {
  const row = await db.codeRepository.findUnique({ where: { id } });
  if (!row) throw new Error("Not found");
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

export async function listCodeRepositories() {
  return db.codeRepository.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
}
