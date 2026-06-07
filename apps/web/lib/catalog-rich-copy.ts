/** Partial catalog seed fields used for rich copy overrides. */
export type CatalogCopyOverride = {
  slug?: string;
  name?: string;
  summary?: string;
  githubRepo?: string;
  label?: string;
  tagline?: string;
  audience?: string;
  priceLabel?: string;
  releaseChannel?: string;
  details?: string;
  highlights?: string[];
  surfaceAreas?: string[];
  stackItems?: string[];
  featured?: boolean;
};

/** Front-page featured systems — richest narrative depth. */
export const FEATURED_CATALOG_OVERRIDES: Record<string, CatalogCopyOverride> = {
  Immortality: {
    label: "Longevity intelligence",
    summary:
      "Longevity science intelligence platform combining ORACLE AI, a structured compound database, research aggregation, and protocol tracking for evidence-first health operators.",
    tagline:
      "Research-grounded longevity intelligence — compounds, protocols, and evidence in one operator surface.",
    audience: "Biohackers, longevity researchers, clinicians-in-training, and health-conscious operators",
    releaseChannel: "Controlled rollout",
    details:
      "Immortality aggregates longevity science signals, compound references, peer-reviewed research threads, and AI-assisted synthesis into a single intelligence platform. Operators can explore compounds, compare protocols, and follow evidence trails without losing context between research sessions. ORACLE AI provides guided synthesis while the compound database keeps structured reference data at the center of every decision.",
    highlights: ["ORACLE AI", "Compound database", "Research aggregation", "Protocol tracking", "Evidence trails"],
    surfaceAreas: [
      "Research cockpit",
      "Compound explorer",
      "ORACLE AI assistant",
      "Protocol tracker",
      "Evidence pipeline",
    ],
    stackItems: ["TypeScript", "Next.js", "AI orchestration", "Structured knowledge base", "PostgreSQL"],
    featured: true,
  },
  LedgerLoop: {
    label: "Finance platform",
    summary:
      "Personal and small-team finance platform for imports, categorization, reporting, and long-running ledger discipline without spreadsheet chaos.",
    tagline: "Close the loop between spending, accounts, and actionable financial clarity.",
    audience: "Operators, households, couples, and small teams managing complex or multi-account finances",
    releaseChannel: "Direct download",
    details:
      "LedgerLoop is built for repeatable financial workflows: bank and card imports, category rules, recurring transaction handling, and audit-friendly exports. The platform favors ledger discipline over one-off budgeting — accounts stay reconciled, reports stay explainable, and automation reduces manual categorization load over time.",
    highlights: [
      "Ledger automation",
      "Account linking",
      "Category rules",
      "Reporting",
      "Audit-friendly exports",
    ],
    surfaceAreas: ["Dashboard", "Transaction pipeline", "Reports", "Automation rules", "Export lane"],
    stackItems: ["TypeScript", "Next.js", "Prisma", "PostgreSQL", "Monorepo"],
    featured: true,
  },
  "SavigeSystemZ.com": {
    label: "Foundry platform",
    summary:
      "Flagship software foundry website and operations platform — public catalog, commerce, signed downloads, owner admin, vault storage, and GitHub repository mirroring in one Next.js monorepo.",
    tagline: "The public storefront and private operator console for the entire SavigeSystemZ product line.",
    audience: "Buyers, collaborators, open-source evaluators, and the platform owner",
    releaseChannel: "Self-hosted or managed deploy",
    details:
      "SavigeSystemZ.com is the control plane for the whole product line: 52+ GitHub repos mirrored into a public catalog, per-application release lanes, Stripe checkout, signed artifact delivery, owner-only admin routes, encrypted vault storage, passkey auth, and GitHub webhook sync. It is both the marketing surface and the operational backbone — not a detached landing page.",
    highlights: [
      "Public catalog",
      "Owner admin console",
      "Signed downloads",
      "GitHub code mirroring",
      "Commerce + donate lanes",
    ],
    surfaceAreas: ["Applications", "Archive", "Admin console", "GitHub repos", "Downloads", "Vault"],
    stackItems: ["Next.js 16", "React 19", "Prisma", "PostgreSQL", "Stripe", "S3", "Turborepo"],
    featured: true,
  },
  etherweave: {
    label: "Wireless security",
    summary:
      "Etherweave-Nexus — professional wireless assessment platform with GUI + CLI parity, GPU-accelerated analysis, hardware-aware tuning, and encrypted evidence storage.",
    tagline:
      "Professional wireless assessment workflows — recon, capture, analysis, and reporting in one operator-grade surface.",
    audience: "Authorized security testers, wireless researchers, red-team operators, and lab engineers",
    releaseChannel: "Controlled access",
    details:
      "Etherweave-Nexus delivers feature parity between PyQt6 GUI and CLI paths for 802.11 reconnaissance, capture, analysis, and reporting. The platform is hardware-aware — GPU thermal guards, wireless chipset detection, and performance-tuned pipelines — with encrypted loot storage for handshakes and sensitive capture material. Cyberpunk-themed UI meets production-grade thread safety and operator discipline.",
    highlights: [
      "802.11 assessment",
      "GPU acceleration",
      "GUI + CLI parity",
      "Encrypted loot storage",
      "Hardware-aware ops",
    ],
    surfaceAreas: ["Wireless recon", "Capture pipeline", "Analysis cockpit", "Report export", "CLI bridge"],
    stackItems: ["Python", "PyQt6", "CUDA", "SQLite", "802.11 tooling"],
    featured: true,
  },
  Vetraxis: {
    label: "Case orchestration",
    summary:
      "AI-assisted VA disability case preparation platform — timelines, document tracking, structured evidence, and guided workflows for veterans and advocates.",
    tagline: "Organize evidence, timelines, and AI-assisted guidance for disability case preparation.",
    audience: "Veterans, advocates, VSO teams, and case preparation specialists",
    releaseChannel: "Private beta",
    details:
      "Vetraxis structures the complexity of VA disability cases into guided stages: claim elements, supporting evidence, document uploads, timeline checkpoints, and AI-assisted review helpers. The goal is operational clarity — every document and event stays linked to the claim story so advocates and veterans can prepare submissions without losing thread across months of work.",
    highlights: [
      "Case timelines",
      "Document tracking",
      "AI guidance",
      "Structured evidence",
      "Advocate workflows",
    ],
    surfaceAreas: ["Case dashboard", "Document vault", "AI assistant", "Submission prep", "Timeline view"],
    stackItems: ["TypeScript", "Next.js", "AI integration", "Secure storage", "Prisma"],
    featured: true,
  },
};

