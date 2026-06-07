import type { ApplicationRecord } from "@savige/domain";

export type ShowcaseMetric = {
  value: string;
  label: string;
  detail: string;
};

export type ShowcaseLane = {
  title: string;
  summary: string;
  items: string[];
};

export type ShowcasePlan = {
  name: string;
  price: string;
  summary: string;
  bullets: string[];
};

export type ShowcaseSignal = {
  title: string;
  summary: string;
  detail: string;
};

export type ShowcaseApplication = {
  label: string;
  headline: string;
  audience: string;
  priceModel: string;
  releaseChannel: string;
  operationalFocus: string;
  highlights: string[];
  surfaces: string[];
  stack: string[];
  pillars: {
    title: string;
    description: string;
  }[];
  releaseMoments: {
    stage: string;
    title: string;
    description: string;
  }[];
};

export const flagshipMetrics: ShowcaseMetric[] = [
  {
    value: "Public + Private",
    label: "One flagship shell",
    detail: "Sell software publicly while keeping owner operations, vault assets, and moderation surfaces private.",
  },
  {
    value: "Signed + Audited",
    label: "Release discipline",
    detail: "Checkout, entitlement checks, short-lived downloads, and audit trails already exist in the platform core.",
  },
  {
    value: "Systems + AI",
    label: "Work beyond apps",
    detail: "The site is designed to showcase Linux builds, scripts, containers, models, research, and other operator-grade assets.",
  },
];

export const foundryLanes: ShowcaseLane[] = [
  {
    title: "Applications & Software",
    summary: "Showcase of applications, both free and premium, with secure release channels and private buyer experiences.",
    items: ["Applications", "Versioned releases", "Free & Premium Software", "Admin lifecycle controls"],
  },
  {
    title: "Operator Kits & Configs",
    summary: "The engineering playground: dotfiles, program settings, custom OS builds, automation scripts, and freeware lists.",
    items: ["Custom OS builds", ".files & rc configs", "Software & freeware links", "Automation scripts"],
  },
  {
    title: "AI & Meta-Systems",
    summary: "System Admin meta-systems, trained AI agents, prompt architectures, and curated links to the best LLMs.",
    items: ["Trained AI agents", "Sysadmin meta-systems", "LLM resources", "Prompt ecosystems"],
  },
  {
    title: "Security & Payloads",
    summary: "Hacking content, exploitation payloads, security recommendations, and defensive OPNsense builds.",
    items: ["Hacking payloads", "Security recommendations", "OPNsense builds", "Offensive & Defensive research"],
  },
  {
    title: "Guides & Instructional Media",
    summary: "Tips, tricks, instructional videos, YouTube links, and comprehensive guides for various systems and tasks.",
    items: ["Instructional videos", "YouTube links", "System guides", "Tips & tricks"],
  },
  {
    title: "Games & Literature",
    summary: "Custom-developed games, books, notes, and interactive literature.",
    items: ["Custom Games", "Books & literature", "Research notes", "Interactive media"],
  },
];

export const releaseLanes: ShowcaseLane[] = [
  {
    title: "Public Releases",
    summary: "Fast-moving visible launches for applications, installers, and showcase assets.",
    items: ["Catalog pages", "Release notes", "Checksums", "Direct purchase CTA"],
  },
  {
    title: "Entitled Delivery",
    summary: "Buyer-only binaries, premium packages, and licensed downloads behind signed links.",
    items: ["Signed URLs", "Webhook completion", "License state", "Download event logs"],
  },
  {
    title: "Private Vault",
    summary: "Sensitive owner artifacts and internal handoff material protected behind the admin shell.",
    items: ["Encrypted payloads", "Rate limiting", "Optional S3 storage", "Audit visibility"],
  },
];

