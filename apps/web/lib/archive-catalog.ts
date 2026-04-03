import type { ArchiveCategoryRecord } from "@/lib/archive-taxonomy";
import { getArchiveCategoryLabel } from "@/lib/archive-taxonomy";

export type ArchiveVisibility = "public" | "private" | "draft";

export type ArchiveEntryRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ArchiveCategoryRecord;
  categoryLabel: string;
  visibility: ArchiveVisibility;
  featured: boolean;
  stageLabel?: string;
  artifactFormat?: string;
  previewImageUrl?: string;
  previewThumbnailUrl?: string;
  details?: string;
  tags: string[];
  stackItems: string[];
  artifactUrl?: string;
  artifactLabel?: string;
  createdAt: string;
};

function withCategoryLabel(entry: Omit<ArchiveEntryRecord, "categoryLabel">): ArchiveEntryRecord {
  return {
    ...entry,
    categoryLabel: getArchiveCategoryLabel(entry.category),
  };
}

export const archiveCatalog: ArchiveEntryRecord[] = [
  withCategoryLabel({
    id: "archive-001",
    slug: "signal-os-build-kit",
    title: "Signal OS Build Kit",
    summary: "Operator-grade Linux workstation baseline for field tooling, telemetry work, and controlled local deployment.",
    category: "OPERATING_SYSTEM",
    visibility: "public",
    featured: true,
    stageLabel: "Controlled build",
    artifactFormat: "Image set / bootstrap scripts",
    details:
      "A hardened Linux build lane that packages package manifests, shell bootstrap logic, and operator-focused workstation conventions into a repeatable starting point.",
    tags: ["Linux build", "Operator desktop", "Bootstrap", "Hardening"],
    stackItems: ["Bash", "systemd", "Package manifests", "Bootstrap automation"],
    artifactUrl: "/services",
    artifactLabel: "Request build access",
    createdAt: "2026-04-01T12:00:00.000Z",
  }),
  withCategoryLabel({
    id: "archive-002",
    slug: "dotfiles-control-layer",
    title: "Dotfiles Control Layer",
    summary: "Curated shell, terminal, rc, and automation config pack with reproducible rollout patterns.",
    category: "CONFIGURATION",
    visibility: "public",
    featured: true,
    stageLabel: "Public archive drop",
    artifactFormat: "Config pack / rc files",
    details:
      "A high-signal configuration layer for shell environments, terminal workflows, aliases, prompts, editor defaults, and machine bootstrap glue that can be versioned like a product.",
    tags: ["Dotfiles", "RC files", "Shell UX", "Portable config"],
    stackItems: ["Zsh", "Tmux", "Neovim", "Shell automation"],
    artifactUrl: "/downloads",
    artifactLabel: "See delivery lanes",
    createdAt: "2026-03-30T12:00:00.000Z",
  }),
  withCategoryLabel({
    id: "archive-003",
    slug: "forge-cluster-stack",
    title: "Forge Cluster Stack",
    summary: "Container and compose-based service stack for local labs, demo systems, and operator sandboxes.",
    category: "CONTAINER_STACK",
    visibility: "public",
    featured: false,
    stageLabel: "Portable stack",
    artifactFormat: "OCI / Compose / env packs",
    details:
      "A layered container kit for standing up service bundles, backing stores, reverse proxies, and supporting tooling without re-deriving the same local architecture every time.",
    tags: ["Containers", "Compose", "Lab stack", "Service bundles"],
    stackItems: ["Docker", "Compose", "Env packs", "Health checks"],
    artifactUrl: "/downloads",
    artifactLabel: "Review release lane",
    createdAt: "2026-03-26T12:00:00.000Z",
  }),
  withCategoryLabel({
    id: "archive-004",
    slug: "prompt-weight-lab",
    title: "Prompt Weight Lab",
    summary: "Workspace for prompt systems, trained checkpoints, eval notes, and private model packaging.",
    category: "MODEL",
    visibility: "public",
    featured: true,
    stageLabel: "Research lane",
    artifactFormat: "GGUF / safetensors / eval docs",
    details:
      "A structured place for AI work that needs more than a repo README: prompt packs, tuning notes, model artifacts, benchmark trails, and release discipline around experimental outputs.",
    tags: ["Models", "LLM", "Prompt systems", "Evaluation"],
    stackItems: ["Inference runtimes", "Prompt packs", "Eval notes", "Artifact packaging"],
    artifactUrl: "/services",
    artifactLabel: "Commission AI workflow",
    createdAt: "2026-03-22T12:00:00.000Z",
  }),
  withCategoryLabel({
    id: "archive-005",
    slug: "red-signal-field-notes",
    title: "Red Signal Field Notes",
    summary: "Security research writeups, operator notes, books, and controlled technical briefings.",
    category: "RESEARCH",
    visibility: "public",
    featured: false,
    stageLabel: "Research archive",
    artifactFormat: "Notes / books / briefings",
    details:
      "A publication lane for high-signal documentation, security research, workflow notes, and private-to-public writeups that deserve stronger framing than a scattered gist or throwaway markdown file.",
    tags: ["Research", "Security notes", "Books", "Briefings"],
    stackItems: ["Markdown", "Operational notes", "Publication workflow", "Review passes"],
    artifactUrl: "/bio",
    artifactLabel: "See founder context",
    createdAt: "2026-03-18T12:00:00.000Z",
  }),
];
