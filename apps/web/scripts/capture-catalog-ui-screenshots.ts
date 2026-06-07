/**
 * Capture UI screenshots for catalog applications.
 *
 * 1. Attempts each app's live dev URL (registry + .env.example inference).
 * 2. Always captures SavigeSystemZ catalog detail pages (/applications/{slug}).
 * 3. Writes a markdown + JSON report for apps that did not launch.
 *
 * Usage:
 *   SITE_URL=http://127.0.0.1:43907 pnpm code:capture-ui-screenshots
 *   pnpm code:capture-ui-screenshots -- --catalog-only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "@playwright/test";

import { buildFullCatalogSeeds } from "../lib/flagship-applications";
import {
  resolveLaunchTargetForCatalog,
  type CatalogLaunchSurface,
} from "../lib/catalog-launch-registry";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

type CaptureStatus =
  | "app_ui_captured"
  | "app_not_running"
  | "app_no_http_surface"
  | "app_launch_error"
  | "catalog_only";

type CaptureResult = {
  slug: string;
  githubRepo: string;
  name: string;
  status: CaptureStatus;
  launchUrl?: string;
  surface: CatalogLaunchSurface;
  appScreenshotPath?: string;
  catalogScreenshotPath?: string;
  detail: string;
  startHint?: string;
};

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

async function probeHttp(url: string, timeoutMs = 4000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function navigateForScreenshot(page: Page, url: string, mode: "catalog" | "app"): Promise<void> {
  const waitUntil = mode === "catalog" ? "networkidle" : "load";
  const timeout = mode === "catalog" ? 45_000 : 30_000;
  try {
    await page.goto(url, { waitUntil, timeout });
  } catch (error) {
    if (mode === "app") {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
      return;
    }
    throw error;
  }
}

async function screenshotPage(page: Page, outputPath: string): Promise<void> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: "png",
  });
}

function resolveLaunchTarget(slug: string, githubRepo: string) {
  return resolveLaunchTargetForCatalog(slug, githubRepo);
}

function writeReport(results: CaptureResult[], siteUrl: string): void {
  const reportDir = path.join(webRoot, "public", "showcase", "reports");
  fs.mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const jsonPath = path.join(reportDir, "ui-screenshot-report.json");
  const mdPath = path.join(webRoot, "..", "..", "docs", "CATALOG_UI_SCREENSHOT_REPORT.md");

  const payload = {
    generatedAt: timestamp,
    siteUrl,
    totals: {
      seeds: results.length,
      appUiCaptured: results.filter((r) => r.status === "app_ui_captured").length,
      catalogCaptured: results.filter((r) => r.catalogScreenshotPath).length,
      blocked: results.filter((r) => r.status !== "app_ui_captured" && r.status !== "catalog_only").length,
    },
    results,
  };

  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);

  const blocked = results.filter((r) => r.status !== "app_ui_captured");
  const lines = [
    "# Catalog UI screenshot report",
    "",
    `Generated: ${timestamp}`,
    "",
    `Site: ${siteUrl}`,
    "",
    "## Summary",
    "",
    `| Metric | Count |`,
    `|--------|------:|`,
    `| Catalog applications | ${results.length} |`,
    `| Live app UI captured | ${payload.totals.appUiCaptured} |`,
    `| Catalog detail captured | ${payload.totals.catalogCaptured} |`,
    `| Needs operator action | ${blocked.length} |`,
    "",
    "## Live app UI captures",
    "",
    ...results
      .filter((r) => r.status === "app_ui_captured")
      .map(
        (r) =>
          `- **${r.name}** (\`${r.slug}\`) — \`${r.appScreenshotPath}\` from ${r.launchUrl}`,
      ),
    blocked.length ? "" : "_None pending — all configured apps responded._",
    "",
    "## Operator follow-up (resolve outside this repo)",
    "",
    ...blocked.map((r) => {
      const parts = [`### ${r.name} (\`${r.slug}\`)`, "", `- **Status:** ${r.status}`, `- **Detail:** ${r.detail}`];
      if (r.launchUrl) parts.push(`- **Expected URL:** ${r.launchUrl}`);
      if (r.startHint) parts.push(`- **Start hint:** ${r.startHint}`);
      if (r.catalogScreenshotPath) parts.push(`- **Catalog fallback:** \`${r.catalogScreenshotPath}\``);
      parts.push("");
      return parts.join("\n");
    }),
    "",
    "## Paths",
    "",
    "- Live app UI (manual tier): `public/showcase/manual/{slug}/preview.png`",
    "- Catalog detail pages: `public/showcase/ui-catalog/{slug}.png`",
    `- Machine-readable: \`public/showcase/reports/ui-screenshot-report.json\``,
    "",
    "Re-run: `SITE_URL=http://127.0.0.1:43907 pnpm code:capture-ui-screenshots`",
    "",
  ];

  fs.writeFileSync(mdPath, lines.join("\n"));
  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, ...payload.totals }, null, 2));
}

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  const catalogOnly = process.argv.includes("--catalog-only");
  const appsOnly = process.argv.includes("--apps-only");
  const allowPartial = process.argv.includes("--allow-partial");
  const onlySlugs = process.argv.flatMap((arg) => {
    const normalized = arg.replace(/^--only\\?=/, "--only=");
    if (!normalized.startsWith("--only=")) return [];
    return normalized
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  });
  const siteUrl = (process.env.SITE_URL ?? "http://127.0.0.1:43907").replace(/\/$/, "");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  if (!(await probeHttp(`${siteUrl}/api/health`))) {
    console.error(`SavigeSystemZ dev server not reachable at ${siteUrl}. Start with: pnpm dev:web`);
    process.exit(1);
  }

  const seeds = (await buildFullCatalogSeeds()).filter(
    (seed) => onlySlugs.length === 0 || onlySlugs.includes(seed.slug),
  );
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const results: CaptureResult[] = [];

  for (const seed of seeds) {
    const { launchUrl, surface, startHint, notes } = resolveLaunchTarget(seed.slug, seed.githubRepo);
    const result: CaptureResult = {
      slug: seed.slug,
      githubRepo: seed.githubRepo,
      name: seed.name,
      status: "catalog_only",
      launchUrl,
      surface,
      startHint,
      detail: "",
    };

    const catalogOut = path.join(webRoot, "public", "showcase", "ui-catalog", `${seed.slug}.png`);
    if (!appsOnly) {
      try {
        const catalogRes = await page.goto(`${siteUrl}/applications/${seed.slug}`, {
          waitUntil: "networkidle",
          timeout: 45_000,
        });
        if (!catalogRes?.ok()) {
          result.detail = `Catalog page HTTP ${catalogRes?.status() ?? "error"}`;
          result.status = "app_launch_error";
        } else {
          await page.waitForTimeout(400);
          await screenshotPage(page, catalogOut);
          result.catalogScreenshotPath = `/showcase/ui-catalog/${seed.slug}.png`;
          result.detail = "Catalog detail page captured on SavigeSystemZ.";
        }
      } catch (error) {
        result.detail = `Catalog page failed: ${error instanceof Error ? error.message : "unknown"}`;
        result.status = "app_launch_error";
      }
    }

    if (!catalogOnly) {
      if (surface === "desktop" || surface === "cli") {
        result.status = "app_no_http_surface";
        result.detail = notes ?? `No HTTP launch surface (${surface}).`;
      } else if (!launchUrl) {
        result.status = "app_no_http_surface";
        result.detail = "No local launch URL in registry or sibling .env.example.";
      } else if (!(await probeHttp(launchUrl))) {
        result.status = "app_not_running";
        result.detail = `Dev server not responding at ${launchUrl}.`;
      } else {
        const manualOut = path.join(webRoot, "public", "showcase", "manual", seed.slug, "preview.png");
        try {
          await navigateForScreenshot(page, launchUrl, "app");
          await page.waitForTimeout(800);
          await screenshotPage(page, manualOut);
          result.appScreenshotPath = `/showcase/manual/${seed.slug}/preview.png`;
          result.status = "app_ui_captured";
          result.detail = `Live app UI captured from ${launchUrl}.`;
        } catch (error) {
          result.status = "app_launch_error";
          result.detail = `App navigation failed: ${error instanceof Error ? error.message : "unknown"}`;
        }
      }
    }

    results.push(result);
    console.log(`[capture] ${seed.slug}: ${result.status}${result.appScreenshotPath ? ` -> ${result.appScreenshotPath}` : ""}`);
  }

  await browser.close();
  writeReport(results, siteUrl);

  const blocked = results.filter((r) => r.status !== "app_ui_captured" && !catalogOnly);
  if (blocked.length > 0) {
    console.error(`\n${blocked.length} application(s) need operator follow-up — see docs/CATALOG_UI_SCREENSHOT_REPORT.md`);
    if (!allowPartial) process.exit(2);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