export const pricingPlans: ShowcasePlan[] = [
  {
    name: "Launch Drop",
    price: "TBD",
    summary: "Public catalog entries for applications, games, and books — pricing will be published when each lane opens.",
    bullets: ["Catalog discovery", "Release notes", "GitHub source mirror", "Pricing TBD"],
  },
  {
    name: "Operator Stack",
    price: "TBD",
    summary: "Custom platforms, internal tools, containers, automation, and environment bootstrap systems.",
    bullets: ["Discovery pass", "Secure delivery workflow", "Private milestones", "Pricing TBD"],
  },
  {
    name: "Foundry Partnership",
    price: "TBD",
    summary: "A deeper build lane for product strategy, release management, platform hardening, and ongoing iteration.",
    bullets: ["Roadmap ownership", "Admin + analytics surfaces", "Launch support", "Pricing TBD"],
  },
];

export const trustSignals: ShowcaseSignal[] = [
  {
    title: "Moderated feedback",
    summary: "Reviews are treated as a quality signal, not an unverified wall of comments.",
    detail: "The platform is structured to separate public ratings, buyer feedback, and private delivery reviews with moderation in between.",
  },
  {
    title: "Operational receipts",
    summary: "Trust comes from real delivery traces: releases, purchases, downloads, audits, and changelogs.",
    detail: "As the catalog grows, the review surface can be paired with verified purchase or collaboration states instead of anonymous noise.",
  },
  {
    title: "Security-first posture",
    summary: "Owner flows, vault content, and admin routes already follow a zero-trust baseline.",
    detail: "That matters because the site is not just marketing; it is also meant to handle sensitive internal functions safely.",
  },
];

export const founderSignals: ShowcaseSignal[] = [
  {
    title: "Systems engineering",
    summary: "Work spans software, infrastructure, local environments, and release automation.",
    detail: "The platform is meant to expose the full range: apps, scripts, containers, Linux builds, and operational tooling.",
  },
  {
    title: "Security and control",
    summary: "Private routes, hardened uploads, auditability, and release discipline are part of the product story.",
    detail: "The site itself acts as proof of engineering standards rather than a detached portfolio brochure.",
  },
  {
    title: "Applied AI",
    summary: "LLM workflows, prompt systems, and trained-model publishing are intended to live inside the same foundry.",
    detail: "That makes the platform suitable for both customer-facing software and internal experimentation pipelines.",
  },
];

export const projectTracks: ShowcasePlan[] = [
  {
    name: "Rapid Prototype",
    price: "1-2 weeks",
    summary: "A fast lane for proving a product, workflow, or automation concept without wasting cycles on ceremony.",
    bullets: ["Focused scope", "Single operator contact", "Production-minded architecture", "Clear handoff path"],
  },
  {
    name: "Platform Build",
    price: "Milestone based",
    summary: "A deeper build path for systems that need admin tooling, releases, security boundaries, or ongoing iteration.",
    bullets: ["Feature roadmap", "Operational hardening", "Release planning", "Internal or external delivery"],
  },
  {
    name: "Environment Engineering",
    price: "Custom",
    summary: "Workstation kits, containers, VM stacks, installers, config packs, and repeatable local environments.",
    bullets: ["Developer experience tuning", "Portable automation", "Infrastructure conventions", "Secure defaults"],
  },
];

