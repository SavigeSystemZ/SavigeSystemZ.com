-- CreateEnum
CREATE TYPE "CodeRepositoryStorageBackend" AS ENUM ('GITHUB', 'SELF_HOSTED');

-- AlterTable
ALTER TABLE "CodeRepository"
  ADD COLUMN "storageBackend" "CodeRepositoryStorageBackend" NOT NULL DEFAULT 'GITHUB';

-- CreateIndex
CREATE INDEX "CodeRepository_storageBackend_idx" ON "CodeRepository"("storageBackend");

-- CreateTable
CREATE TABLE "DashboardAlert" (
    "id" TEXT NOT NULL,
    "alertKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,

    CONSTRAINT "DashboardAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardAlert_alertKey_key" ON "DashboardAlert"("alertKey");

-- CreateIndex
CREATE INDEX "DashboardAlert_category_idx" ON "DashboardAlert"("category");

-- CreateIndex
CREATE INDEX "DashboardAlert_acknowledgedAt_idx" ON "DashboardAlert"("acknowledgedAt");

-- CreateIndex
CREATE INDEX "DashboardAlert_lastSeenAt_idx" ON "DashboardAlert"("lastSeenAt");
