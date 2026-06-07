/**
 * Seed release lanes (media, versions, GitHub source archives) for flagship apps.
 *
 * Usage: pnpm code:seed-releases
 * Prerequisite: pnpm code:seed-apps (which requires pnpm code:sync-org).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { seedFlagshipReleases } from "../lib/flagship-releases";

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
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  console.log("Seeding flagship release lanes...");
  const result = await seedFlagshipReleases();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
