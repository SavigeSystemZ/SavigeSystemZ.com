import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Public Repositories", () => {
  test.beforeAll(async () => {
    await prisma.codeRepository.upsert({
      where: { id: "repo-pub-1" },
      create: {
        id: "repo-pub-1",
        slug: "test-public-repo",
        name: "Test Public Repo",
        description: "A test repository that is public",
        visibility: "PUBLIC",
        storageBackend: "GITHUB",
        primaryLanguage: "TypeScript",
        starCount: 42,
        latestCommitAt: new Date(),
        syncStatus: "OK",
      },
      update: {
        slug: "test-public-repo",
        name: "Test Public Repo",
        description: "A test repository that is public",
        visibility: "PUBLIC",
        primaryLanguage: "TypeScript",
        starCount: 42,
        latestCommitAt: new Date(),
        syncStatus: "OK",
      },
    });
    await prisma.codeRepository.upsert({
      where: { id: "repo-priv-1" },
      create: {
        id: "repo-priv-1",
        slug: "test-private-repo",
        name: "Test Private Repo",
        description: "A test repository that is private",
        visibility: "PRIVATE",
        storageBackend: "SELF_HOSTED",
        syncStatus: "OK",
      },
      update: {
        visibility: "PRIVATE",
        syncStatus: "OK",
      },
    });
  });

  test.afterAll(async () => {
    await prisma.codeRepository.deleteMany({
      where: { id: { in: ["repo-pub-1", "repo-priv-1"] } },
    });
    await prisma.$disconnect();
  });

  test("lists only public repositories on the index page", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/repos");

    const publicCard = page.locator("[class*='rounded']").filter({
      has: page.getByRole("heading", { name: "Test Public Repo", level: 2 }),
    });
    await expect(publicCard).toBeVisible();
    await expect(publicCard.getByText("A test repository that is public")).toBeVisible();
    await expect(publicCard.getByText("TypeScript")).toBeVisible();
    await expect(publicCard.getByText("42", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Test Private Repo" })).not.toBeVisible();

    await publicCard.getByRole("link", { name: "Open repository" }).click();
    await expect(page).toHaveURL(/\/repos\/test-public-repo/);
  });
});
