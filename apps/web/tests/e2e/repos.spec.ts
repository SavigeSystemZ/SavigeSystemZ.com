import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Public Repositories", () => {
  test.beforeAll(async () => {
    // Seed some repos
    await prisma.codeRepository.createMany({
      data: [
        {
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
        {
          id: "repo-priv-1",
          slug: "test-private-repo",
          name: "Test Private Repo",
          description: "A test repository that is private",
          visibility: "PRIVATE",
          storageBackend: "SELF_HOSTED",
          syncStatus: "OK",
        },
      ],
      skipDuplicates: true,
    });
  });

  test.afterAll(async () => {
    await prisma.codeRepository.deleteMany({
      where: { id: { in: ["repo-pub-1", "repo-priv-1"] } },
    });
    await prisma.$disconnect();
  });

  test("lists only public repositories on the index page", async ({ page }) => {
    await page.goto("/repos");
    
    // Should see the public repo
    await expect(page.getByRole("heading", { name: "Test Public Repo" })).toBeVisible();
    await expect(page.getByText("A test repository that is public")).toBeVisible();
    
    // Should not see the private repo
    await expect(page.getByRole("heading", { name: "Test Private Repo" })).not.toBeVisible();
    
    // Check signals
    await expect(page.getByText("TypeScript")).toBeVisible();
    await expect(page.getByText("Stars: 42")).toBeVisible();
    
    // Check navigation
    await page.getByRole("link", { name: "Open repository" }).click();
    await expect(page).toHaveURL(/\/repos\/test-public-repo/);
  });
});
