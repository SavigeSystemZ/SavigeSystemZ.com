import { catalogKindForGithubRepo, type CatalogKind } from "@/lib/catalog-from-repos";

export type ShowcaseSvgInput = {
  slug: string;
  name: string;
  githubRepo: string;
  summary?: string | null;
  primaryLanguage?: string | null;
  kind?: CatalogKind;
  variant?: "hero" | "preview";
};

const FEATURED_HERO: Record<string, string> = {
  immortality: "/showcase/immortality-oracle-grid.svg",
  ledgerloop: "/showcase/ledgerloop-ledger-wave.svg",
  "savigesystemz-com": "/showcase/savigesystemz-foundry-core.svg",
  etherweave: "/showcase/etherweave-signal-mesh.svg",
  vetraxis: "/showcase/vetraxis-case-lattice.svg",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function paletteForKind(kind: CatalogKind, slug: string): { primary: string; secondary: string; accent: string } {
  const hue = hashHue(slug);
  if (kind === "game") {
    return { primary: `hsl(${hue} 68% 58%)`, secondary: `hsl(${(hue + 40) % 360} 55% 42%)`, accent: "#f0abfc" };
  }
  if (kind === "book") {
    return { primary: `hsl(${(hue + 20) % 360} 72% 55%)`, secondary: `hsl(${(hue + 50) % 360} 48% 38%)`, accent: "#fcd34d" };
  }
  return { primary: `hsl(${hue} 70% 56%)`, secondary: `hsl(${(hue + 30) % 360} 52% 40%)`, accent: "#67e8f9" };
}

/** Public URL paths for generated showcase assets (written by `pnpm code:generate-showcases`). */
export function catalogShowcasePaths(slug: string): { hero: string; preview: string } {
  if (FEATURED_HERO[slug]) {
    return {
      hero: FEATURED_HERO[slug],
      preview: `/showcase/generated/${slug}-preview.svg`,
    };
  }
  return {
    hero: `/showcase/generated/${slug}.svg`,
    preview: `/showcase/generated/${slug}-preview.svg`,
  };
}

export function renderCatalogShowcaseSvg(input: ShowcaseSvgInput): string {
  const kind = input.kind ?? catalogKindForGithubRepo(input.githubRepo);
  const palette = paletteForKind(kind, input.slug);
  const variant = input.variant ?? "hero";
  const title = escapeXml(truncate(input.name, 48));
  const subtitle = escapeXml(
    truncate(input.summary?.trim() || `${input.name} — SavigeSystemZ ${kind}`, variant === "preview" ? 72 : 96),
  );
  const lang = escapeXml(input.primaryLanguage?.trim() || "Multi-stack");
  const kindLabel = escapeXml(kind.toUpperCase());
  const repo = escapeXml(input.githubRepo);

  if (variant === "preview") {
    return `<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#020617"/><stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect x="80" y="60" width="1440" height="780" rx="24" fill="#0b1220" stroke="${palette.accent}" stroke-opacity="0.35"/>
  <rect x="80" y="60" width="1440" height="56" rx="24" fill="#111827"/>
  <circle cx="118" cy="88" r="10" fill="#ef4444" fill-opacity="0.85"/>
  <circle cx="152" cy="88" r="10" fill="#f59e0b" fill-opacity="0.85"/>
  <circle cx="186" cy="88" r="10" fill="#22c55e" fill-opacity="0.85"/>
  <text x="230" y="96" fill="#94a3b8" font-family="ui-monospace, monospace" font-size="22">${repo}</text>
  <rect x="120" y="160" width="520" height="620" rx="20" fill="#0f172a" stroke="${palette.primary}" stroke-opacity="0.45"/>
  <rect x="680" y="160" width="780" height="300" rx="20" fill="#0f172a" stroke="${palette.secondary}" stroke-opacity="0.4"/>
  <rect x="680" y="480" width="780" height="300" rx="20" fill="#0f172a" stroke="${palette.secondary}" stroke-opacity="0.28"/>
  <text x="160" y="230" fill="${palette.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700">${kindLabel}</text>
  <text x="160" y="290" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="44" font-weight="700">${title}</text>
  <text x="160" y="350" fill="#cbd5e1" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24">${lang}</text>
  <text x="720" y="230" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600">Activity</text>
  <text x="720" y="280" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22">${subtitle}</text>
  <text x="720" y="550" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600">Release lane</text>
  <text x="720" y="600" fill="#94a3b8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22">v0.1.0 · GitHub source archive · Pricing TBD</text>
  <text x="120" y="850" fill="#64748b" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" letter-spacing="0.18em">SAVIGESYSTEMZ PROJECT PREVIEW</text>
</svg>`;
  }

  return `<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="120" y1="80" x2="1480" y2="820" gradientUnits="userSpaceOnUse">
      <stop stop-color="#040810"/><stop offset="0.55" stop-color="#0a1628"/><stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 160) rotate(130) scale(640 700)">
      <stop stop-color="${palette.accent}" stop-opacity="0.42"/><stop offset="1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g opacity="0.16" stroke="${palette.accent}" stroke-opacity="0.55">
    <path d="M0 112.5H1600"/><path d="M0 225H1600"/><path d="M0 337.5H1600"/><path d="M0 450H1600"/><path d="M0 562.5H1600"/><path d="M0 675H1600"/><path d="M0 787.5H1600"/>
    <path d="M200 0V900"/><path d="M400 0V900"/><path d="M600 0V900"/><path d="M800 0V900"/><path d="M1000 0V900"/><path d="M1200 0V900"/><path d="M1400 0V900"/>
  </g>
  <rect x="120" y="120" width="760" height="360" rx="28" fill="#08131c" fill-opacity="0.9" stroke="${palette.primary}" stroke-opacity="0.45"/>
  <rect x="920" y="120" width="560" height="360" rx="28" fill="#091720" fill-opacity="0.86" stroke="${palette.secondary}" stroke-opacity="0.38"/>
  <rect x="120" y="520" width="1360" height="260" rx="28" fill="#091720" fill-opacity="0.82" stroke="${palette.accent}" stroke-opacity="0.28"/>
  <text x="160" y="210" fill="${palette.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="700" letter-spacing="0.22em">${kindLabel}</text>
  <text x="160" y="290" fill="#f8fafc" font-family="ui-sans-serif, system-ui, sans-serif" font-size="56" font-weight="700">${title}</text>
  <text x="160" y="360" fill="#cbd5e1" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26">${lang}</text>
  <text x="960" y="240" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="600">GitHub mirror</text>
  <text x="960" y="300" fill="#94a3b8" font-family="ui-monospace, monospace" font-size="24">${repo}</text>
  <text x="160" y="620" fill="#e2e8f0" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="600">${subtitle}</text>
  <text x="160" y="860" fill="${palette.accent}" fill-opacity="0.85" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" font-weight="700" letter-spacing="0.2em">SAVIGESYSTEMZ</text>
</svg>`;
}
