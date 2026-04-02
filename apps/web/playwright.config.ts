import { defineConfig } from "@playwright/test";

const E2E_PORT = process.env.E2E_PORT ?? "3456";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm exec next dev --hostname 127.0.0.1 --port ${E2E_PORT}`,
    url: `http://127.0.0.1:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      OWNER_ACCESS_CODE: process.env.E2E_OWNER_CODE ?? "e2e-owner-code",
      OWNER_LOGIN_SECRET: process.env.E2E_OWNER_SECRET ?? "e2e-owner-secret-change-me-32chars",
      DATABASE_URL: "file:./dev.db",
      NODE_ENV: "development",
      PASSKEY_RP_ID: process.env.PASSKEY_RP_ID ?? "127.0.0.1",
      PASSKEY_ORIGIN: process.env.PASSKEY_ORIGIN ?? `http://127.0.0.1:${E2E_PORT}`,
    },
  },
});
