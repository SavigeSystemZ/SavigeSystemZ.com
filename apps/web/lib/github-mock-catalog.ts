import type { GithubRepoSummary } from "@/lib/github-client";

/** Deterministic SavigeSystemZ org mirror for CI / GITHUB_MOCK_MODE=1. */
export const MOCK_SAVIGE_ORG_REPOS: Array<{
  name: string;
  description: string | null;
  language: string | null;
}> = [
  { name: "AegisWire-44", description: "Base44 App: Aegis Wireless", language: "JavaScript" },
  { name: "BluWraith", description: null, language: "Shell" },
  { name: "BudgetBeacon", description: null, language: "Shell" },
  { name: "CandleCompass", description: null, language: "TypeScript" },
  {
    name: "CleanoutConnect",
    description: "CleanoutConnect marketplace for cleanouts, junk removal, estate cleanups",
    language: "TypeScript",
  },
  { name: "CleanoutConnect-44", description: "Base44 App: CleanoutConnect", language: "Shell" },
  { name: "CodeSeal", description: null, language: "Shell" },
  { name: "CompanionVault-44", description: "Base44 App: Companion Vault", language: "JavaScript" },
  {
    name: "ContextCore",
    description: "World-Class Context and Conversation Recording App for AI Enhancement",
    language: "Python",
  },
  { name: "CouplesWealthOS-44", description: "Base44 App: Couples Wealth OS", language: "JavaScript" },
  {
    name: "DeepWeave",
    description: "Desktop-first AI training operating system for governed open-weight workflows",
    language: "Shell",
  },
  { name: "EtherTrain-44", description: "Base44 App: Etherweave Learning Platform", language: "JavaScript" },
  { name: "FWST", description: "Fiction Writing System Template and factory", language: "Go" },
  { name: "FlipHole", description: null, language: "Shell" },
  { name: "ForgeCouncil", description: "Forge Council — application workspace (AI agent OS scaffold)", language: "Shell" },
  { name: "GAMST", description: null, language: "Shell" },
  { name: "GhostZ", description: null, language: "Shell" },
  { name: "GuardianIntel-44", description: "Base44 App: Guardian Intel", language: "JavaScript" },
  { name: "IdeaForge", description: null, language: "Shell" },
  {
    name: "Immortality",
    description: "Longevity science intelligence platform — ORACLE AI, compound database",
    language: "TypeScript",
  },
  { name: "LedgerLoop", description: null, language: "TypeScript" },
  { name: "LuxeLogic", description: null, language: "Shell" },
  { name: "MFST", description: null, language: "Shell" },
  { name: "MetaCommander-44", description: "Base44 App: MetaCommander", language: "JavaScript" },
  { name: "MetaScope", description: "AI Agent Metasystem Evaluator", language: "Shell" },
  { name: "ModPilot", description: null, language: "Shell" },
  { name: "OmniForgeNexus-44", description: "Base44 App: OmniForge Nexus", language: "JavaScript" },
  { name: "Orignym", description: null, language: "Shell" },
  { name: "PalmOracle", description: "Palm Oracle", language: "Shell" },
  { name: "PharmPhreak", description: "Expert AAS & Pro-Hormone Education Hub", language: "Shell" },
  { name: "PromptMage", description: null, language: "Shell" },
  { name: "RSIGlobe", description: "An informative and helpful trading algorithmic application", language: "Python" },
  { name: "SACST", description: null, language: "Shell" },
  { name: "SACT", description: null, language: "Shell" },
  {
    name: "SOSTheFirstCrown",
    description: "Shards of Savige: The First Crown — narrative game in the Savige universe",
    language: "Shell",
  },
  { name: "SavOpZ", description: null, language: "JavaScript" },
  {
    name: "SavigeAI",
    description: "SavigeAI: local-seeded super-AI training + meta-system orchestrator",
    language: "Python",
  },
  {
    name: "SavigeSystemZ.com",
    description: "Flagship software foundry website and operations platform",
    language: "TypeScript",
  },
  { name: "ShadowCall", description: null, language: "Python" },
  { name: "ShardsOfSavige", description: null, language: "Shell" },
  { name: "SiliconLedger", description: null, language: "Shell" },
  { name: "Sipher", description: "Base44 App: Oracle Crypto Intelligence", language: "JavaScript" },
  { name: "SteadyStack", description: null, language: "TypeScript" },
  { name: "TechPulseBriefs-44", description: "Base44 App: TechPulse Briefs", language: "JavaScript" },
  { name: "TheEclecticExchange-44", description: "Base44 App: The Eclectic Exchange", language: "JavaScript" },
  { name: "VDO-44", description: "Base44 App: VA Disability Claim Assistant", language: "JavaScript" },
  { name: "VERITAS", description: null, language: null },
  { name: "Vetraxis", description: "AI-assisted VA disability case orchestration platform", language: "TypeScript" },
  { name: "VulnFlow-44", description: "Base44 App: VulnFlow Scanner", language: "JavaScript" },
  { name: "etherweave", description: null, language: "Python" },
  { name: "gh-gcast", description: "GCAST verbs over a game project", language: "Shell" },
  { name: "wraiths-44", description: "Base44 App: WRAITHS Cybersecurity Suite", language: "JavaScript" },
];

export function buildMockOrgRepoSummaries(org: string): GithubRepoSummary[] {
  return MOCK_SAVIGE_ORG_REPOS.map((repo, index) => ({
    fullName: `${org}/${repo.name}`,
    name: repo.name,
    owner: org,
    description: repo.description,
    htmlUrl: `https://github.com/${org}/${encodeURIComponent(repo.name)}`,
    homepage: null,
    defaultBranch: "main",
    language: repo.language,
    stargazersCount: 3 + (index % 7),
    forksCount: index % 3,
    openIssuesCount: index % 2,
    visibility: "public" as const,
    pushedAt: "2026-06-07T00:00:00Z",
  }));
}
