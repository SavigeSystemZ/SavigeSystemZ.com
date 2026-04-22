import { spawn } from "node:child_process";
import net from "node:net";

const CANONICAL_PORT = 43907;
const PORT_MIN = 43000;
const PORT_MAX = 44999;
const MAX_ATTEMPTS = 48;

function randomPort() {
  return Math.floor(Math.random() * (PORT_MAX - PORT_MIN + 1)) + PORT_MIN;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function resolvePort() {
  const requested = Number.parseInt(process.env.SITE_PORT ?? "", 10);
  if (Number.isFinite(requested) && requested > 0 && requested < 65536) {
    if (await isPortAvailable(requested)) return requested;
    console.warn(`[dev:web] SITE_PORT=${requested} is busy; falling back.`);
  }

  if (await isPortAvailable(CANONICAL_PORT)) return CANONICAL_PORT;
  console.warn(`[dev:web] canonical port ${CANONICAL_PORT} is busy; probing random fallback in ${PORT_MIN}-${PORT_MAX}.`);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = randomPort();
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find an open localhost port after ${MAX_ATTEMPTS} attempts.`);
}

async function main() {
  const port = await resolvePort();
  const origin = `http://127.0.0.1:${port}`;

  console.log(`[dev:web] Starting SavigeSystemZ on ${origin}`);
  if (port !== CANONICAL_PORT) {
    console.log(`[dev:web] Note: canonical port is ${CANONICAL_PORT}; desktop launcher targets that port.`);
  }
  console.log("[dev:web] Bound to 127.0.0.1 only to avoid exposing the dev server externally.");

  const child = spawn(
    "pnpm",
    ["--filter", "web", "exec", "next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL?.trim() || "file:./dev.db",
        PORT: String(port),
        SITE_URL: origin,
        PASSKEY_ORIGIN: process.env.PASSKEY_ORIGIN?.trim() || origin,
        PASSKEY_RP_ID: process.env.PASSKEY_RP_ID?.trim() || "127.0.0.1",
      },
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(`[dev:web] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
