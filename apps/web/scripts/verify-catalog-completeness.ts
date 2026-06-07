/**
 * Verify catalog completeness: repos → apps → media → releases → screenshots.
 *
 * Usage: pnpm code:verify-catalog
 *   --require-screenshots  fail if PNG/JPG missing on disk
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyCatalogCompleteness } from "../lib/verify-catalog-completeness";

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

  const requireScreenshotFile = process.argv.includes("--require-screenshots");
  const requireUiCatalogScreenshots = process.argv.includes("--require-ui-catalog");
  const result = await verifyCatalogCompleteness({
    webRoot,
    requireScreenshotFile,
    requireUiCatalogScreenshots,
  });

  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        expectedRepoCount: result.expectedRepoCount,
        codeRepositoryCount: result.codeRepositoryCount,
        applicationCount: result.applicationCount,
        uiCatalogScreenshotCount: result.uiCatalogScreenshotCount,
        issueCount: result.issues.length,
        issues: result.issues,
      },
      null,
      2,
    ),
  );

  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
