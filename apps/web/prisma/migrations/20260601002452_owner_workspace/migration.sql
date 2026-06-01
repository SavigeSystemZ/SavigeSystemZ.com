-- CreateEnum
CREATE TYPE "ArtifactScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "OwnerProjectStatus" AS ENUM ('IDEA', 'ACTIVE', 'PAUSED', 'SHIPPED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OwnerProjectPriority" AS ENUM ('LOW', 'MED', 'HIGH');

-- CreateEnum
CREATE TYPE "OwnerArtifactKind" AS ENUM ('FILE', 'LINK', 'REPO_POINTER', 'IMAGE');

-- AlterTable
ALTER TABLE "VaultArtifact" ADD COLUMN     "scanError" TEXT,
ADD COLUMN     "scanStatus" "ArtifactScanStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "OwnerProject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "OwnerProjectStatus" NOT NULL DEFAULT 'IDEA',
    "priority" "OwnerProjectPriority" NOT NULL DEFAULT 'MED',
    "startedAt" TIMESTAMP(3),
    "targetAt" TIMESTAMP(3),
    "linkedApplicationId" TEXT,
    "linkedArchiveEntryId" TEXT,
    "linkedCodeRepositoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerArtifact" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "OwnerArtifactKind" NOT NULL,
    "name" TEXT NOT NULL,
    "s3Key" TEXT,
    "externalUrl" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "scanStatus" "ArtifactScanStatus" NOT NULL DEFAULT 'PENDING',
    "scanError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerTag" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "OwnerTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerJournal" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToJournal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToJournal_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerProject_slug_key" ON "OwnerProject"("slug");

-- CreateIndex
CREATE INDEX "OwnerProject_status_idx" ON "OwnerProject"("status");

-- CreateIndex
CREATE INDEX "OwnerProject_priority_idx" ON "OwnerProject"("priority");

-- CreateIndex
CREATE INDEX "OwnerNote_projectId_pinned_idx" ON "OwnerNote"("projectId", "pinned");

-- CreateIndex
CREATE INDEX "OwnerNote_createdAt_idx" ON "OwnerNote"("createdAt");

-- CreateIndex
CREATE INDEX "OwnerArtifact_projectId_idx" ON "OwnerArtifact"("projectId");

-- CreateIndex
CREATE INDEX "OwnerArtifact_kind_idx" ON "OwnerArtifact"("kind");

-- CreateIndex
CREATE INDEX "OwnerArtifact_scanStatus_idx" ON "OwnerArtifact"("scanStatus");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerTag_projectId_label_key" ON "OwnerTag"("projectId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerJournal_date_key" ON "OwnerJournal"("date");

-- CreateIndex
CREATE INDEX "_ProjectToJournal_B_index" ON "_ProjectToJournal"("B");

-- CreateIndex
CREATE INDEX "VaultArtifact_scanStatus_idx" ON "VaultArtifact"("scanStatus");

-- AddForeignKey
ALTER TABLE "OwnerNote" ADD CONSTRAINT "OwnerNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OwnerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerArtifact" ADD CONSTRAINT "OwnerArtifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OwnerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerTag" ADD CONSTRAINT "OwnerTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OwnerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToJournal" ADD CONSTRAINT "_ProjectToJournal_A_fkey" FOREIGN KEY ("A") REFERENCES "OwnerJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToJournal" ADD CONSTRAINT "_ProjectToJournal_B_fkey" FOREIGN KEY ("B") REFERENCES "OwnerProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