const showcaseBySlug: Record<string, ShowcaseApplication> = {
  "wireless-ops-suite": {
    label: "Field platform",
    headline: "Wireless assessment and operations workflows in one operator-grade control surface.",
    audience: "Security operators, analysts, defenders, and research teams",
    priceModel: "Licensed rollout or private deployment",
    releaseChannel: "Controlled access",
    operationalFocus:
      "Designed for recon, signal mapping, reporting, and disciplined evidence capture without fragmenting the workflow.",
    highlights: ["Signal inventory", "Operator workflow", "Evidence pipeline", "Secure deployment"],
    surfaces: ["Assessment cockpit", "Report packaging", "Release control", "Private entitlement"],
    stack: ["Next.js", "Prisma", "Private vault", "Signed download flow"],
    pillars: [
      {
        title: "Collection orchestration",
        description: "Bring discovery, observation, and capture tasks into a structured workflow instead of scattered tools.",
      },
      {
        title: "Operational reporting",
        description: "Convert raw activity into deliverable outputs with changelogs, checkpoints, and reviewer-friendly summaries.",
      },
      {
        title: "Controlled delivery",
        description: "Route releases or private drops through entitlement-aware delivery rather than ad-hoc file sharing.",
      },
    ],
    releaseMoments: [
      {
        stage: "R1",
        title: "Baseline operator shell",
        description: "Seeded release lane for early capability framing, admin workflow testing, and launch-surface design.",
      },
      {
        stage: "R2",
        title: "Field feedback loop",
        description: "Tighten evidence capture, reporting structure, and guided flows based on real operating patterns.",
      },
      {
        stage: "R3",
        title: "Controlled deployment kit",
        description: "Prepare private distribution paths, licensing, and curated rollouts for qualified users or buyers.",
      },
    ],
  },
  immortality: {
    label: "Longevity intelligence",
    headline: "Research-grounded longevity intelligence — compounds, protocols, and evidence in one operator surface.",
    audience: "Biohackers, longevity researchers, and health-conscious operators",
    priceModel: "Licensed access or private deployment",
    releaseChannel: "Controlled rollout",
    operationalFocus:
      "Immortality aggregates longevity science signals, compound references, and AI-assisted research workflows into a cohesive intelligence platform.",
    highlights: ["ORACLE AI", "Compound database", "Research aggregation", "Protocol tracking"],
    surfaces: ["Research cockpit", "Compound explorer", "AI assistant", "Evidence pipeline"],
    stack: ["TypeScript", "Next.js", "AI orchestration", "Structured knowledge base"],
    pillars: [
      {
        title: "Evidence-first research",
        description: "Ground longevity decisions in structured compound data and aggregated research signals.",
      },
      {
        title: "ORACLE AI layer",
        description: "AI-assisted synthesis across protocols, compounds, and emerging longevity science.",
      },
      {
        title: "Operator continuity",
        description: "Track protocols and research threads without losing context between sessions.",
      },
    ],
    releaseMoments: [
      { stage: "R1", title: "Intelligence baseline", description: "Core compound database and research aggregation surfaces." },
      { stage: "R2", title: "ORACLE integration", description: "AI-assisted research workflows and protocol guidance." },
      { stage: "R3", title: "Licensed rollout", description: "Controlled access for qualified operators and collaborators." },
    ],
  },
  ledgerloop: {
    label: "Finance platform",
    headline: "Close the loop between spending, accounts, and actionable financial clarity.",
    audience: "Operators, households, and small teams managing complex finances",
    priceModel: "Public release with premium modules",
    releaseChannel: "Direct download",
    operationalFocus:
      "LedgerLoop is built for repeatable financial workflows — imports, categorization, reporting, and long-running ledger discipline.",
    highlights: ["Ledger automation", "Account linking", "Reporting", "Audit-friendly exports"],
    surfaces: ["Dashboard", "Transaction pipeline", "Reports", "Automation rules"],
    stack: ["TypeScript", "Next.js", "Prisma", "PostgreSQL"],
    pillars: [
      { title: "Ledger discipline", description: "Keep accounts, categories, and running balances coherent over time." },
      { title: "Automation lane", description: "Reduce manual categorization with rules and imports." },
      { title: "Reporting clarity", description: "Export and summarize financial state for operators." },
    ],
    releaseMoments: [
      { stage: "R1", title: "Core ledger", description: "Accounts, transactions, and baseline reporting." },
      { stage: "R2", title: "Automation packs", description: "Rules, imports, and recurring workflow helpers." },
      { stage: "R3", title: "Premium modules", description: "Advanced reporting and multi-entity support." },
    ],
  },
  "savigesystemz-com": {
    label: "Foundry platform",
    headline: "The public storefront and private operator console for the entire SavigeSystemZ product line.",
    audience: "Buyers, collaborators, and the platform owner",
    priceModel: "Open source (MIT)",
    releaseChannel: "Self-hosted or managed deploy",
    operationalFocus:
      "Next.js monorepo powering catalog pages, commerce, signed downloads, admin operations, vault storage, and GitHub repository mirroring.",
    highlights: ["Public catalog", "Owner admin", "Signed downloads", "Code mirroring"],
    surfaces: ["Applications", "Archive", "Admin console", "GitHub repos"],
    stack: ["Next.js 16", "Prisma", "PostgreSQL", "Stripe", "S3"],
    pillars: [
      { title: "Unified foundry shell", description: "One platform for public discovery and private operator control." },
      { title: "Release discipline", description: "Commerce, entitlements, signed downloads, and audit trails built in." },
      { title: "Code transparency", description: "Mirror GitHub repos with README rendering and source cards on app pages." },
    ],
    releaseMoments: [
      { stage: "R1", title: "Catalog + admin", description: "Public applications and owner operations console." },
      { stage: "R2", title: "Commerce lane", description: "Checkout, licenses, and signed artifact delivery." },
      { stage: "R3", title: "Production deploy", description: "DNS attach, live Stripe, and S3-backed uploads." },
    ],
  },
  etherweave: {
    label: "Wireless security",
    headline: "Professional wireless assessment workflows — recon, capture, analysis, and reporting in one surface.",
    audience: "Authorized security testers, researchers, and wireless operators",
    priceModel: "Licensed rollout",
    releaseChannel: "Controlled access",
    operationalFocus:
      "Etherweave-Nexus delivers feature parity between GUI and CLI paths for wireless security operations with hardware-aware performance tuning.",
    highlights: ["802.11 assessment", "GPU acceleration", "GUI + CLI parity", "Encrypted loot storage"],
    surfaces: ["Wireless recon", "Capture pipeline", "Analysis cockpit", "Report export"],
    stack: ["Python", "PyQt6", "CUDA", "SQLite"],
    pillars: [
      { title: "Operator-grade UX", description: "Responsive GUI with thread-safe long-running operations." },
      { title: "Hardware awareness", description: "GPU thermal guards and wireless chipset detection." },
      { title: "Secure evidence handling", description: "Encrypted storage for handshakes and sensitive capture material." },
    ],
    releaseMoments: [
      { stage: "R1", title: "Assessment baseline", description: "Recon, inventory, and capture fundamentals." },
      { stage: "R2", title: "GPU-accelerated analysis", description: "Performance-tuned analysis pipelines." },
      { stage: "R3", title: "Licensed deployment", description: "Controlled rollout for authorized operators." },
    ],
  },
  vetraxis: {
    label: "Case orchestration",
    headline: "Organize evidence, timelines, and AI-assisted guidance for disability case preparation.",
    audience: "Veterans, advocates, and case preparation teams",
    priceModel: "Subscription or scoped deployment",
    releaseChannel: "Private beta",
    operationalFocus:
      "Vetraxis structures the complexity of VA disability cases into guided workflows with document tracking and AI-assisted review.",
    highlights: ["Case timelines", "Document tracking", "AI guidance", "Structured evidence"],
    surfaces: ["Case dashboard", "Document vault", "AI assistant", "Submission prep"],
    stack: ["TypeScript", "Next.js", "AI integration", "Secure storage"],
    pillars: [
      { title: "Structured case flow", description: "Break complex disability cases into manageable stages." },
      { title: "Evidence organization", description: "Keep documents and timelines linked to each claim element." },
      { title: "AI-assisted review", description: "Guidance helpers without replacing human judgment." },
    ],
    releaseMoments: [
      { stage: "R1", title: "Case workspace", description: "Timelines, documents, and basic AI guidance." },
      { stage: "R2", title: "Advocate tooling", description: "Multi-case views and collaboration hooks." },
      { stage: "R3", title: "Beta rollout", description: "Controlled access for veterans and advocates." },
    ],
  },
  "stack-launcher": {
    label: "Bootstrap engine",
    headline: "Spin up opinionated environments, service bundles, and repeatable workstation setups without hand-tuning every host.",
    audience: "Builders, operators, homelab engineers, and product teams",
    priceModel: "Public release with premium stack packs",
    releaseChannel: "Direct download",
    operationalFocus:
      "Optimized for taking a messy local setup and turning it into a reproducible launch path for development stacks and operator kits.",
    highlights: ["Environment bootstrap", "Container-aware", "Portable conventions", "Fast local setup"],
    surfaces: ["Installer flow", "Stack definitions", "Environment health", "Update channel"],
    stack: ["Node", "Shell automation", "Containers", "Release artifacts"],
    pillars: [
      {
        title: "Portable setup",
        description: "Encode local environment knowledge into reusable launch paths instead of tribal memory and setup notes.",
      },
      {
        title: "System composition",
        description: "Bundle services, configs, and dependencies into a coherent install or launch experience.",
      },
      {
        title: "Maintenance runway",
        description: "Support versioning, changelogs, and upgrade paths so the stack survives beyond the first install.",
      },
    ],
    releaseMoments: [
      {
        stage: "R1",
        title: "Core launcher path",
        description: "Ship the bootstrap baseline and validate the release surface from catalog entry to delivery.",
      },
      {
        stage: "R2",
        title: "Environment packs",
        description: "Package curated local setups, config layers, and service combinations into reusable launch kits.",
      },
      {
        stage: "R3",
        title: "Operator distribution",
        description: "Move from one-off setup utility to a polished release lane for teams, labs, and power users.",
      },
    ],
  },
};

