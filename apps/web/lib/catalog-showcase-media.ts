import fs from "node:fs";
import path from "node:path";
import { catalogShowcasePaths } from "@/lib/catalog-showcase-svg";
import { getWebAppRoot } from "@/lib/web-root";

export const GITHUB_ORG = "SavigeSystemZ";

/** Hand-uploaded screenshot overrides (paths under `public/showcase/manual/{slug}/`). */
export const MANUAL_SCREENSHOT_BY_SLUG: Record<string, string> = {
  immortality: "/showcase/manual/immortality/preview.png",
  ledgerloop: "/showcase/manual/ledgerloop/preview.png",
  "savigesystemz-com": "/showcase/manual/savigesystemz-com/preview.png",
  etherweave: "/showcase/manual/etherweave/preview.png",
  vetraxis: "/showcase/manual/vetraxis/preview.png",
};

function resolveUiCatalogRelativePath(slug: string, webRoot = getWebAppRoot()): string | null {
  const relative = `/showcase/ui-catalog/${slug}.png`;
  if (fs.existsSync(path.join(webRoot, "public", relative.replace(/^\//, "")))) {
    return relative;
  }
  return null;
}

function resolveManualScreenshotRelativePath(slug: string, webRoot = getWebAppRoot()): string | null {
  const manual = MANUAL_SCREENSHOT_BY_SLUG[slug];
  if (manual && fs.existsSync(path.join(webRoot, "public", manual.replace(/^\//, "")))) {
    return manual;
  }
  const manualDir = path.join(webRoot, "public", "showcase", "manual", slug);
  if (fs.existsSync(manualDir)) {
    const candidates = fs
      .readdirSync(manualDir)
      .filter((name) => /\.(png|webp|jpg|jpeg)$/i.test(name))
      .sort();
    if (candidates[0]) return `/showcase/manual/${slug}/${candidates[0]}`;
  }
  return null;
}

export function githubOpenGraphImageUrl(owner: string, repo: string): string {
  return `https://opengraph.githubassets.com/1/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function cachedScreenshotRelativePath(slug: string): string {
  return `/showcase/screenshots/${slug}.png`;
}

export function cachedScreenshotAbsolutePath(slug: string, webRoot = getWebAppRoot()): string {
  return path.join(webRoot, "public", "showcase", "screenshots", `${slug}.png`);
}

/** Legacy JPG path from earlier bootstrap runs — kept for migration lookups. */
export function legacyCachedScreenshotAbsolutePath(slug: string, webRoot = getWebAppRoot()): string {
  return path.join(webRoot, "public", "showcase", "screenshots", `${slug}.jpg`);
}

export function cachedScreenshotExists(slug: string, webRoot = getWebAppRoot()): boolean {
  return (
    fs.existsSync(cachedScreenshotAbsolutePath(slug, webRoot)) ||
    fs.existsSync(legacyCachedScreenshotAbsolutePath(slug, webRoot))
  );
}

function resolveCachedScreenshotRelativePath(slug: string, webRoot = getWebAppRoot()): string {
  if (fs.existsSync(cachedScreenshotAbsolutePath(slug, webRoot))) {
    return cachedScreenshotRelativePath(slug);
  }
  if (fs.existsSync(legacyCachedScreenshotAbsolutePath(slug, webRoot))) {
    return `/showcase/screenshots/${slug}.jpg`;
  }
  return cachedScreenshotRelativePath(slug);
}

export function resolveScreenshotMediaUrl(
  slug: string,
  githubRepo: string,
  githubOwner: string = GITHUB_ORG,
  webRoot = getWebAppRoot(),
): string {
  const manual = resolveManualScreenshotRelativePath(slug, webRoot);
  if (manual) return manual;
  const uiCatalog = resolveUiCatalogRelativePath(slug, webRoot);
  if (uiCatalog) return uiCatalog;
  if (cachedScreenshotExists(slug, webRoot)) {
    return resolveCachedScreenshotRelativePath(slug, webRoot);
  }
  return githubOpenGraphImageUrl(githubOwner, githubRepo);
}

export type CatalogMediaUrls = {
  hero: string;
  screenshot: string;
  preview: string;
};

export function resolveCatalogMediaUrls(
  slug: string,
  githubRepo: string,
  githubOwner: string = GITHUB_ORG,
  webRoot = getWebAppRoot(),
): CatalogMediaUrls {
  const paths = catalogShowcasePaths(slug);
  return {
    hero: paths.hero,
    screenshot: resolveScreenshotMediaUrl(slug, githubRepo, githubOwner, webRoot),
    preview: paths.preview,
  };
}
