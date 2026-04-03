import type { PublicApplicationDetailRecord } from "@/lib/catalog-resolver";
import type { ArchiveEntryRecord } from "@/lib/archive-catalog";
import {
  founderSignals,
  pricingPlans,
  projectTracks,
  releaseLanes,
  trustSignals,
} from "@/lib/showcase-content";

export type ConciergeRoute = {
  href: string;
  label: string;
  reason: string;
};

export type ConciergeReply = {
  answer: string;
  grounded: true;
  topic:
    | "applications"
    | "archive"
    | "downloads"
    | "pricing"
    | "services"
    | "bio"
    | "reviews"
    | "owner"
    | "creator"
    | "general";
  routes: ConciergeRoute[];
  highlights: string[];
};

type KnowledgeBase = {
  applications: PublicApplicationDetailRecord[];
  archiveEntries: ArchiveEntryRecord[];
};

type SearchMatch = {
  kind: "application" | "archive";
  score: number;
  title: string;
  href: string;
  summary: string;
  detail?: string;
};

const stopWords = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "at",
  "for",
  "from",
  "here",
  "how",
  "i",
  "im",
  "is",
  "me",
  "my",
  "of",
  "on",
  "or",
  "show",
  "site",
  "the",
  "this",
  "to",
  "what",
  "with",
]);

const topicKeywords = {
  applications: ["app", "application", "catalog", "product", "software", "tool", "platform"],
  archive: [
    "archive",
    "linux",
    "script",
    "scripts",
    "config",
    "dotfiles",
    "container",
    "containers",
    "vm",
    "model",
    "models",
    "research",
    "books",
    "lua",
  ],
  downloads: ["download", "downloads", "release", "releases", "installer", "install", "binary", "asset", "version"],
  pricing: ["price", "pricing", "cost", "budget", "quote", "retainer", "plan"],
  services: ["custom", "commission", "service", "services", "build", "internal", "automation", "prototype", "project"],
  bio: ["bio", "founder", "background", "experience", "who", "owner"],
  reviews: ["review", "reviews", "trust", "feedback", "testimonial", "proof"],
  owner: ["admin", "vault", "private", "secure", "security", "owner", "passkeys", "audit"],
  creator: ["creator", "submit", "submission", "publish", "moderation", "intake"],
  general: [],
} satisfies Record<ConciergeReply["topic"], string[]>;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      normalize(text)
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !stopWords.has(token)),
    ),
  );
}

function clampRoutes(routes: ConciergeRoute[]): ConciergeRoute[] {
  const deduped = new Map<string, ConciergeRoute>();
  for (const route of routes) {
    if (!deduped.has(route.href)) deduped.set(route.href, route);
  }
  return Array.from(deduped.values()).slice(0, 3);
}

