import { spawn } from "node:child_process";

const siteUrl = process.env.SITE_URL?.trim() || "http://127.0.0.1:4300";

const child = spawn("pnpm", ["--filter", "web", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL?.trim() || "file:./dev.db",
    SITE_URL: siteUrl,
    PASSKEY_ORIGIN: process.env.PASSKEY_ORIGIN?.trim() || siteUrl,
    PASSKEY_RP_ID: process.env.PASSKEY_RP_ID?.trim() || "127.0.0.1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
