/**
 * Known local launch URLs for catalog applications (MyAppZ workspace).
 * Used by `scripts/capture-catalog-ui-screenshots.ts` to screenshot live app UIs.
 *
 * When `launchUrl` is omitted the capture script discovers URLs from sibling
 * `.env.example` files under `~/.MyAppZ/`. Set `surface: "desktop"` for non-HTTP apps.
 */
import fs from "node:fs";
import path from "node:path";

export type CatalogLaunchSurface = "web" | "desktop" | "cli" | "unknown";

export type CatalogLaunchEntry = {
  slug: string;
  githubRepo: string;
  /** HTTP(S) origin when the app dev server is running. */
  launchUrl?: string;
  surface: CatalogLaunchSurface;
  /** Repo folder under ~/.MyAppZ (defaults to githubRepo). */
  repoDir?: string;
  /** How to start locally — for the operator report only. */
  startHint?: string;
  notes?: string;
};

/** Flagship + known MyAppZ web apps with documented dev ports. */
export const CATALOG_LAUNCH_REGISTRY: CatalogLaunchEntry[] = [
  {
    slug: "immortality",
    githubRepo: "Immortality",
    launchUrl: "http://127.0.0.1:3777",
    surface: "web",
    startHint: "cd ~/.MyAppZ/Immortality && pnpm dev (see .env.example NEXT_PUBLIC_APP_URL)",
  },
  {
    slug: "ledgerloop",
    githubRepo: "LedgerLoop",
    launchUrl: "http://127.0.0.1:3847",
    surface: "web",
    startHint: "cd ~/.MyAppZ/LedgerLoop && pnpm dev (PORT=3847 in .env.example)",
  },
  {
    slug: "savigesystemz-com",
    githubRepo: "SavigeSystemZ.com",
    launchUrl: "http://127.0.0.1:43907",
    surface: "web",
    startHint: "cd ~/.MyAppZ/SavigeSystemZ.com && pnpm dev:web",
  },
  {
    slug: "vetraxis",
    githubRepo: "Vetraxis",
    launchUrl: "http://127.0.0.1:38222",
    surface: "web",
    startHint: "cd ~/.MyAppZ/Vetraxis && docker compose / ops stack (APP_PORT=38222 — ops/LOCAL_DEV_PORTS.md)",
  },
  {
    slug: "etherweave",
    githubRepo: "etherweave",
    surface: "desktop",
    repoDir: "EtherWeave",
    startHint: "PyQt6 GUI — launch Etherweave-Nexus desktop app; no HTTP dev surface",
    notes: "Wireless security platform is desktop-first (PyQt6 + CLI). Screenshot via OS capture outside this script.",
  },
  {
    slug: "candlecompass",
    githubRepo: "CandleCompass",
    launchUrl: "http://127.0.0.1:3967",
    surface: "web",
    startHint: "cd ~/.MyAppZ/CandleCompass/app/ui-next && npm run dev (PLAYWRIGHT_PORT default 3967)",
  },
  {
    slug: "ideaforge",
    githubRepo: "IdeaForge",
    launchUrl: "http://127.0.0.1:41287",
    surface: "web",
    startHint: "cd ~/.MyAppZ/IdeaForge && pnpm dev (see .env.example APP_PORT / SITE_URL)",
  },
  {
    slug: "pharmphreak",
    githubRepo: "PharmPhreak",
    launchUrl: "http://127.0.0.1:38224",
    surface: "web",
    startHint: "cd ~/.MyAppZ/PharmPhreak && docker compose / ops stack (see PORTS_REGISTRY.md APP_PORT 38224)",
  },
  {
    slug: "cleanoutconnect",
    githubRepo: "CleanoutConnect",
    launchUrl: "http://127.0.0.1:3000",
    surface: "web",
    startHint: "cd ~/.MyAppZ/CleanoutConnect && pnpm dev (NEXT_PUBLIC_APP_URL in .env.example)",
  },
];

const REGISTRY_BY_SLUG = new Map(CATALOG_LAUNCH_REGISTRY.map((entry) => [entry.slug, entry]));
const REGISTRY_BY_REPO = new Map(CATALOG_LAUNCH_REGISTRY.map((entry) => [entry.githubRepo, entry]));

export function getCatalogLaunchEntry(slug: string, githubRepo: string): CatalogLaunchEntry | undefined {
  return REGISTRY_BY_SLUG.get(slug) ?? REGISTRY_BY_REPO.get(githubRepo);
}

