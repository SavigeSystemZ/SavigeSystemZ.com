import { test, expect } from "@playwright/test";
import { seedOwnerSession } from "./helpers/owner-auth";

test.describe("staging presign smoke", () => {
  test("owner media presign returns 501 without S3 config or 200 when configured", async ({ request, page }) => {
    await seedOwnerSession(request, page);

    const apps = await request.get("/api/admin/applications");
    expect(apps.ok()).toBeTruthy();
    const body = (await apps.json()) as { items: Array<{ id: string; versions: Array<{ id: string }> }> };
    const application = body.items[0];
    expect(application?.id).toBeTruthy();

    const media = await request.post("/api/admin/application-media/s3-upload-url", {
      data: {
        applicationId: application.id,
        fileName: "e2e-probe.png",
        contentType: "image/png",
      },
    });

    const presignConfigured =
      process.env.AWS_S3_PRESIGN_ENABLED === "1" &&
      Boolean(process.env.AWS_S3_MEDIA_BUCKET?.trim() || process.env.AWS_S3_RELEASE_BUCKET?.trim());

    if (presignConfigured) {
      expect(media.status()).toBe(200);
      const payload = (await media.json()) as { uploadUrl?: string };
      expect(payload.uploadUrl).toBeTruthy();
    } else {
      expect(media.status()).toBe(501);
    }

    const version = application.versions[0];
    if (version) {
      const release = await request.post("/api/admin/release-assets/s3-upload-url", {
        data: {
          versionId: version.id,
          fileName: "e2e-probe.zip",
          contentType: "application/zip",
        },
      });
      if (presignConfigured) {
        expect(release.status()).toBe(200);
      } else {
        expect(release.status()).toBe(501);
      }
    }
  });
});
