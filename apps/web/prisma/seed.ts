import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const apps = [
    {
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
      highlights: ["Signal inventory", "Operator workflow", "Evidence pipeline", "Secure deployment"].join("\n"),
      surfaceAreas: ["Assessment cockpit", "Report packaging", "Release control", "Private entitlement"].join("\n"),
      stackItems: ["Next.js", "Prisma", "Private vault", "Signed download flow"].join("\n"),
      visibility: "PUBLIC" as const,
      featured: true,
    },
    {
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
      highlights: ["Environment bootstrap", "Container-aware", "Portable conventions", "Fast local setup"].join("\n"),
      surfaceAreas: ["Installer flow", "Stack definitions", "Environment health", "Update channel"].join("\n"),
      stackItems: ["Node", "Shell automation", "Containers", "Release artifacts"].join("\n"),
      visibility: "PUBLIC" as const,
      featured: false,
    },
  ];

  for (const app of apps) {
    await prisma.application.upsert({
      where: { slug: app.slug },
      create: app,
      update: {
        name: app.name,
        summary: app.summary,
        label: app.label,
        tagline: app.tagline,
        audience: app.audience,
        priceLabel: app.priceLabel,
        releaseChannel: app.releaseChannel,
        details: app.details,
        highlights: app.highlights,
        surfaceAreas: app.surfaceAreas,
        stackItems: app.stackItems,
        visibility: app.visibility,
        featured: app.featured,
      },
    });
  }

  const wireless = await prisma.application.findUnique({ where: { slug: "wireless-ops-suite" } });
  if (wireless) {
    const version = await prisma.applicationVersion.upsert({
      where: {
        applicationId_version: {
          applicationId: wireless.id,
          version: "0.1.0",
        },
      },
      create: {
        applicationId: wireless.id,
        version: "0.1.0",
        changelog: "Initial seeded release placeholder for admin and download wiring.",
      },
      update: {
        changelog: "Initial seeded release placeholder for admin and download wiring.",
      },
    });

    await prisma.releaseAsset.deleteMany({
      where: { versionId: version.id },
    });

    await prisma.releaseAsset.createMany({
      data: [
        {
          versionId: version.id,
          fileName: "wireless-ops-suite-0.1.0-operator-kit.zip",
          fileUrl: "https://example.com/downloads/wireless-ops-suite-0.1.0-operator-kit.zip",
          checksum: "sha256:wireless-demo-build",
          visibility: "ENTITLED",
        },
        {
          versionId: version.id,
          fileName: "wireless-ops-suite-0.1.0-release-notes.pdf",
          fileUrl: "https://example.com/downloads/wireless-ops-suite-0.1.0-release-notes.pdf",
          checksum: "sha256:wireless-release-notes",
          visibility: "PUBLIC",
        },
      ],
    });

    await prisma.applicationMedia.deleteMany({
      where: { applicationId: wireless.id },
    });

    await prisma.applicationMedia.createMany({
      data: [
        {
          applicationId: wireless.id,
          title: "Signal cartography command grid",
          altText: "A futuristic control-panel style showcase image for Wireless Ops Suite with signal nodes and operator status panels.",
          description: "A flagship visual that frames Wireless Ops Suite as a field-ready command deck.",
          mediaUrl: "/showcase/wireless-ops-suite-command-grid.svg",
          featured: true,
          sortOrder: 10,
        },
        {
          applicationId: wireless.id,
          title: "Topology and delivery map",
          altText: "An abstract signal-topology artwork showing mapped nodes and delivery zones for Wireless Ops Suite.",
          description: "A second-stage visual focused on mapping, topology, and controlled artifact flow.",
          mediaUrl: "/showcase/wireless-ops-suite-signal-map.svg",
          featured: false,
          sortOrder: 20,
        },
      ],
    });
  }

  const launcher = await prisma.application.findUnique({ where: { slug: "stack-launcher" } });
  if (launcher) {
    const version = await prisma.applicationVersion.upsert({
      where: {
        applicationId_version: {
          applicationId: launcher.id,
          version: "0.3.0",
        },
      },
      create: {
        applicationId: launcher.id,
        version: "0.3.0",
        changelog: "Environment bootstrap baseline with release-center ready packaging.",
      },
      update: {
        changelog: "Environment bootstrap baseline with release-center ready packaging.",
      },
    });

    await prisma.releaseAsset.deleteMany({
      where: { versionId: version.id },
    });

    await prisma.releaseAsset.createMany({
      data: [
        {
          versionId: version.id,
          fileName: "stack-launcher-0.3.0-linux-x64.tar.gz",
          fileUrl: "https://example.com/downloads/stack-launcher-0.3.0-linux-x64.tar.gz",
          checksum: "sha256:stack-launcher-linux",
          visibility: "PUBLIC",
        },
        {
          versionId: version.id,
          fileName: "stack-launcher-0.3.0-config-pack.zip",
          fileUrl: "https://example.com/downloads/stack-launcher-0.3.0-config-pack.zip",
          checksum: "sha256:stack-launcher-config-pack",
          visibility: "ENTITLED",
        },
      ],
    });

    await prisma.applicationMedia.deleteMany({
      where: { applicationId: launcher.id },
    });

    await prisma.applicationMedia.createMany({
      data: [
        {
          applicationId: launcher.id,
          title: "Control plane interface",
          altText: "A futuristic control plane artwork for Stack Launcher showing launch channels, service stacks, and runtime lanes.",
          description: "A release-facing visual for the launcher control plane and environment matrix.",
          mediaUrl: "/showcase/stack-launcher-control-plane.svg",
          featured: true,
          sortOrder: 10,
        },
        {
          applicationId: launcher.id,
          title: "Bootstrap wave",
          altText: "A layered waveform-style launch visual for Stack Launcher representing portable environments and system rollout.",
          description: "A motion-inspired composition for launch sequencing, host state, and update channels.",
          mediaUrl: "/showcase/stack-launcher-bootstrap-wave.svg",
          featured: false,
          sortOrder: 20,
        },
      ],
    });
  }

  const archiveEntries = [
    {
      slug: "signal-os-build-kit",
      title: "Signal OS Build Kit",
      summary: "Operator-grade Linux workstation baseline for field tooling, telemetry work, and controlled local deployment.",
      category: "OPERATING_SYSTEM" as const,
      visibility: "PUBLIC" as const,
      featured: true,
      stageLabel: "Controlled build",
      artifactFormat: "Image set / bootstrap scripts",
      details:
        "A hardened Linux build lane that packages package manifests, shell bootstrap logic, and operator-focused workstation conventions into a repeatable starting point.",
      tags: ["Linux build", "Operator desktop", "Bootstrap", "Hardening"].join("\n"),
      stackItems: ["Bash", "systemd", "Package manifests", "Bootstrap automation"].join("\n"),
      artifactUrl: "/services",
      artifactLabel: "Request build access",
    },
    {
      slug: "dotfiles-control-layer",
      title: "Dotfiles Control Layer",
      summary: "Curated shell, terminal, rc, and automation config pack with reproducible rollout patterns.",
      category: "CONFIGURATION" as const,
      visibility: "PUBLIC" as const,
      featured: true,
      stageLabel: "Public archive drop",
      artifactFormat: "Config pack / rc files",
      details:
        "A high-signal configuration layer for shell environments, terminal workflows, aliases, prompts, editor defaults, and machine bootstrap glue that can be versioned like a product.",
      tags: ["Dotfiles", "RC files", "Shell UX", "Portable config"].join("\n"),
      stackItems: ["Zsh", "Tmux", "Neovim", "Shell automation"].join("\n"),
      artifactUrl: "/downloads",
      artifactLabel: "See delivery lanes",
    },
    {
      slug: "forge-cluster-stack",
      title: "Forge Cluster Stack",
      summary: "Container and compose-based service stack for local labs, demo systems, and operator sandboxes.",
      category: "CONTAINER_STACK" as const,
      visibility: "PUBLIC" as const,
      featured: false,
      stageLabel: "Portable stack",
      artifactFormat: "OCI / Compose / env packs",
      details:
        "A layered container kit for standing up service bundles, backing stores, reverse proxies, and supporting tooling without re-deriving the same local architecture every time.",
      tags: ["Containers", "Compose", "Lab stack", "Service bundles"].join("\n"),
      stackItems: ["Docker", "Compose", "Env packs", "Health checks"].join("\n"),
      artifactUrl: "/downloads",
      artifactLabel: "Review release lane",
    },
    {
      slug: "prompt-weight-lab",
      title: "Prompt Weight Lab",
      summary: "Workspace for prompt systems, trained checkpoints, eval notes, and private model packaging.",
      category: "MODEL" as const,
      visibility: "PUBLIC" as const,
      featured: true,
      stageLabel: "Research lane",
      artifactFormat: "GGUF / safetensors / eval docs",
      details:
        "A structured place for AI work that needs more than a repo README: prompt packs, tuning notes, model artifacts, benchmark trails, and release discipline around experimental outputs.",
      tags: ["Models", "LLM", "Prompt systems", "Evaluation"].join("\n"),
      stackItems: ["Inference runtimes", "Prompt packs", "Eval notes", "Artifact packaging"].join("\n"),
      artifactUrl: "/services",
      artifactLabel: "Commission AI workflow",
    },
    {
      slug: "red-signal-field-notes",
      title: "Red Signal Field Notes",
      summary: "Security research writeups, operator notes, books, and controlled technical briefings.",
      category: "RESEARCH" as const,
      visibility: "PUBLIC" as const,
      featured: false,
      stageLabel: "Research archive",
      artifactFormat: "Notes / books / briefings",
      details:
        "A publication lane for high-signal documentation, security research, workflow notes, and private-to-public writeups that deserve stronger framing than a scattered gist or throwaway markdown file.",
      tags: ["Research", "Security notes", "Books", "Briefings"].join("\n"),
      stackItems: ["Markdown", "Operational notes", "Publication workflow", "Review passes"].join("\n"),
      artifactUrl: "/bio",
      artifactLabel: "See founder context",
    },
  ];

  for (const entry of archiveEntries) {
    await prisma.archiveEntry.upsert({
      where: { slug: entry.slug },
      create: entry,
      update: entry,
    });
  }

  const creatorSubmissions = [
    {
      id: "creator-submission-001",
      title: "Field Atlas Lite",
      type: "APPLICATION" as const,
      summary: "Lightweight operator dashboard for quickly staging wireless field snapshots and publishing report bundles.",
      details:
        "A creator-side submission for a polished application lane that needs moderation review, packaging feedback, and release framing before it should surface publicly.",
      plannedVisibility: "PUBLIC" as const,
      status: "REVIEWING" as const,
      contactEmail: "atlas@example.com",
      repoUrl: "https://github.com/example/field-atlas-lite",
      artifactUrl: "https://example.com/field-atlas-lite-preview",
      ownerNotes: "Strong framing. Needs checksum discipline and clearer release notes before approval.",
    },
    {
      id: "creator-submission-002",
      title: "Signal Dotfiles Matrix",
      type: "CONFIG_PACK" as const,
      summary: "Portable dotfiles and terminal workflow pack for operator machines, lab hosts, and controlled local rollouts.",
      details:
        "A configuration-focused submission with shell defaults, terminal layouts, editor preferences, and bootstrap scripts packaged for moderation and archive publication.",
      plannedVisibility: "PRIVATE" as const,
      status: "PENDING" as const,
      contactEmail: "ops@example.com",
      repoUrl: "https://github.com/example/signal-dotfiles-matrix",
      artifactUrl: "https://example.com/signal-dotfiles-matrix",
      ownerNotes: null,
    },
  ];

  for (const submission of creatorSubmissions) {
    await prisma.creatorSubmission.upsert({
      where: { id: submission.id },
      create: submission,
      update: submission,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