/** Per-repo rich overrides for the full org catalog (merged after featured). */
export const EXTENDED_CATALOG_OVERRIDES: Record<string, CatalogCopyOverride> = {
  CleanoutConnect: {
    label: "Marketplace platform",
    summary:
      "CleanoutConnect marketplace for cleanouts, junk removal, estate cleanups, salvage, hauling, and local odd jobs.",
    tagline: "Connect property owners with cleanout crews, haulers, and salvage operators in one marketplace lane.",
    details:
      "CleanoutConnect targets the messy middle of property transitions — estate cleanouts, junk removal, salvage pickup, and odd-job hauling. Listings, operator matching, and service workflows are designed for local marketplaces rather than generic classifieds.",
    highlights: ["Marketplace", "Cleanout ops", "Hauling", "Local services", "TypeScript stack"],
    surfaceAreas: ["Listings", "Operator matching", "Job workflow", "Release lane"],
    stackItems: ["TypeScript", "Next.js", "Marketplace", "GitHub mirror"],
  },
  ContextCore: {
    label: "AI context recorder",
    summary: "World-class context and conversation recording application for AI enhancement and memory continuity.",
    tagline: "Capture, structure, and replay conversational context so AI workflows stay grounded over time.",
    details:
      "ContextCore records conversations and operational context for downstream AI enhancement — structured memory, replay surfaces, and export paths that keep long-running agent sessions coherent.",
    highlights: ["Context capture", "Conversation memory", "AI enhancement", "Structured replay"],
    surfaceAreas: ["Recorder", "Context index", "Export lane", "AI hooks"],
    stackItems: ["Python", "Context pipeline", "AI memory"],
  },
  DeepWeave: {
    label: "AI training OS",
    summary: "Desktop-first AI training operating system for governed open-weight model workflows.",
    tagline: "Govern open-weight training pipelines from a desktop-first operator shell.",
    details:
      "DeepWeave packages dataset prep, training orchestration, and governance guardrails for open-weight AI workflows — aimed at operators who need local control without sacrificing structure.",
    highlights: ["Open-weight training", "Governance", "Desktop-first", "Dataset ops"],
    surfaceAreas: ["Training cockpit", "Dataset lane", "Governance rules", "Export"],
    stackItems: ["Shell automation", "AI training", "Desktop OS"],
  },
  SavigeAI: {
    label: "AI meta-system",
    summary:
      "SavigeAI: local-seeded super-AI training (Phase-1 frozen) plus meta-system orchestrator for agent workflows.",
    tagline: "Local-seeded AI training foundation and meta-system orchestrator for the Savige stack.",
    details:
      "SavigeAI combines a frozen Phase-1 training baseline with orchestration hooks for agent meta-systems across the SavigeSystemZ product line — local-first, auditable, and designed to integrate with catalog and admin surfaces.",
    highlights: ["Local training", "Meta-system orchestrator", "Phase-1 baseline", "Agent hooks"],
    surfaceAreas: ["Training seed", "Orchestrator", "Agent registry", "Integration lane"],
    stackItems: ["Python", "AI training", "Agent orchestration"],
  },
  RSIGlobe: {
    label: "Trading intelligence",
    summary: "Informative and helpful algorithmic trading application focused on RSI-driven market signals.",
    tagline: "RSI-centric trading intelligence — signals, context, and operator-friendly market views.",
    details:
      "RSIGlobe explores Relative Strength Index patterns and algorithmic trading helpers for operators who want structured signal context rather than opaque black-box bots.",
    highlights: ["RSI signals", "Algo trading", "Market context", "Python analytics"],
    surfaceAreas: ["Signal dashboard", "RSI views", "Strategy notes", "Export"],
    stackItems: ["Python", "Trading algorithms", "Market data"],
  },
  CandleCompass: {
    label: "Market tools",
    tagline: "Candlestick-oriented market navigation and compass utilities for technical operators.",
    details:
      "CandleCompass provides candlestick charting helpers and compass-style navigation for traders reviewing price action and pattern context.",
    highlights: ["Candlestick views", "Market navigation", "Technical analysis", "TypeScript UI"],
    surfaceAreas: ["Chart compass", "Pattern hints", "Watchlists", "Release lane"],
    stackItems: ["TypeScript", "Market UI", "Charting"],
  },
  SteadyStack: {
    label: "Stack bootstrap",
    tagline: "Repeatable stack bootstrap conventions for local dev and homelab operators.",
    details:
      "SteadyStack encodes opinionated stack definitions and bootstrap scripts so environments come up the same way every time — services, configs, and health checks included.",
    highlights: ["Stack bootstrap", "Homelab", "Repeatable envs", "TypeScript tooling"],
    surfaceAreas: ["Stack definitions", "Bootstrap scripts", "Health checks", "Docs"],
    stackItems: ["TypeScript", "Shell", "Stack automation"],
  },
  ForgeCouncil: {
    label: "Agent OS scaffold",
    summary: "Forge Council — application workspace and AI agent operating system scaffold.",
    tagline: "Council-style agent workspace scaffold for multi-agent operator workflows.",
    details:
      "ForgeCouncil provides the workspace skeleton for AI agent councils — roles, handoffs, and operator visibility hooks that other Savige meta-systems can extend.",
    highlights: ["Agent council", "Workspace scaffold", "Multi-agent ops", "AI OS"],
    surfaceAreas: ["Council room", "Agent roles", "Handoff lane", "Audit hooks"],
    stackItems: ["Shell", "Agent OS", "Workspace scaffold"],
  },
  MetaScope: {
    label: "Agent evaluation",
    summary: "AI Agent Metasystem Evaluator — score and inspect agent systems for quality and drift.",
    tagline: "Evaluate agent meta-systems for capability, drift, and operational fit.",
    details:
      "MetaScope inspects agent architectures, prompt stacks, and runtime behavior to produce operator-readable evaluation signals — useful before promoting agents into production lanes.",
    highlights: ["Agent evaluation", "Drift detection", "Metasystem scoring", "QA lane"],
    surfaceAreas: ["Evaluator", "Scorecards", "Drift reports", "Promotion gate"],
    stackItems: ["Shell", "Agent QA", "Evaluation framework"],
  },
  PharmPhreak: {
    label: "Education hub",
    summary: "Expert AAS and pro-hormone education hub with structured reference material.",
    tagline: "Structured education surface for advanced supplement and pro-hormone research contexts.",
    details:
      "PharmPhreak organizes expert-level reference material for androgenic-anabolic steroid and pro-hormone education — structured for serious researchers, not casual bro-science lists.",
    highlights: ["Expert education", "Reference library", "Structured content", "Research context"],
    surfaceAreas: ["Reference index", "Compound notes", "Education modules", "Export"],
    stackItems: ["Shell", "Education CMS", "Reference data"],
  },
  PalmOracle: {
    label: "Oracle surface",
    summary: "Palm Oracle — divination and oracle-style interactive experience in the Savige catalog.",
    tagline: "Interactive oracle experience with catalog-ready release and source transparency.",
    details:
      "PalmOracle packages an oracle-style interactive experience with foundry catalog tracking — public source mirror, release lane, and room for future commerce hooks.",
    highlights: ["Interactive oracle", "Catalog entry", "GitHub source", "Experience layer"],
    surfaceAreas: ["Oracle session", "Reading history", "Release lane", "Source repo"],
    stackItems: ["Shell", "Interactive experience"],
  },
  ShadowCall: {
    label: "Covert comms research",
    tagline: "Research-oriented tooling around covert communication patterns and signal handling.",
    details:
      "ShadowCall explores covert communication workflows and signal handling utilities for authorized research contexts — tracked in the catalog with full GitHub transparency.",
    highlights: ["Signal research", "Covert comms", "Python tooling", "Research lane"],
    surfaceAreas: ["Signal lab", "Pattern catalog", "Research notes", "Export"],
    stackItems: ["Python", "Signal handling", "Research tools"],
  },
  SavOpZ: {
    label: "Operator console",
    tagline: "Savige operator console experiments — JavaScript control surfaces for foundry ops.",
    details:
      "SavOpZ hosts operator console experiments and control-panel prototypes for SavigeSystemZ internal workflows.",
    highlights: ["Operator console", "Control panels", "JavaScript UI", "Foundry ops"],
    surfaceAreas: ["Console", "Control widgets", "Ops hooks", "Release lane"],
    stackItems: ["JavaScript", "Operator UI", "Foundry integration"],
  },
  SiliconLedger: {
    label: "Hardware ledger",
    tagline: "Hardware and silicon asset tracking for lab inventory and operator accountability.",
    details:
      "SiliconLedger tracks GPUs, radios, boards, and lab silicon so hardware-heavy workflows (wireless, AI training) stay inventoried and accountable.",
    highlights: ["Hardware inventory", "Silicon tracking", "Lab ops", "Asset ledger"],
    surfaceAreas: ["Inventory", "Asset cards", "Checkout log", "Reports"],
    stackItems: ["Shell", "Inventory system"],
  },
  BudgetBeacon: {
    label: "Finance signal",
    tagline: "Budget signal beacon — lightweight personal finance alerting and tracking utilities.",
    details:
      "BudgetBeacon focuses on budget thresholds, alerts, and signal-style finance visibility for operators who want lightweight tooling before full ledger platforms.",
    highlights: ["Budget alerts", "Signal tracking", "Lightweight finance", "Shell tooling"],
    surfaceAreas: ["Alert dashboard", "Threshold rules", "Signal log", "Export"],
    stackItems: ["Shell", "Finance signals"],
  },
  BluWraith: {
    label: "Security persona",
    tagline: "BluWraith — security research persona and tooling scaffold in the Savige org.",
    details:
      "BluWraith bundles security research identity, tooling hooks, and narrative assets for cyber operations storytelling within the SavigeSystemZ ecosystem.",
    highlights: ["Security research", "Persona scaffold", "Tooling hooks", "Catalog entry"],
    surfaceAreas: ["Persona kit", "Tool index", "Research notes", "Release lane"],
    stackItems: ["Shell", "Security research"],
  },
  CodeSeal: {
    label: "Integrity tooling",
    tagline: "Code integrity sealing utilities — checksums, attestations, and release verification helpers.",
    details:
      "CodeSeal provides sealing and verification helpers so release artifacts and source snapshots can carry integrity attestations across the foundry pipeline.",
    highlights: ["Integrity seals", "Checksums", "Release verification", "Supply chain"],
    surfaceAreas: ["Seal generator", "Verifier", "Audit log", "CI hooks"],
    stackItems: ["Shell", "Integrity tooling"],
  },
  FlipHole: {
    label: "Network research",
    tagline: "FlipHole — network pivot and tunnel research utilities for authorized lab use.",
    details:
      "FlipHole explores pivot and tunnel patterns for authorized network research and lab environments — cataloged with GitHub source for transparency.",
    highlights: ["Network pivot", "Tunnel research", "Lab tooling", "Authorized use"],
    surfaceAreas: ["Pivot lab", "Tunnel configs", "Research docs", "Export"],
    stackItems: ["Shell", "Network research"],
  },
  GhostZ: {
    label: "Stealth ops scaffold",
    tagline: "GhostZ — stealth operations scaffold and low-visibility workflow experiments.",
    details:
      "GhostZ hosts stealth-operations scaffolding — low-visibility workflow patterns for authorized security research and operator training contexts.",
    highlights: ["Stealth ops", "Low visibility", "Research scaffold", "OpSec patterns"],
    surfaceAreas: ["Ops scaffold", "Pattern library", "Lab notes", "Release lane"],
    stackItems: ["Shell", "OpSec research"],
  },
  IdeaForge: {
    label: "Concept forge",
    tagline: "IdeaForge — rapid concept capture and product ideation workspace for foundry operators.",
    details:
      "IdeaForge captures product concepts, feature spikes, and ideation threads before they graduate into full catalog applications or archive entries.",
    highlights: ["Ideation", "Concept capture", "Product spikes", "Foundry intake"],
    surfaceAreas: ["Idea inbox", "Concept cards", "Promotion lane", "Archive bridge"],
    stackItems: ["Shell", "Product ideation"],
  },
  LuxeLogic: {
    label: "Luxury automation",
    tagline: "LuxeLogic — automation and logic workflows for premium lifestyle operator scenarios.",
    details:
      "LuxeLogic experiments with automation logic for premium lifestyle workflows — scheduling, concierge hooks, and integration scaffolds.",
    highlights: ["Luxury automation", "Concierge hooks", "Logic workflows", "Integration"],
    surfaceAreas: ["Automation rules", "Concierge lane", "Scheduler", "Export"],
    stackItems: ["Shell", "Automation logic"],
  },
  MFST: {
    label: "Meta factory",
    tagline: "MFST — meta-system factory template for spinning up new Savige operator scaffolds.",
    details:
      "MFST (Meta Factory System Template) provides repeatable scaffolding for new meta-system repos — conventions, scripts, and catalog-ready metadata out of the box.",
    highlights: ["Meta factory", "Repo template", "Scaffold", "Savige conventions"],
    surfaceAreas: ["Template kit", "Scaffold scripts", "Docs", "Release lane"],
    stackItems: ["Shell", "Template factory"],
  },
  ModPilot: {
    label: "Moderation pilot",
    tagline: "ModPilot — moderation workflow pilot for catalog feedback and submission review.",
    details:
      "ModPilot prototypes moderation flows that complement the SavigeSystemZ admin moderation queue — rules, triage, and operator shortcuts.",
    highlights: ["Moderation", "Triage workflows", "Review pilot", "Admin complement"],
    surfaceAreas: ["Moderation queue", "Rule engine", "Triage UI", "Audit trail"],
    stackItems: ["Shell", "Moderation tooling"],
  },
  Orignym: {
    label: "Naming system",
    tagline: "Orignym — origin-aware naming utilities for products, repos, and catalog slugs.",
    details:
      "Orignym helps generate and validate product names, repo names, and catalog slugs with origin metadata — reducing collisions across the growing Savige org.",
    highlights: ["Naming utilities", "Slug validation", "Origin metadata", "Catalog hygiene"],
    surfaceAreas: ["Name generator", "Collision check", "Origin registry", "Export"],
    stackItems: ["Shell", "Naming system"],
  },
  PromptMage: {
    label: "Prompt craft",
    tagline: "PromptMage — prompt architecture workshop for agent and LLM workflow operators.",
    details:
      "PromptMage organizes prompt templates, evaluation loops, and architecture notes for teams building LLM-powered surfaces across the Savige stack.",
    highlights: ["Prompt architecture", "Template library", "LLM workflows", "Evaluation loops"],
    surfaceAreas: ["Prompt library", "Eval runner", "Architecture notes", "Export"],
    stackItems: ["Shell", "Prompt engineering"],
  },
  SACST: {
    label: "System template",
    tagline: "SACST — Savige application and catalog system template for new repo bootstrap.",
    details:
      "SACST provides a bootstrap template for new SavigeSystemZ applications entering the catalog — metadata, scripts, and release lane conventions pre-wired.",
    highlights: ["App template", "Catalog bootstrap", "Savige conventions", "Release lane"],
    surfaceAreas: ["Template repo", "Bootstrap scripts", "Catalog metadata", "Docs"],
    stackItems: ["Shell", "Application template"],
  },
  SACT: {
    label: "Automation template",
    tagline: "SACT — Savige automation and catalog tooling template for operator scripts.",
    details:
      "SACT complements SACST with automation-first scaffolding — CI hooks, seed scripts, and operator shortcuts for catalog maintenance.",
    highlights: ["Automation template", "CI hooks", "Seed scripts", "Operator shortcuts"],
    surfaceAreas: ["Automation kit", "CI templates", "Seed scripts", "Docs"],
    stackItems: ["Shell", "Automation scaffold"],
  },
  VERITAS: {
    label: "Truth layer",
    tagline: "VERITAS — verification and truth-layer utilities for audit-friendly foundry operations.",
    details:
      "VERITAS explores verification patterns — attestations, audit trails, and truth-layer helpers that strengthen trust across catalog and release surfaces.",
    highlights: ["Verification", "Audit trails", "Truth layer", "Trust signals"],
    surfaceAreas: ["Verifier", "Attestation log", "Audit export", "Trust dashboard"],
    stackItems: ["Shell", "Verification tooling"],
  },
  Sipher: {
    label: "Crypto intelligence",
    summary: "Base44 App: Oracle Crypto Intelligence — on-chain signal and oracle-style crypto research surface.",
    tagline: "Oracle crypto intelligence — signals, context, and research-oriented crypto operator views.",
    details:
      "Sipher mirrors a Base44-built crypto intelligence application into the Savige org. It focuses on oracle-style crypto signals and research context rather than exchange trading execution.",
    highlights: ["Crypto intelligence", "Oracle signals", "Base44 mirror", "Research context"],
    surfaceAreas: ["Signal dashboard", "Oracle views", "Research notes", "Release lane"],
    stackItems: ["JavaScript", "Base44", "Crypto intelligence"],
  },
  FWST: {
    label: "Book",
    name: "FWST",
    summary: "Fiction Writing System Template and factory for structured long-form storytelling workflows.",
    tagline: "A fiction factory — templates, structure, and repeatable writing systems for novel-scale work.",
    audience: "Authors, worldbuilders, series operators, and fiction engineers",
    releaseChannel: "Catalog entry",
    details:
      "FWST packages fiction-writing conventions into a reusable factory: story bible scaffolds, chapter pipelines, character trackers, and export lanes so novels and series move from concept to manuscript with disciplined structure.",
    highlights: ["Fiction factory", "Story structure", "Template library", "Manuscript pipeline", "GitHub source"],
    surfaceAreas: ["Manuscript scaffold", "Story bible", "Chapter pipeline", "Export lane", "Series tracker"],
    stackItems: ["Go", "Writing systems", "Template factory"],
  },
  SOSTheFirstCrown: {
    label: "Game",
    name: "Shards of Savige: The First Crown",
    summary:
      "Shards of Savige: The First Crown — opening narrative game chapter in the Savige universe (GitHub mirror; local repo is authority).",
    tagline: "The opening crown chapter of the Shards of Savige interactive universe.",
    audience: "Players, readers, and narrative designers exploring the Savige fiction/game crossover",
    releaseChannel: "Catalog entry",
    details:
      "SOSTheFirstCrown anchors the Shards of Savige storyline as a playable, repo-tracked game entry. It introduces crown-chapter lore, quest hooks, and world rules that tie into the broader ShardsOfSavige universe hub.",
    highlights: ["Savige universe", "Narrative game", "Crown chapter", "Worldbuilding", "GitHub source"],
    surfaceAreas: ["Story arc", "Play loop", "World bible", "Quest hooks", "Release lane"],
    stackItems: ["Interactive fiction", "Game repo", "Narrative design"],
  },
  ShardsOfSavige: {
    label: "Game",
    summary: "Shards of Savige — shared universe hub for games, lore, and interactive media in the Savige line.",
    tagline: "The Shards of Savige universe — lore, systems, and game-facing assets in one tracked repo.",
    audience: "Players, narrative designers, worldbuilders, and Savige universe fans",
    releaseChannel: "Catalog entry",
    details:
      "ShardsOfSavige is the canonical hub for universe lore, cross-game continuity, quest lines, and asset indexes. SOSTheFirstCrown and future titles inherit canon from this repository.",
    highlights: ["Shared universe", "Lore bible", "Game hooks", "Canon index", "GitHub source"],
    surfaceAreas: ["Canon registry", "Quest lines", "Asset index", "Character bible", "Release lane"],
    stackItems: ["Game design", "Narrative systems", "Universe bible"],
  },
  "gh-gcast": {
    label: "Game",
    name: "gh-gcast",
    summary: "GCAST verbs over a game project — command vocabulary and tooling for game operator workflows.",
    tagline: "GCAST-powered verbs and automation hooks for game project operations.",
    audience: "Game developers, technical designers, and narrative systems engineers",
    releaseChannel: "Catalog entry",
    details:
      "gh-gcast encodes GCAST verbs and project automation for game repos — operator CLI hooks, verb catalogs, and documentation that keep game projects scriptable from the terminal.",
    highlights: ["GCAST verbs", "Game automation", "Operator CLI", "Verb catalog", "GitHub source"],
    surfaceAreas: ["Verb catalog", "Project hooks", "Automation scripts", "Docs", "Release lane"],
    stackItems: ["Shell", "Game tooling", "GCAST"],
  },
  GAMST: {
    label: "Game",
    summary: "Game asset and meta-system template scaffold for new SavigeSystemZ game projects.",
    tagline: "Bootstrap game repos with shared conventions, asset lanes, and operator scaffolding.",
    audience: "Game developers starting new SavigeSystemZ titles",
    releaseChannel: "Catalog entry",
    details:
      "GAMST provides a repeatable starting point for game repositories: directory conventions, asset pipeline placeholders, seed scripts, and catalog-ready metadata so new titles launch consistently.",
    highlights: ["Game scaffold", "Asset lanes", "Template repo", "Bootstrap scripts", "GitHub source"],
    surfaceAreas: ["Repo template", "Asset pipeline", "Bootstrap kit", "Docs", "Release lane"],
    stackItems: ["Shell", "Game template", "Scaffold"],
  },
};