export function getShowcaseApplication(
  app: ApplicationRecord,
): ShowcaseApplication {
  const fallback = showcaseBySlug[app.slug] ?? {
    label: "Flagship build",
    headline: `${app.name} is positioned as a launch-ready system inside the SavigeSystemZ foundry.`,
    audience: "Operators, buyers, and technical evaluators",
    priceModel: "TBD",
    releaseChannel: "Flexible",
    operationalFocus: app.details ?? app.summary,
    highlights: ["Catalog ready", "Release aware", "Operational control"],
    surfaces: ["Detail page", "Purchase flow", "Release history"],
    stack: ["Next.js", "Prisma", "Signed delivery"],
    pillars: buildPillarsFromApplication(app),
    releaseMoments: [
      {
        stage: "R1",
        title: "Catalog entry",
        description: "Establish the public narrative and release lane.",
      },
      {
        stage: "R2",
        title: "Structured delivery",
        description: "Connect the app to pricing, entitlement, and update surfaces.",
      },
      {
        stage: "R3",
        title: "Operator maturity",
        description: "Expand into deeper admin, release, and artifact controls as the product grows.",
      },
    ],
  };

  return {
    label: app.label ?? fallback.label,
    headline: app.tagline ?? fallback.headline,
    audience: app.audience ?? fallback.audience,
    priceModel: app.priceLabel ?? fallback.priceModel,
    releaseChannel: app.releaseChannel ?? fallback.releaseChannel,
    operationalFocus: app.details ?? fallback.operationalFocus,
    highlights: app.highlights?.length ? app.highlights : fallback.highlights,
    surfaces: app.surfaceAreas?.length ? app.surfaceAreas : fallback.surfaces,
    stack: app.stackItems?.length ? app.stackItems : fallback.stack,
    pillars: buildPillarsFromApplication(app, fallback.pillars),
    releaseMoments: fallback.releaseMoments,
  };
}

function buildPillarsFromApplication(
  app: ApplicationRecord,
  fallback?: ShowcaseApplication["pillars"],
): ShowcaseApplication["pillars"] {
  const highlights = app.highlights ?? [];
  const details = app.details ?? app.summary;
  if (highlights.length >= 3) {
    return highlights.slice(0, 3).map((title, index) => ({
      title,
      description:
        index === 0
          ? details
          : `${title} is part of the ${app.name} story inside the SavigeSystemZ catalog and GitHub mirror.`,
    }));
  }
  if (highlights.length > 0) {
    return highlights.map((title, index) => ({
      title,
      description: index === 0 ? details : `${title} — catalog capability for ${app.name}.`,
    }));
  }
  return (
    fallback ?? [
      {
        title: "Public-facing discovery",
        description: "Every app gets a polished landing path with clear positioning and routes into purchase or inquiry.",
      },
      {
        title: "Operational fit",
        description: "Applications are framed as systems with release cadence, delivery rules, and administrative control.",
      },
      {
        title: "Secure continuity",
        description: "The surrounding platform supports identity, audit trails, and controlled artifact delivery.",
      },
    ]
  );
}
