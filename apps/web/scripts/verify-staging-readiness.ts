/**
 * Verify staging readiness: env keys + catalog completeness.
 *
 * Usage:
 *   pnpm staging:verify
 *   SITE_URL=http://127.0.0.1:43907 pnpm staging:verify -- --probe-http
 *   SITE_URL=http://127.0.0.1:43907 pnpm staging:verify -- --probe-http --probe-presign
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mergeStagingReport, evaluateStagingEnvReadiness } from "../lib/staging-readiness";
import { probeHttpHealth, probePresignRoutes } from "../lib/staging-probes";
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

  const probeHttp = process.argv.includes("--probe-http");
  const probePresign = process.argv.includes("--probe-presign");
  const envReport = evaluateStagingEnvReadiness();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error(JSON.stringify({ ok: false, error: "DATABASE_URL is required for catalog verify." }, null, 2));
    process.exit(1);
  }

  const catalog = await verifyCatalogCompleteness({ webRoot });
  const report = mergeStagingReport(envReport, catalog);

  let httpProbe: Awaited<ReturnType<typeof probeHttpHealth>> | undefined;
  let presignProbe: Awaited<ReturnType<typeof probePresignRoutes>> | undefined;

  const siteUrl = process.env.SITE_URL?.trim();
  if (probeHttp && siteUrl) {
    try {
      httpProbe = await probeHttpHealth(siteUrl);
      if (!httpProbe.ok) {
        report.blockers.push({
          key: "http_health",
          label: "Runtime health probe",
          status: "weak",
          detail: "Health endpoint did not return ok",
        });
        report.ready = false;
      }
    } catch (error) {
      httpProbe = { ok: false };
      report.blockers.push({
        key: "http_health",
        label: "Runtime health probe",
        status: "weak",
        detail: error instanceof Error ? error.message : "Health probe failed",
      });
      report.ready = false;
    }
  }

  if (probePresign && siteUrl) {
    const accessCode = process.env.OWNER_ACCESS_CODE?.trim() ?? "e2e-owner-code";
    try {
      presignProbe = await probePresignRoutes(siteUrl, accessCode);
      if (!presignProbe.ok) {
        report.blockers.push({
          key: "s3_presign_probe",
          label: "S3 presign routes",
          status: "weak",
          detail:
            presignProbe.detail ??
            `media=${presignProbe.mediaStatus ?? "n/a"} release=${presignProbe.releaseStatus ?? "n/a"}`,
        });
        report.ready = false;
      }
    } catch (error) {
      presignProbe = {
        ok: false,
        mediaStatus: null,
        releaseStatus: null,
        mediaConfigured: false,
        releaseConfigured: false,
        detail: error instanceof Error ? error.message : "Presign probe failed",
      };
      report.blockers.push({
        key: "s3_presign_probe",
        label: "S3 presign routes",
        status: "weak",
        detail: presignProbe.detail,
      });
      report.ready = false;
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: report.ready,
        mode: report.mode,
        envBlockers: envReport.blockers.length,
        catalogOk: catalog.ok,
        catalogApplicationCount: catalog.applicationCount,
        expectedRepoCount: catalog.expectedRepoCount,
        httpProbe,
        presignProbe,
        blockers: report.blockers,
        envChecks: report.envChecks,
        catalogIssues: report.catalog?.issues,
      },
      null,
      2,
    ),
  );

  if (!report.ready) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
