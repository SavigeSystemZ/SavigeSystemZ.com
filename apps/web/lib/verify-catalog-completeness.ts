import fs from "node:fs";
import path from "node:path";

import { EXCLUDED_GITHUB_REPOS } from "@/lib/catalog-from-repos";
import {
  cachedScreenshotAbsolutePath,
  cachedScreenshotExists,
  legacyCachedScreenshotAbsolutePath,
} from "@/lib/catalog-showcase-media";
import { db } from "@/lib/db";
import { getWebAppRoot } from "@/lib/web-root";

export type CatalogVerifyIssue = {
  code: string;
  message: string;
};

export type CatalogVerifyResult = {
  ok: boolean;
  expectedRepoCount: number;
  codeRepositoryCount: number;
  applicationCount: number;
  uiCatalogScreenshotCount: number;
  issues: CatalogVerifyIssue[];
};

function uiCatalogScreenshotPath(slug: string, webRoot: string): string {
  return path.join(webRoot, "public", "showcase", "ui-catalog", `${slug}.png`);
}

export async function verifyCatalogCompleteness(options?: {
  webRoot?: string;
  requireScreenshotFile?: boolean;
  requireUiCatalogScreenshots?: boolean;
}): Promise<CatalogVerifyResult> {
  const webRoot = options?.webRoot ?? getWebAppRoot();
  const requireScreenshotFile = options?.requireScreenshotFile ?? false;
  const requireUiCatalogScreenshots = options?.requireUiCatalogScreenshots ?? false;
  const issues: CatalogVerifyIssue[] = [];
  let uiCatalogScreenshotCount = 0;

  const repos = await db.codeRepository.findMany({
    where: {
      provider: "GITHUB",
      githubOwner: "SavigeSystemZ",
      visibility: "PUBLIC",
      githubRepo: { not: null },
    },
    select: {
      id: true,
      githubRepo: true,
      slug: true,
      applications: { select: { id: true, slug: true, visibility: true } },
    },
  });

  const catalogRepos = repos.filter(
    (row): row is typeof row & { githubRepo: string } =>
      typeof row.githubRepo === "string" && !EXCLUDED_GITHUB_REPOS.has(row.githubRepo),
  );

  const applications = await db.application.findMany({
    where: { visibility: "PUBLIC" },
    select: {
      id: true,
      slug: true,
      codeRepositoryId: true,
      media: { select: { id: true, title: true, mediaUrl: true } },
      versions: {
        select: {
          version: true,
          assets: { select: { id: true, visibility: true } },
        },
      },
    },
  });

  const appByRepoId = new Map(
    applications.filter((app) => app.codeRepositoryId).map((app) => [app.codeRepositoryId!, app]),
  );

  for (const repo of catalogRepos) {
    const app = appByRepoId.get(repo.id);
    if (!app) {
      issues.push({
        code: "missing_application",
        message: `No PUBLIC application linked to repo ${repo.githubRepo}`,
      });
      continue;
    }

    if (app.media.length < 2) {
      issues.push({
        code: "missing_media",
        message: `${app.slug}: expected at least 2 media items, found ${app.media.length}`,
      });
    }

    const version = app.versions.find((v) => v.version === "0.1.0");
    if (!version) {
      issues.push({
        code: "missing_version",
        message: `${app.slug}: missing v0.1.0 release lane`,
      });
    } else if (version.assets.length === 0) {
      issues.push({
        code: "missing_assets",
        message: `${app.slug}: v0.1.0 has no release assets`,
      });
    }

    const hasScreenshotMedia = app.media.some(
      (item) =>
        item.mediaUrl.includes("/screenshots/") ||
        item.mediaUrl.includes("/ui-catalog/") ||
        item.mediaUrl.includes("/manual/") ||
        item.mediaUrl.includes("opengraph.githubassets.com") ||
        item.title.toLowerCase().includes("repository"),
    );
    if (!hasScreenshotMedia) {
      issues.push({
        code: "missing_screenshot_media",
        message: `${app.slug}: no repository screenshot media URL in DB`,
      });
    }

    if (requireScreenshotFile && !cachedScreenshotExists(app.slug, webRoot)) {
      const png = cachedScreenshotAbsolutePath(app.slug, webRoot);
      const jpg = legacyCachedScreenshotAbsolutePath(app.slug, webRoot);
      if (!fs.existsSync(png) && !fs.existsSync(jpg)) {
        issues.push({
          code: "missing_screenshot_file",
          message: `${app.slug}: no cached screenshot at ${path.relative(webRoot, png)}`,
        });
      }
    }

    const uiCatalogPath = uiCatalogScreenshotPath(app.slug, webRoot);
    if (fs.existsSync(uiCatalogPath)) {
      uiCatalogScreenshotCount += 1;
    } else if (requireUiCatalogScreenshots) {
      issues.push({
        code: "missing_ui_catalog_screenshot",
        message: `${app.slug}: no UI catalog screenshot at ${path.relative(webRoot, uiCatalogPath)}`,
      });
    }
  }

  const linkedRepoIds = new Set(applications.map((app) => app.codeRepositoryId).filter(Boolean));
  for (const app of applications) {
    if (!app.codeRepositoryId) {
      issues.push({
        code: "orphan_application",
        message: `${app.slug}: application has no codeRepositoryId`,
      });
    } else if (!catalogRepos.some((repo) => repo.id === app.codeRepositoryId)) {
      issues.push({
        code: "orphan_application_repo",
        message: `${app.slug}: linked repository missing or excluded`,
      });
    }
    if (app.codeRepositoryId) linkedRepoIds.delete(app.codeRepositoryId);
  }

  if (applications.length !== catalogRepos.length) {
    issues.push({
      code: "count_mismatch",
      message: `PUBLIC applications (${applications.length}) != catalog repos (${catalogRepos.length})`,
    });
  }

  return {
    ok: issues.length === 0,
    expectedRepoCount: catalogRepos.length,
    codeRepositoryCount: repos.length,
    applicationCount: applications.length,
    uiCatalogScreenshotCount,
    issues,
  };
}