export function normalizeLaunchUrl(url: string): string {
  return url.replace(/^http:\/\/localhost\b/i, "http://127.0.0.1").replace(/\/$/, "");
}

/** Parse common port / URL hints from a sibling app's `.env.example`. */
export function inferLaunchUrlFromEnvExample(content: string): string | undefined {
  const urlPatterns = [
    /NEXT_PUBLIC_APP_URL\s*=\s*["']?(https?:\/\/[^\s"'#]+)/i,
    /NEXTAUTH_URL\s*=\s*["']?(https?:\/\/[^\s"'#]+)/i,
    /SITE_URL\s*=\s*["']?(https?:\/\/[^\s"'#]+)/i,
    /MODPILOT_WEB_URL\s*=\s*["']?(https?:\/\/[^\s"'#]+)/i,
    /APP_HEALTHCHECK_URL\s*=\s*["']?(https?:\/\/[^\s"'#]+)/i,
  ];
  for (const pattern of urlPatterns) {
    const match = pattern.exec(content);
    if (match?.[1] && !match[1].includes("${")) return normalizeLaunchUrl(match[1]);
  }

  const healthTemplate = /APP_HEALTHCHECK_URL=http:\/\/\$\{[^}]+\}:\$\{APP_PORT:-(\d+)\}/i.exec(content);
  if (healthTemplate?.[1] && healthTemplate[1] !== "46300") return `http://127.0.0.1:${healthTemplate[1]}`;

  const portPatterns = [
    /^APP_PORT\s*=\s*(\d+)/im,
    /^SITE_PORT\s*=\s*(\d+)/im,
    /^PORT\s*=\s*(\d+)/im,
    /^PLAYWRIGHT_PORT\s*=\s*(\d+)/im,
    /^MODPILOT_WEB_PORT\s*=\s*(\d+)/im,
  ];
  for (const pattern of portPatterns) {
    const match = pattern.exec(content);
    if (match?.[1]) return `http://127.0.0.1:${match[1]}`;
  }

  const rangeStart = /^APP_PORT_RANGE_START\s*=\s*(\d+)/im.exec(content);
  // Skip the shared AIAAST bootstrap default — prefer LOCAL_DEV_PORTS / workspace registry.
  if (rangeStart?.[1] && rangeStart[1] !== "46300") return `http://127.0.0.1:${rangeStart[1]}`;

  return undefined;
}

/** Parse `ops/LOCAL_DEV_PORTS.md` default `APP_PORT` table rows. */
export function inferLaunchUrlFromLocalDevPortsMd(content: string): string | undefined {
  const boldPort = /\|\s*`APP_PORT`\s*\|\s*\*\*(\d+)\*\*/.exec(content);
  if (boldPort?.[1]) return `http://127.0.0.1:${boldPort[1]}`;

  const plainPort = /\|\s*`APP_PORT`\s*\|\s*(\d+)/.exec(content);
  if (plainPort?.[1]) return `http://127.0.0.1:${plainPort[1]}`;

  const proseDefault = /default host port[^:\n]*:\s*\*\*(\d+)\*\*/i.exec(content);
  if (proseDefault?.[1]) return `http://127.0.0.1:${proseDefault[1]}`;

  return undefined;
}

/** Parse ~/.MyAppZ/PORTS_REGISTRY.md workspace compose defaults. */
export function inferLaunchUrlFromWorkspacePortsRegistry(
  content: string,
  githubRepo: string,
): string | undefined {
  const target = githubRepo.toLowerCase();
  for (const line of content.split(/\r?\n/)) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    const appName = cells[0].replace(/\*\*/g, "").trim();
    const portCell = cells[1].replace(/\*\*/g, "").trim();
    if (!/^\d+$/.test(portCell)) continue;
    if (appName.toLowerCase() !== target && !appName.toLowerCase().startsWith(`${target} `)) continue;
    return `http://127.0.0.1:${portCell}`;
  }
  return undefined;
}

const ENV_EXAMPLE_CANDIDATES = [".env.example", "apps/web/.env.example", "ops/env/.env.example"];

const LOCAL_DEV_PORTS_CANDIDATES = [
  "ops/LOCAL_DEV_PORTS.md",
  "api-gateway/ops/LOCAL_DEV_PORTS.md",
  "app/ui-next/ops/LOCAL_DEV_PORTS.md",
];

let cachedWorkspacePortsRegistry: string | null | undefined;

function readWorkspacePortsRegistry(): string | null {
  if (cachedWorkspacePortsRegistry !== undefined) return cachedWorkspacePortsRegistry;
  const home = process.env.HOME ?? "/home/whyte";
  const filePath = `${home}/.MyAppZ/PORTS_REGISTRY.md`;
  cachedWorkspacePortsRegistry = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  return cachedWorkspacePortsRegistry;
}

export type LaunchUrlDiscoverySource =
  | "registry"
  | "env.example"
  | "local-dev-ports"
  | "workspace-ports-registry"
  | "none";

export type LaunchUrlDiscovery = {
  launchUrl?: string;
  source: LaunchUrlDiscoverySource;
};

/** Discover a dev URL from sibling MyAppZ repo env templates and port docs. */
export function discoverLaunchUrlForRepo(
  githubRepo: string,
  repoDir?: string,
): LaunchUrlDiscovery {
  const repoPath = resolveMyAppZRepoPath(githubRepo, repoDir);
  if (!fs.existsSync(repoPath)) {
    const workspaceRegistry = readWorkspacePortsRegistry();
    if (workspaceRegistry) {
      const fromRegistry = inferLaunchUrlFromWorkspacePortsRegistry(workspaceRegistry, githubRepo);
      if (fromRegistry) return { launchUrl: fromRegistry, source: "workspace-ports-registry" };
    }
    return { source: "none" };
  }

  for (const relative of LOCAL_DEV_PORTS_CANDIDATES) {
    const filePath = path.join(repoPath, relative);
    if (!fs.existsSync(filePath)) continue;
    const inferred = inferLaunchUrlFromLocalDevPortsMd(fs.readFileSync(filePath, "utf8"));
    if (inferred) return { launchUrl: inferred, source: "local-dev-ports" };
  }

  for (const relative of ENV_EXAMPLE_CANDIDATES) {
    const filePath = path.join(repoPath, relative);
    if (!fs.existsSync(filePath)) continue;
    const inferred = inferLaunchUrlFromEnvExample(fs.readFileSync(filePath, "utf8"));
    if (inferred) return { launchUrl: inferred, source: "env.example" };
  }

  const workspaceRegistry = readWorkspacePortsRegistry();
  if (workspaceRegistry) {
    const fromRegistry = inferLaunchUrlFromWorkspacePortsRegistry(workspaceRegistry, githubRepo);
    if (fromRegistry) return { launchUrl: fromRegistry, source: "workspace-ports-registry" };
  }

  return { source: "none" };
}

export function resolveLaunchTargetForCatalog(
  slug: string,
  githubRepo: string,
): Pick<CatalogLaunchEntry, "launchUrl" | "surface" | "startHint" | "notes"> {
  const registry = getCatalogLaunchEntry(slug, githubRepo);
  if (registry) {
    return {
      launchUrl: registry.launchUrl ? normalizeLaunchUrl(registry.launchUrl) : undefined,
      surface: registry.surface,
      startHint: registry.startHint,
      notes: registry.notes,
    };
  }

  const discovered = discoverLaunchUrlForRepo(githubRepo);
  if (discovered.launchUrl) {
    const repoPath = resolveMyAppZRepoPath(githubRepo);
    return {
      launchUrl: discovered.launchUrl,
      surface: "web",
      startHint: `cd ${repoPath} && inspect .env.example / ops/LOCAL_DEV_PORTS.md / README for dev start`,
    };
  }

  return { surface: "unknown" };
}

export function resolveMyAppZRepoPath(githubRepo: string, repoDir?: string): string {
  const home = process.env.HOME ?? "/home/whyte";
  const base = `${home}/.MyAppZ`;

  const candidates = [repoDir, githubRepo].filter(Boolean) as string[];
  for (const name of candidates) {
    const direct = path.join(base, name);
    if (fs.existsSync(direct)) return direct;
  }

  try {
    const entries = fs.readdirSync(base);
    const lower = githubRepo.toLowerCase();
    const match = entries.find((entry) => entry.toLowerCase() === lower);
    if (match) return path.join(base, match);
  } catch {
    // ignore unreadable workspace root
  }

  return path.join(base, repoDir ?? githubRepo);
}
