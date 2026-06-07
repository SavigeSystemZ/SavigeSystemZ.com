/**
 * Cache GitHub Open Graph social preview images as local JPG screenshots.
 *
 * Usage: pnpm code:fetch-screenshots
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFullCatalogSeeds } from "../lib/flagship-applications";
import {
  cachedScreenshotAbsolutePath,
  githubOpenGraphImageUrl,
  GITHUB_ORG,
} from "../lib/catalog-showcase-media";
import { isGithubMockMode } from "../lib/github-client";
import { writeMockScreenshotPng } from "../lib/mock-screenshot-png";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(webRoot, "public", "showcase", "screenshots");

function applyEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, attempts = 4): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "SavigeSystemZ-catalog-bootstrap/1.0" },
      });
      if (response.status === 429) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      await sleep(800 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("fetch_failed");
}

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const seeds = await buildFullCatalogSeeds();
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const seed of seeds) {
    const target = cachedScreenshotAbsolutePath(seed.slug, webRoot);
    const legacyTarget = path.join(outputDir, `${seed.slug}.jpg`);
    const force = process.env.REFETCH_SCREENSHOTS === "1";
    const ageMs = fs.existsSync(target) ? Date.now() - fs.statSync(target).mtimeMs : Number.POSITIVE_INFINITY;
    if (!force && ageMs < 7 * 24 * 60 * 60 * 1000) {
      skipped += 1;
      continue;
    }

    const url = githubOpenGraphImageUrl(GITHUB_ORG, seed.githubRepo);
    try {
      if (isGithubMockMode()) {
        writeMockScreenshotPng(target);
        downloaded += 1;
        continue;
      }

      const response = await fetchWithRetry(url);
      if (!response.ok) {
        failed += 1;
        console.warn(`screenshot fetch failed (${response.status}) for ${seed.githubRepo}`);
        await sleep(900);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? "";
      const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") ? "jpg" : "png";
      const resolvedTarget = path.join(outputDir, `${seed.slug}.${ext}`);
      fs.writeFileSync(resolvedTarget, buffer);
      if (resolvedTarget !== target && fs.existsSync(target)) fs.unlinkSync(target);
      if (fs.existsSync(legacyTarget) && legacyTarget !== resolvedTarget) fs.unlinkSync(legacyTarget);
      downloaded += 1;
    } catch (error) {
      failed += 1;
      console.warn(
        `screenshot fetch error for ${seed.githubRepo}: ${error instanceof Error ? error.message : error}`,
      );
    }

    await sleep(850);
  }

  console.log(
    JSON.stringify(
      {
        outputDir,
        catalogEntries: seeds.length,
        downloaded,
        skipped,
        failed,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
