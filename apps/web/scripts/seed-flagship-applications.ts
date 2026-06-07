/**
 * Seed public flagship Application rows and link them to tracked GitHub repos.
 *
 * Usage (from repo root):
 *   pnpm code:seed-apps
 *
 * Prerequisite: run `pnpm code:sync-org` first so CodeRepository rows exist.
 * Loads `apps/web/.env.local` then `.env` if present (does not override existing `process.env`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { seedFlagshipApplications } from "../lib/flagship-applications";

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

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required. Start Postgres with ./scripts/dev-postgres.sh or set apps/web/.env.local.");
    process.exit(1);
  }

  console.log("Seeding flagship applications and linking GitHub repos...");
  const result = await seedFlagshipApplications();
  console.log(JSON.stringify(result, null, 2));

  if (result.missingRepos.length > 0) {
    console.error("Missing CodeRepository rows — run `pnpm code:sync-org` first.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
