#!/usr/bin/env node
/**
 * Full foundry bootstrap: GitHub org sync → flagship apps → release lanes.
 * Usage: pnpm code:bootstrap
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(step, args) {
  console.log(`\n==> ${step}`);
  const result = spawnSync("pnpm", args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("Sync GitHub org repositories", ["code:sync-org"]);
run("Seed flagship applications", ["code:seed-apps"]);
run("Generate catalog showcase SVGs", ["code:generate-showcases"]);
run("Fetch GitHub repository screenshots", ["code:fetch-screenshots"]);
run("Seed release lanes (media + versions + assets)", ["code:seed-releases"]);

if (process.env.CAPTURE_UI === "1") {
  run("Capture UI screenshots (catalog + live apps when running)", [
    "code:capture-ui-screenshots",
    "--",
    "--allow-partial",
  ]);
  run("Refresh media URLs after capture", ["code:seed-releases"]);
}

console.log(
  "\nBootstrap complete. Screenshots auto-refresh when older than 7 days (set REFETCH_SCREENSHOTS=1 to force).",
);
console.log("Optional: CAPTURE_UI=1 pnpm code:bootstrap — Playwright capture + media URL sync.");
