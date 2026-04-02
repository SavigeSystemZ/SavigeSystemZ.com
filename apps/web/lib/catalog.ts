import type { ApplicationRecord } from "@savige/domain";

export const appCatalog: ApplicationRecord[] = [
  {
    id: "app-001",
    slug: "wireless-ops-suite",
    name: "Wireless Ops Suite",
    summary: "Advanced wireless assessment and operations platform.",
    visibility: "public",
    featured: true,
  },
  {
    id: "app-002",
    slug: "stack-launcher",
    name: "Stack Launcher",
    summary: "Installer and orchestration utility for full development stacks.",
    visibility: "public",
    featured: false,
  },
];
