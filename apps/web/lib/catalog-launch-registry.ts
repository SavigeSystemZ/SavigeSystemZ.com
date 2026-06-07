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
    repoDir: "etherweave",
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
  ];
  for (const pattern of urlPatterns) {
    const match = pattern.exec(content);
    if (match?.[1]) return normalizeLaunchUrl(match[1]);
  }

  const portPatterns = [
    /^APP_PORT\s*=\s*(\d+)/im,
    /^SITE_PORT\s*=\s*(\d+)/im,
    /^PORT\s*=\s*(\d+)/im,
    /^PLAYWRIGHT_PORT\s*=\s*(\d+)/im,
  ];
  for (const pattern of portPatterns) {
    const match = pattern.exec(content);
    if (match?.[1]) return `http://127.0.0.1:${match[1]}`;
  }

  return undefined;
}

const ENV_EXAMPLE_CANDIDATES = [".env.example", "ops/env/.env.example", "apps/web/.env.example"];

/** Discover a dev URL from sibling MyAppZ repo env templates. */
export function discoverLaunchUrlForRepo(githubRepo: string, repoDir?: string): string | undefined {
  const repoPath = resolveMyAppZRepoPath(githubRepo, repoDir);
  if (!fs.existsSync(repoPath)) return undefined;

  for (const relative of ENV_EXAMPLE_CANDIDATES) {
    const filePath = path.join(repoPath, relative);
    if (!fs.existsSync(filePath)) continue;
    const inferred = inferLaunchUrlFromEnvExample(fs.readFileSync(filePath, "utf8"));
    if (inferred) return inferred;
  }

  return undefined;
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
  if (discovered) {
    const repoPath = resolveMyAppZRepoPath(githubRepo);
    return {
      launchUrl: discovered,
      surface: "web",
      startHint: `cd ${repoPath} && inspect .env.example / README for dev start`,
    };
  }

  return { surface: "unknown" };
}

export function resolveMyAppZRepoPath(githubRepo: string, repoDir?: string): string {
  const home = process.env.HOME ?? "/home/whyte";
  return `${home}/.MyAppZ/${repoDir ?? githubRepo}`;
}
