export const archiveCategoryOptions = [
  "OPERATING_SYSTEM",
  "AUTOMATION",
  "CONFIGURATION",
  "CONTAINER_STACK",
  "VIRTUAL_MACHINE",
  "MODEL",
  "RESEARCH",
  "WRITING",
  "SECURITY_TOOL",
  "HACKING_CONTENT",
  "GAMES",
  "BOOKS",
  "TUTORIALS",
  "SOFTWARE_FREEWARE",
  "AI_META_SYSTEMS",
  "OPNSENSE_BUILDS",
] as const;

export type ArchiveCategoryRecord = (typeof archiveCategoryOptions)[number];

export const archiveCategoryLabels: Record<ArchiveCategoryRecord, string> = {
  OPERATING_SYSTEM: "Custom OS builds",
  AUTOMATION: "Scripts & Automation",
  CONFIGURATION: "Dotfiles & Settings",
  CONTAINER_STACK: "Container stack",
  VIRTUAL_MACHINE: "VM kit",
  MODEL: "Trained AIs & Models",
  RESEARCH: "Research archive",
  WRITING: "Guides, Tips & Tricks",
  SECURITY_TOOL: "Security Recommendations",
  HACKING_CONTENT: "Hacking & Payloads",
  GAMES: "Games",
  BOOKS: "Books",
  TUTORIALS: "Instructional Videos & Links",
  SOFTWARE_FREEWARE: "Software & Freeware",
  AI_META_SYSTEMS: "SysAdmin Meta Systems & AIs",
  OPNSENSE_BUILDS: "OPNsense builds",
};

export const archiveCategoryThemes: Record<ArchiveCategoryRecord, string> = {
  OPERATING_SYSTEM:
    "bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.2),transparent_34%),linear-gradient(180deg,#071726_0%,#020712_100%)]",
  AUTOMATION:
    "bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.2),transparent_34%),linear-gradient(180deg,#111827_0%,#020617_100%)]",
  CONFIGURATION:
    "bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.2),transparent_34%),linear-gradient(180deg,#16100a_0%,#020617_100%)]",
  CONTAINER_STACK:
    "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_34%),linear-gradient(180deg,#09111e_0%,#020617_100%)]",
  VIRTUAL_MACHINE:
    "bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,#0b1021_0%,#020617_100%)]",
  MODEL:
    "bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.2),transparent_34%),linear-gradient(180deg,#160b1a_0%,#020617_100%)]",
  RESEARCH:
    "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.18),transparent_34%),linear-gradient(180deg,#1a0d0d_0%,#020617_100%)]",
  WRITING:
    "bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_34%),linear-gradient(180deg,#180d16_0%,#020617_100%)]",
  SECURITY_TOOL:
    "bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,#17090c_0%,#020617_100%)]",
  HACKING_CONTENT:
    "bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.18),transparent_34%),linear-gradient(180deg,#200000_0%,#000000_100%)]",
  GAMES:
    "bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.2),transparent_34%),linear-gradient(180deg,#180b24_0%,#020617_100%)]",
  BOOKS:
    "bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(202,138,4,0.18),transparent_34%),linear-gradient(180deg,#171206_0%,#020617_100%)]",
  TUTORIALS:
    "bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.18),transparent_34%),linear-gradient(180deg,#0a1128_0%,#020617_100%)]",
  SOFTWARE_FREEWARE:
    "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.2),transparent_34%),linear-gradient(180deg,#061a14_0%,#020617_100%)]",
  AI_META_SYSTEMS:
    "bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.2),transparent_34%),linear-gradient(180deg,#0f0e26_0%,#020617_100%)]",
  OPNSENSE_BUILDS:
    "bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.18),transparent_34%),linear-gradient(180deg,#1c0d02_0%,#020617_100%)]",
};

export function getArchiveCategoryLabel(category: ArchiveCategoryRecord): string {
  return archiveCategoryLabels[category];
}
