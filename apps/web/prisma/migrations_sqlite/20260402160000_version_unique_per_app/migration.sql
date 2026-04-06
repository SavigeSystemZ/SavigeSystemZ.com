-- CreateIndex
CREATE UNIQUE INDEX "ApplicationVersion_applicationId_version_key" ON "ApplicationVersion"("applicationId", "version");
