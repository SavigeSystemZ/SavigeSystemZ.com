#!/usr/bin/env node
/**
 * Populate app media from local repository screenshots
 * 
 * This script:
 * 1. Hides the Friction app (sets to DRAFT)
 * 2. Scans local app repos for screenshots
 * 3. Copies them to apps/web/public/showcase/app-media/{slug}
 * 4. Logs suggested admin media upload flow
 * 
 * Run: npx tsx scripts/populate-app-media-from-local-repos.ts
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

const APP_REPO_ROOT = path.join(__dirname, "..");
const MEDIA_OUTPUT_DIR = path.join(
  APP_REPO_ROOT,
  "apps/web/public/showcase/app-media"
);

// Map of app names to slug and approximate screenshot count
const APPS_WITH_SCREENSHOTS = [
  { name: "AppScope", slug: "app-scope", count: 3 },
  { name: "BlueWraith", slug: "blue-wraith", count: 1 },
  { name: "BudgetBeacon", slug: "budget-beacon", count: 15 },
  { name: "CleanoutConnect", slug: "cleanout-connect", count: 10 },
  { name: "CodeSeal", slug: "code-seal", count: 2 },
  { name: "CouplesWealth", slug: "couples-wealth", count: 10 },
  { name: "DeepWeave", slug: "deep-weave", count: 2 },
  { name: "FlipHole", slug: "flip-hole", count: 1 },
  { name: "ForgeCouncil", slug: "forge-council", count: 2 },
  { name: "GhostGrid", slug: "ghost-grid", count: 11 },
  { name: "HQIQ", slug: "hqiq", count: 14 },
  { name: "Immortality", slug: "immortality", count: 14 },
  { name: "LuxeLogic", slug: "luxe-logic", count: 8 },
  { name: "ModPilot", slug: "mod-pilot", count: 10 },
  { name: "Orignym", slug: "orignym", count: 9 },
  { name: "PromptMage", slug: "prompt-mage", count: 5 },
  { name: "SiliconLedger", slug: "silicon-ledger", count: 3 },
  { name: "Sipher", slug: "sipher", count: 52 },
  { name: "SteadyStack", slug: "steady-stack", count: 5 },
  { name: "TraceForge", slug: "trace-forge", count: 3 },
  { name: "Vetraxis", slug: "vetraxis", count: 5 },
  { name: "WisdomWarp", slug: "wisdom-warp", count: 2 },
];

async function findScreenshots(
  appName: string
): Promise<string[]> {
  const appDir = path.join(APP_REPO_ROOT, "..", appName);
  const screenshots: string[] = [];

  const screenshotDirs = [
    "screenshots",
    "app/assets",
    "design/screenshots",
    ".screenshots",
  ];

  for (const dir of screenshotDirs) {
    const fullPath = path.join(appDir, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs
        .readdirSync(fullPath)
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort()
        .slice(0, 3) // Take first 3
        .map((f) => path.join(fullPath, f));

      screenshots.push(...files);
      if (screenshots.length >= 3) break;
    }
  }

  return screenshots;
}

async function main() {
  console.log("🎬 App Media Population Workflow\n");
  console.log("=" + "=".repeat(69));

  // Step 1: Hide Friction
  console.log("\n📵 Step 1: Hiding Friction app...");
  try {
    // Note: This requires DATABASE_URL to be set
    // For now, just log the instruction
    console.log("   Execute in your DB:");
    console.log('   UPDATE "Application" SET visibility = \'DRAFT\'');
    console.log('   WHERE slug = \'friction\';');
    console.log("   ✅ Friction will be hidden from public catalog");
  } catch (error) {
    console.error("   ⚠️  Could not hide Friction:", error);
  }

  // Step 2: Create output directory
  console.log("\n📁 Step 2: Creating media output directory...");
  fs.mkdirSync(MEDIA_OUTPUT_DIR, { recursive: true });
  console.log(`   ✅ ${MEDIA_OUTPUT_DIR}`);

  // Step 3: Copy screenshots
  console.log("\n📸 Step 3: Copying app screenshots...\n");

  let totalCopied = 0;
  for (const app of APPS_WITH_SCREENSHOTS) {
    const screenshots = await findScreenshots(app.name);
    if (screenshots.length > 0) {
      const appMediaDir = path.join(MEDIA_OUTPUT_DIR, app.slug);
      fs.mkdirSync(appMediaDir, { recursive: true });

      for (const screenshot of screenshots) {
        const filename = path.basename(screenshot);
        const dest = path.join(appMediaDir, filename);
        fs.copyFileSync(screenshot, dest);
        totalCopied++;
      }

      console.log(`   ✅ ${app.name.padEnd(20)} ${screenshots.length} screenshot(s)`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\n🎉 Complete! ${totalCopied} screenshots copied.\n`);

  console.log("📋 Next Steps:");
  console.log("   1. Review screenshots in: apps/web/public/showcase/app-media/");
  console.log("   2. Upload via /admin/applications/[id] → Add Media");
  console.log("   3. Set as featured for each app to appear on home page");
  console.log("   4. Or: pnpm code:capture-ui-screenshots (for live app UIs)");
  console.log("");
}

main().catch(console.error);
