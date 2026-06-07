import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

const webRoot = process.cwd();

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

applyEnvFile(path.join(webRoot, ".env.local"));
applyEnvFile(path.join(webRoot, ".env"));

const E2E_PORT = process.env.E2E_PORT ?? "3456";
const OWNER_ACCESS_CODE =
  process.env.OWNER_ACCESS_CODE ?? process.env.E2E_OWNER_CODE ?? "e2e-owner-code";
const OWNER_LOGIN_SECRET =
  process.env.OWNER_LOGIN_SECRET ??
  process.env.E2E_OWNER_SECRET ??
  "e2e-owner-secret-change-me-32chars";

process.env.OWNER_ACCESS_CODE = OWNER_ACCESS_CODE;
process.env.E2E_OWNER_CODE = OWNER_ACCESS_CODE;

const GITHUB_WEBHOOK_SECRET =
  process.env.GITHUB_WEBHOOK_SECRET ?? "e2e-github-webhook-secret";
process.env.GITHUB_WEBHOOK_SECRET = GITHUB_WEBHOOK_SECRET;

/** 32-byte test key for AES-256-GCM vault persistence in E2E (not a production secret). */
const E2E_VAULT_KEY =
  process.env.VAULT_ENCRYPTION_KEY ??
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  webServer: {
    command: `pnpm exec next dev --hostname 127.0.0.1 --port ${E2E_PORT}`,
    url: `http://127.0.0.1:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      OWNER_ACCESS_CODE,
      OWNER_LOGIN_SECRET,
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://ssz:dev@localhost:5433/savige",
      NODE_ENV: "development",
      PASSKEY_RP_ID: process.env.PASSKEY_RP_ID ?? "127.0.0.1",
      PASSKEY_ORIGIN: process.env.PASSKEY_ORIGIN ?? `http://127.0.0.1:${E2E_PORT}`,
      VAULT_ENCRYPTION_KEY: E2E_VAULT_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      GITHUB_MOCK_MODE: process.env.GITHUB_MOCK_MODE ?? "1",
      GITHUB_WEBHOOK_SECRET,
    },
  },
});
