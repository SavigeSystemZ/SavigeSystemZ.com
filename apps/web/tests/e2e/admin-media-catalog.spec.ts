import { test, expect } from "@playwright/test";
import { seedOwnerSession } from "./helpers/owner-auth";

test.describe("admin media — catalog screenshot lane", () => {
  test("owner can promote media to primary catalog screenshot", async ({ page, request }) => {
    await seedOwnerSession(request, page);

    const apps = await request.get("/api/admin/applications");
    expect(apps.ok()).toBeTruthy();
    const body = (await apps.json()) as { items: Array<{ id: string; slug: string }> };
    const application = body.items.find((item) => item.slug === "immortality") ?? body.items[0];
    expect(application).toBeTruthy();

    const create = await request.post("/api/admin/application-media", {
      data: {
        applicationId: application.id,
        title: "E2E staging screenshot",
        altText: "E2E staging screenshot",
        description: "Temporary media row for catalog screenshot promotion test",
        mediaUrl: "/showcase/screenshots/immortality.png",
        thumbnailUrl: "/showcase/screenshots/immortality.png",
        featured: false,
        sortOrder: 99,
      },
    });
    expect(create.ok()).toBeTruthy();
    const created = (await create.json()) as { item: { id: string } };

    const promote = await request.post(
      `/api/admin/application-media/${created.item.id}/set-catalog-screenshot`,
    );
    expect(promote.ok()).toBeTruthy();
    const promoted = (await promote.json()) as { item: { title: string; sortOrder: number; featured: boolean } };
    expect(promoted.item.title.toLowerCase()).toContain("repository preview");
    expect(promoted.item.sortOrder).toBe(0);
    expect(promoted.item.featured).toBe(true);

    await request.delete(`/api/admin/application-media/${created.item.id}`);
  });
});