function buildSearchMatches(message: string, knowledge: KnowledgeBase): SearchMatch[] {
  const tokens = tokenize(message);
  if (tokens.length === 0) return [];

  const matches: SearchMatch[] = [];

  for (const application of knowledge.applications) {
    const haystack = normalize(
      [
        application.name,
        application.slug,
        application.summary,
        application.tagline,
        application.label,
        application.details,
        ...(application.highlights ?? []),
        ...(application.surfaceAreas ?? []),
        ...(application.stackItems ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    if (score > 0) {
      matches.push({
        kind: "application",
        score,
        title: application.name,
        href: `/applications/${application.slug}`,
        summary: application.summary,
        detail: application.tagline ?? application.releaseChannel ?? undefined,
      });
    }
  }

  for (const entry of knowledge.archiveEntries) {
    const haystack = normalize(
      [
        entry.title,
        entry.slug,
        entry.summary,
        entry.categoryLabel,
        entry.details,
        ...(entry.tags ?? []),
        ...(entry.stackItems ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    if (score > 0) {
      matches.push({
        kind: "archive",
        score,
        title: entry.title,
        href: `/archive/${entry.slug}`,
        summary: entry.summary,
        detail: entry.categoryLabel,
      });
    }
  }

  return matches.sort((left, right) => right.score - left.score);
}

function pickTopic(message: string): ConciergeReply["topic"] {
  const lowered = normalize(message);
  let bestTopic: ConciergeReply["topic"] = "general";
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(topicKeywords) as Array<
    [ConciergeReply["topic"], string[]]
  >) {
    const score = keywords.reduce((total, keyword) => total + (lowered.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

function describeMatches(matches: SearchMatch[]): string {
  if (matches.length === 0) return "";
  if (matches.length === 1) return `The closest match is ${matches[0].title}.`;
  return `The strongest matches are ${matches
    .slice(0, 3)
    .map((match) => match.title)
    .join(", ")}.`;
}

export function buildConciergeReply(message: string, knowledge: KnowledgeBase): ConciergeReply {
  const matches = buildSearchMatches(message, knowledge);
  const topApplications = knowledge.applications.slice(0, 2);
  const topArchiveEntries = knowledge.archiveEntries.slice(0, 2);
  const totalReleaseCount = knowledge.applications.reduce((count, app) => count + app.versions.length, 0);
  const totalAssetCount = knowledge.applications.reduce(
    (count, app) => count + app.versions.reduce((innerCount, version) => innerCount + version.assets.length, 0),
    0,
  );
  const topic = pickTopic(message);

  if (
    matches[0]?.score >= 2 &&
    (topic === "applications" || topic === "archive" || topic === "downloads" || topic === "general")
  ) {
    const primary = matches[0];
    const related = matches.slice(1, 3).map((match) => `${match.title} (${match.kind})`);
    return {
      grounded: true,
      topic: primary.kind === "application" ? "applications" : "archive",
      answer: `${primary.title} is the strongest match. ${primary.summary}${primary.detail ? ` ${primary.detail}.` : ""}${
        related.length > 0 ? ` Related routes: ${related.join(", ")}.` : ""
      }`,
      routes: clampRoutes([
        { href: primary.href, label: `Open ${primary.title}`, reason: "Direct route to the closest match." },
        { href: primary.kind === "application" ? "/downloads" : "/archive", label: primary.kind === "application" ? "Open downloads" : "Open archive", reason: "Broader lane around this match." },
        { href: "/services", label: "Request a custom build", reason: "Use this if you want a private or tailored version of the same idea." },
      ]),
      highlights: [primary.summary, ...matches.slice(1, 3).map((match) => match.title)],
    };
  }

  switch (topic) {
    case "applications":
      return {
        grounded: true,
        topic,
        answer: `The application catalog is the flagship product lane. Right now the strongest public entries are ${topApplications
          .map((app) => app.name)
          .join(" and ")}, each with positioning, release history, and delivery routes.`,
        routes: clampRoutes([
          { href: "/applications", label: "Browse applications", reason: "Full flagship catalog with detail pages." },
          { href: "/downloads", label: "Open downloads", reason: "Jump straight to release files and delivery lanes." },
          { href: "/pricing", label: "Review pricing", reason: "See packaged launch drops and deeper build modes." },
        ]),
        highlights: topApplications.map((app) => `${app.name}: ${app.summary}`),
      };
    case "archive":
      return {
        grounded: true,
        topic,
        answer: `The archive is the non-app engineering lane: Linux builds, configs, containers, model work, and research drops. ${describeMatches(matches)} Featured archive entries currently include ${topArchiveEntries
          .map((entry) => entry.title)
          .join(" and ")}.`,
        routes: clampRoutes([
          { href: "/archive", label: "Browse archive", reason: "See the full engineering archive." },
          ...topArchiveEntries.slice(0, 2).map((entry) => ({
            href: `/archive/${entry.slug}`,
            label: entry.title,
            reason: `${entry.categoryLabel} entry with deeper framing.`,
          })),
        ]),
        highlights: topArchiveEntries.map((entry) => `${entry.title}: ${entry.categoryLabel}`),
      };
    case "downloads":
      return {
        grounded: true,
        topic,
        answer: `The downloads lane is where release discipline shows up. There are ${totalReleaseCount} visible release tracks and ${totalAssetCount} public or entitlement-aware assets across the current catalog.`,
        routes: clampRoutes([
          { href: "/downloads", label: "Open downloads", reason: "Version history, files, and release packaging." },
          { href: "/applications", label: "See app context", reason: "Start from the product story before jumping into assets." },
          { href: "/pricing", label: "Review purchase modes", reason: "Some assets route through checkout or entitlement flows." },
        ]),
        highlights: releaseLanes.map((lane) => `${lane.title}: ${lane.summary}`),
      };
    case "pricing":
      return {
        grounded: true,
        topic,
        answer: `Pricing is structured around product drops and deeper engineering work. The live lanes are ${pricingPlans
          .map((plan) => plan.name)
          .join(", ")}, so visitors can move from public software to scoped internal builds without leaving the same shell.`,
        routes: clampRoutes([
          { href: "/pricing", label: "Open pricing", reason: "See the packaged commercial lanes." },
          { href: "/services", label: "Request project", reason: "Best route for custom scope or internal tooling." },
          { href: "/applications", label: "View catalog", reason: "Tie pricing back to the current flagship apps." },
        ]),
        highlights: pricingPlans.map((plan) => `${plan.name}: ${plan.price}`),
      };
    case "services":
      return {
        grounded: true,
        topic,
        answer: `Custom work is positioned as build tracks, not a vague contact form. The strongest fits right now are ${projectTracks
          .map((track) => track.name)
          .join(", ")}, covering prototypes, deeper platform builds, and environment engineering.`,
        routes: clampRoutes([
          { href: "/services", label: "Request project", reason: "Start the scoped build intake." },
          { href: "/pricing", label: "Review build lanes", reason: "Compare launch drops against custom engagement modes." },
          { href: "/archive", label: "Browse engineering archive", reason: "See the kinds of non-app systems work the site is set up to publish." },
        ]),
        highlights: projectTracks.map((track) => `${track.name}: ${track.summary}`),
      };
    case "bio":
      return {
        grounded: true,
        topic,
        answer: `The founder/bio surface is positioned around systems work, security discipline, and applied AI instead of a generic resume summary.`,
        routes: clampRoutes([
          { href: "/bio", label: "Open bio", reason: "Founder context and engineering posture." },
          { href: "/archive", label: "Browse archive", reason: "See the broader systems and research output." },
          { href: "/services", label: "Request project", reason: "Translate that background into build work." },
        ]),
        highlights: founderSignals.map((signal) => `${signal.title}: ${signal.summary}`),
      };
    case "reviews":
      return {
        grounded: true,
        topic,
        answer: `The reviews lane is framed around moderated trust, delivery receipts, and security posture rather than anonymous noise.`,
        routes: clampRoutes([
          { href: "/reviews", label: "Open reviews", reason: "Trust surface and quality framing." },
          { href: "/downloads", label: "Open downloads", reason: "Release traces and assets support the trust story." },
          { href: "/pricing", label: "Review offers", reason: "Move from trust signals into concrete buying lanes." },
        ]),
        highlights: trustSignals.map((signal) => `${signal.title}: ${signal.summary}`),
      };
    case "owner":
      return {
        grounded: true,
        topic,
        answer: `Private operations are already part of the site architecture: owner auth, release control, audits, vault flows, and protected upload paths. That side stays behind the owner login rather than leaking into the public catalog.`,
        routes: clampRoutes([
          { href: "/owner/login", label: "Owner login", reason: "Private control plane entry." },
          { href: "/downloads", label: "Review delivery lanes", reason: "Public-facing release behavior connects to owner operations." },
          { href: "/services", label: "Commission private build", reason: "Use this for secure or internal-facing work." },
        ]),
        highlights: ["Owner admin console", "Encrypted vault", "Audit trail"],
      };
    case "creator":
      return {
        grounded: true,
        topic,
        answer: `The creator lane is meant for staged submissions into the moderation flow, whether the artifact is an application, archive drop, research kit, or system pack.`,
        routes: clampRoutes([
          { href: "/creator", label: "Open creator center", reason: "Submit a build or artifact for review." },
          { href: "/archive", label: "Browse archive", reason: "See how non-app work is framed once accepted." },
          { href: "/applications", label: "Browse applications", reason: "See the flagship product presentation standard." },
        ]),
        highlights: ["Creator intake", "Moderation queue", "Owner review flow"],
      };
    default:
      return {
        grounded: true,
        topic: "general",
        answer: `This site is split into a flagship app catalog, an engineering archive, release/download lanes, and custom build intake. ${describeMatches(matches)} If you already know whether you want software, archive work, or a scoped build, I can route you directly.`,
        routes: clampRoutes([
          { href: "/applications", label: "Applications", reason: "Flagship software catalog." },
          { href: "/archive", label: "Archive", reason: "Linux builds, configs, containers, research, and models." },
          { href: "/services", label: "Request project", reason: "Best route for a custom build or private deployment." },
        ]),
        highlights: [
          `${knowledge.applications.length} public applications`,
          `${knowledge.archiveEntries.length} archive entries`,
          `${totalAssetCount} visible release assets`,
        ],
      };
  }
}
