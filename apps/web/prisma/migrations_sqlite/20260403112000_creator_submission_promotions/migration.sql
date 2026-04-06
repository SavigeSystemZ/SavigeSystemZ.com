ALTER TABLE "CreatorSubmission"
ADD COLUMN "promotedTargetType" TEXT;

ALTER TABLE "CreatorSubmission"
ADD COLUMN "promotedTargetId" TEXT;

ALTER TABLE "CreatorSubmission"
ADD COLUMN "promotedTargetSlug" TEXT;

ALTER TABLE "CreatorSubmission"
ADD COLUMN "promotedAt" DATETIME;

CREATE INDEX "CreatorSubmission_promotedTargetType_promotedTargetId_idx"
ON "CreatorSubmission"("promotedTargetType", "promotedTargetId");
