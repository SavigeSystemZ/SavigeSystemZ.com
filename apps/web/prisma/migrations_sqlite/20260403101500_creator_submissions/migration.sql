CREATE TABLE "CreatorSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "plannedVisibility" TEXT NOT NULL DEFAULT 'DRAFT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "contactEmail" TEXT,
    "repoUrl" TEXT,
    "artifactUrl" TEXT,
    "ownerNotes" TEXT,
    "sourceIp" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "CreatorSubmission_status_createdAt_idx" ON "CreatorSubmission"("status", "createdAt");
CREATE INDEX "CreatorSubmission_type_createdAt_idx" ON "CreatorSubmission"("type", "createdAt");
CREATE INDEX "CreatorSubmission_deletedAt_idx" ON "CreatorSubmission"("deletedAt");
