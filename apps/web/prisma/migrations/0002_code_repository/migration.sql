-- CreateEnum
CREATE TYPE "CodeRepositoryProvider" AS ENUM ('GITHUB', 'LOCAL');

-- CreateEnum
CREATE TYPE "CodeRepositorySyncStatus" AS ENUM ('PENDING', 'OK', 'ERROR');

-- CreateTable
CREATE TABLE "CodeRepository" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provider" "CodeRepositoryProvider" NOT NULL DEFAULT 'GITHUB',
    "visibility" "ApplicationVisibility" NOT NULL DEFAULT 'DRAFT',
    "githubOwner" TEXT,
    "githubRepo" TEXT,
    "githubUrl" TEXT,
    "defaultBranch" TEXT,
    "homepageUrl" TEXT,
    "primaryLanguage" TEXT,
    "starCount" INTEGER,
    "forkCount" INTEGER,
    "openIssueCount" INTEGER,
    "latestCommitSha" TEXT,
    "latestCommitMessage" TEXT,
    "latestCommitAt" TIMESTAMP(3),
    "syncStatus" "CodeRepositorySyncStatus" NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeRepository_slug_key" ON "CodeRepository"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CodeRepository_provider_githubOwner_githubRepo_key" ON "CodeRepository"("provider", "githubOwner", "githubRepo");

-- CreateIndex
CREATE INDEX "CodeRepository_visibility_provider_idx" ON "CodeRepository"("visibility", "provider");

-- CreateIndex
CREATE INDEX "CodeRepository_updatedAt_idx" ON "CodeRepository"("updatedAt");
