export const creatorSubmissionTypeOptions = [
  "APPLICATION",
  "ARCHIVE_ENTRY",
  "CONFIG_PACK",
  "CONTAINER_STACK",
  "MODEL",
  "RESEARCH",
  "SECURITY_TOOL",
  "AUTOMATION",
] as const;

export type CreatorSubmissionTypeRecord = (typeof creatorSubmissionTypeOptions)[number];

export const creatorSubmissionTypeLabels: Record<CreatorSubmissionTypeRecord, string> = {
  APPLICATION: "Application",
  ARCHIVE_ENTRY: "Archive entry",
  CONFIG_PACK: "Config pack",
  CONTAINER_STACK: "Container stack",
  MODEL: "Model / AI artifact",
  RESEARCH: "Research drop",
  SECURITY_TOOL: "Security tool",
  AUTOMATION: "Automation kit",
};

export const creatorSubmissionTypeDescriptions: Record<CreatorSubmissionTypeRecord, string> = {
  APPLICATION: "Flagship software, operator tools, storefront-ready products, or internal platforms.",
  ARCHIVE_ENTRY: "Engineering archive work such as Linux builds, notes, books, scripts, or system packs.",
  CONFIG_PACK: "Dotfiles, shell layers, RC files, editor presets, and workstation bootstrap assets.",
  CONTAINER_STACK: "Compose kits, OCI bundles, service clusters, and repeatable local lab environments.",
  MODEL: "Prompt systems, checkpoints, evaluation packs, and model-facing release artifacts.",
  RESEARCH: "Technical briefings, experiments, writeups, books, and long-form engineering notes.",
  SECURITY_TOOL: "Offensive, defensive, or workflow security tooling that needs review before release.",
  AUTOMATION: "Installers, orchestrators, launchers, deployment helpers, and repeatable automation paths.",
};

export const creatorSubmissionStatusOptions = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "HOLD",
  "REJECTED",
] as const;

export type CreatorSubmissionStatusRecord = (typeof creatorSubmissionStatusOptions)[number];

export const creatorSubmissionStatusLabels: Record<CreatorSubmissionStatusRecord, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  APPROVED: "Approved",
  HOLD: "Hold",
  REJECTED: "Rejected",
};
