-- AlterTable
ALTER TABLE "Application" ADD COLUMN "codeRepositoryId" TEXT;

-- CreateIndex
CREATE INDEX "Application_codeRepositoryId_idx" ON "Application"("codeRepositoryId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_codeRepositoryId_fkey" FOREIGN KEY ("codeRepositoryId") REFERENCES "CodeRepository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
