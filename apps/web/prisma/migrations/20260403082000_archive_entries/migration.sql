CREATE TABLE "ArchiveEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'DRAFT',
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "ArchiveEntry_slug_key" ON "ArchiveEntry"("slug");
CREATE INDEX "ArchiveEntry_visibility_featured_category_idx" ON "ArchiveEntry"("visibility", "featured", "category");