const BASE44_REPO_OVERRIDES: Record<string, CatalogCopyOverride> = {
  "AegisWire-44": base44Override("Aegis Wireless", "Wireless security and aegis-style network assessment tooling.", "JavaScript"),
  "CleanoutConnect-44": base44Override(
    "CleanoutConnect",
    "Base44 export of the CleanoutConnect marketplace — cleanouts, hauling, and local service matching.",
    "Shell",
  ),
  "CompanionVault-44": base44Override(
    "Companion Vault",
    "Secure companion and credential vault experience exported from Base44.",
    "JavaScript",
  ),
  "CouplesWealthOS-44": base44Override(
    "Couples Wealth OS",
    "Joint finance and wealth operating system for couples — shared accounts, goals, and planning.",
    "JavaScript",
  ),
  "EtherTrain-44": base44Override(
    "Etherweave Learning Platform",
    "Training and learning surface aligned with Etherweave wireless security education paths.",
    "JavaScript",
  ),
  "GuardianIntel-44": base44Override(
    "Guardian Intel",
    "Guardian-style intelligence dashboard for security operators and situational awareness.",
    "JavaScript",
  ),
  "MetaCommander-44": base44Override(
    "MetaCommander",
    "Meta-system command console for orchestrating agents and operator workflows.",
    "JavaScript",
  ),
  "OmniForgeNexus-44": base44Override(
    "OmniForge Nexus",
    "Omni-forge nexus hub connecting multiple builder surfaces and operator lanes.",
    "JavaScript",
  ),
  "TechPulseBriefs-44": base44Override(
    "TechPulse Briefs",
    "Technology pulse briefs — curated signal summaries for technical operators.",
    "JavaScript",
  ),
  "TheEclecticExchange-44": base44Override(
    "The Eclectic Exchange",
    "Eclectic marketplace and exchange surface for mixed digital goods and operator services.",
    "JavaScript",
  ),
  "VDO-44": base44Override(
    "VA Disability Claim Assistant",
    "VA disability claim assistance companion — complements the Vetraxis case-orchestration lane.",
    "JavaScript",
  ),
  "VulnFlow-44": base44Override(
    "VulnFlow Scanner",
    "Vulnerability flow scanner for structured finding intake and triage workflows.",
    "JavaScript",
  ),
  "wraiths-44": base44Override(
    "WRAITHS Cybersecurity Suite",
    "WRAITHS cybersecurity suite — research and operator tooling under the Savige security line.",
    "JavaScript",
  ),
};

function base44Override(
  appTitle: string,
  focus: string,
  language: string,
): CatalogCopyOverride {
  return {
    label: "Base44 mirror",
    summary: `Base44 App: ${appTitle} — mirrored into SavigeSystemZ for catalog tracking, release lane, and source transparency.`,
    tagline: `${appTitle} — Base44-exported application mirrored on GitHub for foundry catalog integration.`,
    audience: "Operators evaluating Base44 exports, buyers researching SavigeSystemZ mirrors, and integration engineers",
    releaseChannel: "Catalog entry",
    details: `${focus} Exported from Base44 and tracked in the SavigeSystemZ org so it participates in the public catalog alongside native foundry applications — with v0.1.0 release lane, GitHub source archive, and pricing marked TBD.`,
    highlights: ["Base44 export", "GitHub mirror", "Catalog entry", "Release lane", language],
    surfaceAreas: ["Public catalog page", "GitHub source", "Release notes", "Download lane", "Pricing TBD"],
    stackItems: [language, "Base44", "GitHub mirror", "SavigeSystemZ catalog"],
  };
}

export { BASE44_REPO_OVERRIDES };
