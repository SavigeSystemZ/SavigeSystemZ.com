-- CreateTable
CREATE TABLE "VaultArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payloadCipher" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "VaultArtifact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VaultArtifact_ownerUserId_createdAt_idx" ON "VaultArtifact"("ownerUserId", "createdAt");
