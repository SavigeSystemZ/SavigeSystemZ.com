import type { ApplicationRecord } from "@savige/domain";

export const appCatalog: ApplicationRecord[] = [
  {
    id: "app-001",
    slug: "wireless-ops-suite",
    name: "Wireless Ops Suite",
    summary: "Advanced wireless assessment and operations platform.",
    label: "Field platform",
    tagline: "Wireless assessment and operations workflows in one operator-grade control surface.",
    audience: "Security operators, analysts, defenders, and research teams",
    priceLabel: "Licensed rollout or private deployment",
    releaseChannel: "Controlled access",
    details:
      "Designed for recon, signal mapping, reporting, and disciplined evidence capture without fragmenting the workflow.",
    highlights: ["Signal inventory", "Operator workflow", "Evidence pipeline", "Secure deployment"],
    surfaceAreas: ["Assessment cockpit", "Report packaging", "Release control", "Private entitlement"],
    stackItems: ["Next.js", "Prisma", "Private vault", "Signed download flow"],
    visibility: "public",
    featured: true,
  },
  {
    id: "app-002",
    slug: "stack-launcher",
    name: "Stack Launcher",
    summary: "Installer and orchestration utility for full development stacks.",
    label: "Bootstrap engine",
    tagline:
      "Spin up opinionated environments, service bundles, and repeatable workstation setups without hand-tuning every host.",
    audience: "Builders, operators, homelab engineers, and product teams",
    priceLabel: "Public release with premium stack packs",
    releaseChannel: "Direct download",
    details:
      "Optimized for taking a messy local setup and turning it into a reproducible launch path for development stacks and operator kits.",
    highlights: ["Environment bootstrap", "Container-aware", "Portable conventions", "Fast local setup"],
    surfaceAreas: ["Installer flow", "Stack definitions", "Environment health", "Update channel"],
    stackItems: ["Node", "Shell automation", "Containers", "Release artifacts"],
    visibility: "public",
    featured: false,
  },
];
