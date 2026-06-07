/**
 * Discover local dev launch URLs for catalog apps from ~/.MyAppZ sibling repos.
 *
 * Usage: pnpm code:discover-launches
 *   --json   machine-readable output
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFullCatalogSeeds } from "../lib/flagship-applications";
import {
  discoverLaunchUrlForRepo,
  getCatalogLaunchEntry,
  resolveLaunchTargetForCatalog,
  resolveMyAppZRepoPath,
} from "../lib/catalog-launch-registry";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

async function probeHttp(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const asJson = process.argv.includes("--json");
  const seeds = await buildFullCatalogSeeds();
  const rows = [];

  for (const seed of seeds) {
    const registry = getCatalogLaunchEntry(seed.slug, seed.githubRepo);
    const target = resolveLaunchTargetForCatalog(seed.slug, seed.githubRepo);
    const repoPath = resolveMyAppZRepoPath(seed.githubRepo, registry?.repoDir);
    const repoExists = fs.existsSync(repoPath);
    const inferredOnly = !registry?.launchUrl && Boolean(discoverLaunchUrlForRepo(seed.githubRepo, registry?.repoDir));
    const live = target.launchUrl ? await probeHttp(target.launchUrl) : false;

    rows.push({
      slug: seed.slug,
      githubRepo: seed.githubRepo,
      surface: target.surface,
      launchUrl: target.launchUrl ?? null,
      repoExists,
      source: registry?.launchUrl ? "registry" : inferredOnly ? "env.example" : "none",
      live,
      startHint: target.startHint ?? null,
    });
  }

  const withUrl = rows.filter((r) => r.launchUrl);
  const liveCount = rows.filter((r) => r.live).length;

  if (asJson) {
    console.log(JSON.stringify({ totals: { seeds: rows.length, withUrl: withUrl.length, live: liveCount }, rows }, null, 2));
    return;
  }

  console.log(`Catalog launch discovery — ${liveCount} live / ${withUrl.length} with URL / ${rows.length} total\n`);
  for (const row of rows) {
    const status = row.live ? "LIVE" : row.launchUrl ? "DOWN" : row.surface === "desktop" ? "DESKTOP" : "NO_URL";
    console.log(`${status.padEnd(8)} ${row.slug.padEnd(24)} ${row.launchUrl ?? "—"}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
