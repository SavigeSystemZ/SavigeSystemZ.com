/**
 * Import public repositories from a GitHub org into CodeRepository rows.
 *
 * Usage (from repo root):
 *   pnpm --filter web code:sync-org
 *   pnpm --filter web code:sync-org -- --org SavigeSystemZ --commits
 *   pnpm --filter web code:sync-org -- --dry-run
 *
 * Loads `apps/web/.env.local` then `.env` if present (does not override existing `process.env`).
 * Optional `GITHUB_TOKEN` raises API rate limits for large org imports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { importOrgCodeRepositoriesFromGithub } from "../lib/code-repository";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_ORG = "SavigeSystemZ";

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

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  const org = readArg("--org") ?? process.env.GITHUB_ORG?.trim() ?? DEFAULT_ORG;
  const fetchLatestCommits = hasFlag("--commits");
  const linkApplications = !hasFlag("--no-link-apps");
  const dryRun = hasFlag("--dry-run");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required. Start Postgres with ./scripts/dev-postgres.sh or set apps/web/.env.local.");
    process.exit(1);
  }

  console.log(`Syncing public GitHub org repositories for ${org}...`);
  if (dryRun) {
    const { listGithubOrgRepos } = await import("../lib/github-client");
    const repos = await listGithubOrgRepos(org);
    console.log(`Dry run: would import ${repos.length} public repositories.`);
    for (const repo of repos.slice(0, 10)) {
      console.log(`  - ${repo.fullName}${repo.description ? `: ${repo.description}` : ""}`);
    }
    if (repos.length > 10) console.log(`  ... and ${repos.length - 10} more`);
    return;
  }

  const result = await importOrgCodeRepositoriesFromGithub(org, {
    visibility: "PUBLIC",
    linkApplicationsBySlug: linkApplications,
    fetchLatestCommits,
  });

  console.log(
    JSON.stringify(
      {
        org: result.org,
        created: result.created,
        updated: result.updated,
        linked: result.linked,
        skipped: result.skipped,
        errors: result.errors,
      },
      null,
      2,
    ),
  );

  if (result.errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
