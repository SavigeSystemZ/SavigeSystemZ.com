-- CreateEnum
CREATE TYPE "PasskeyChallengeKind" AS ENUM ('REGISTRATION', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "ProjectRequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'CLOSED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OWNER');

-- CreateEnum
CREATE TYPE "ApplicationVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'DRAFT');

-- CreateEnum
CREATE TYPE "ArchiveCategory" AS ENUM ('OPERATING_SYSTEM', 'AUTOMATION', 'CONFIGURATION', 'CONTAINER_STACK', 'VIRTUAL_MACHINE', 'MODEL', 'RESEARCH', 'WRITING', 'SECURITY_TOOL');

-- CreateEnum
CREATE TYPE "AssetVisibility" AS ENUM ('PUBLIC', 'ENTITLED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreatorSubmissionType" AS ENUM ('APPLICATION', 'ARCHIVE_ENTRY', 'CONFIG_PACK', 'CONTAINER_STACK', 'MODEL', 'RESEARCH', 'SECURITY_TOOL', 'AUTOMATION');

-- CreateEnum
CREATE TYPE "CreatorSubmissionStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'HOLD', 'REJECTED');

-- CreateEnum
CREATE TYPE "CreatorPromotionTarget" AS ENUM ('APPLICATION', 'ARCHIVE_ENTRY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "label" TEXT,
    "tagline" TEXT,
    "audience" TEXT,
    "priceLabel" TEXT,
    "releaseChannel" TEXT,
    "details" TEXT,
    "highlights" TEXT,
    "surfaceAreas" TEXT,
    "stackItems" TEXT,
    "visibility" "ApplicationVisibility" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "ArchiveCategory" NOT NULL,
    "visibility" "ApplicationVisibility" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "stageLabel" TEXT,
    "artifactFormat" TEXT,
    "previewImageUrl" TEXT,
    "previewThumbnailUrl" TEXT,
    "details" TEXT,
    "tags" TEXT,
    "stackItems" TEXT,
    "artifactUrl" TEXT,
    "artifactLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationMedia" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "s3Bucket" TEXT,
    "s3Key" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationVersion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseAsset" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "s3Bucket" TEXT,
    "s3Key" TEXT,
    "checksum" TEXT,
    "visibility" "AssetVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasskeyCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasskeyCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCheckoutSessionId" TEXT,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasskeyChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" "PasskeyChallengeKind" NOT NULL DEFAULT 'AUTHENTICATION',
    "challenge" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasskeyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "releaseAssetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultArtifact" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payloadCipher" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "VaultArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactEmail" TEXT,
    "status" "ProjectRequestStatus" NOT NULL DEFAULT 'PENDING',
    "sourceIp" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "type" "CreatorSubmissionType" NOT NULL,
    "plannedVisibility" "ApplicationVisibility" NOT NULL DEFAULT 'DRAFT',
    "status" "CreatorSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "contactEmail" TEXT,
    "repoUrl" TEXT,
    "artifactUrl" TEXT,
    "ownerNotes" TEXT,
    "promotedTargetType" "CreatorPromotionTarget",
    "promotedTargetId" TEXT,
    "promotedTargetSlug" TEXT,
    "promotedAt" TIMESTAMP(3),
    "sourceIp" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");

-- CreateIndex
CREATE INDEX "Application_visibility_featured_idx" ON "Application"("visibility", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveEntry_slug_key" ON "ArchiveEntry"("slug");

-- CreateIndex
CREATE INDEX "ArchiveEntry_visibility_featured_category_idx" ON "ArchiveEntry"("visibility", "featured", "category");

-- CreateIndex
CREATE INDEX "ApplicationMedia_applicationId_sortOrder_createdAt_idx" ON "ApplicationMedia"("applicationId", "sortOrder", "createdAt");

-- CreateIndex
CREATE INDEX "ApplicationVersion_applicationId_idx" ON "ApplicationVersion"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationVersion_applicationId_createdAt_idx" ON "ApplicationVersion"("applicationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationVersion_applicationId_version_key" ON "ApplicationVersion"("applicationId", "version");

-- CreateIndex
CREATE INDEX "ReleaseAsset_versionId_idx" ON "ReleaseAsset"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasskeyCredential_credentialId_key" ON "PasskeyCredential"("credentialId");

-- CreateIndex
CREATE INDEX "PasskeyCredential_userId_idx" ON "PasskeyCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "License_stripeCheckoutSessionId_key" ON "License"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "License_userId_applicationId_idx" ON "License"("userId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key" ON "Purchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Purchase_applicationId_idx" ON "Purchase"("applicationId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "Purchase_createdAt_idx" ON "Purchase"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasskeyChallenge_challenge_key" ON "PasskeyChallenge"("challenge");

-- CreateIndex
CREATE INDEX "PasskeyChallenge_expiresAt_idx" ON "PasskeyChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "PasskeyChallenge_userId_idx" ON "PasskeyChallenge"("userId");

-- CreateIndex
CREATE INDEX "DownloadEvent_releaseAssetId_idx" ON "DownloadEvent"("releaseAssetId");

-- CreateIndex
CREATE INDEX "DownloadEvent_userId_idx" ON "DownloadEvent"("userId");

-- CreateIndex
CREATE INDEX "DownloadEvent_createdAt_idx" ON "DownloadEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "VaultArtifact_ownerUserId_createdAt_idx" ON "VaultArtifact"("ownerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectRequest_deletedAt_idx" ON "ProjectRequest"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjectRequest_status_createdAt_idx" ON "ProjectRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectRequest_createdAt_idx" ON "ProjectRequest"("createdAt");

-- CreateIndex
CREATE INDEX "CreatorSubmission_status_createdAt_idx" ON "CreatorSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CreatorSubmission_type_createdAt_idx" ON "CreatorSubmission"("type", "createdAt");

-- CreateIndex
CREATE INDEX "CreatorSubmission_deletedAt_idx" ON "CreatorSubmission"("deletedAt");

-- CreateIndex
CREATE INDEX "CreatorSubmission_promotedTargetType_promotedTargetId_idx" ON "CreatorSubmission"("promotedTargetType", "promotedTargetId");

-- AddForeignKey
ALTER TABLE "ApplicationMedia" ADD CONSTRAINT "ApplicationMedia_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationVersion" ADD CONSTRAINT "ApplicationVersion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseAsset" ADD CONSTRAINT "ReleaseAsset_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ApplicationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasskeyCredential" ADD CONSTRAINT "PasskeyCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasskeyChallenge" ADD CONSTRAINT "PasskeyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadEvent" ADD CONSTRAINT "DownloadEvent_releaseAssetId_fkey" FOREIGN KEY ("releaseAssetId") REFERENCES "ReleaseAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultArtifact" ADD CONSTRAINT "VaultArtifact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

