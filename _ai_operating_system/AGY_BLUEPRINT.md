# SavigeSystemZ.com — AGY World-Class Blueprint and Execution Pack (Enhanced)

## 1. Mission
Evolve SavigeSystemZ.com into a flagship, operator-grade, cinematic software foundry:
- **Public Showcase**: A digital museum and marketplace for apps, games, books, guides, tools, videos, tutorials, files, and project work.
- **Distribution Model**: Free, paid, donation, entitlement, and service/quote-based distribution via Stripe and secure, signed downloads.
- **Elite Admin Command Center**: Centralized operations for content, releases, files, commerce, moderation, settings, skins, themes, analytics, and repository sync.
- **Owner-Only Private Workspace**: A personal "GitHub + File Vault + Project/Idea System" seamlessly integrated into the core platform but hermetically separated from public view.
- **Dual AI Model**:
  - *Public Concierge*: Rule-grounded, read-only assistant for visitors and customers.
  - *Owner Operator Copilot*: Deep-context read/summarize assistant with mutation actions gated by an explicit 2-step confirmation.

## 2. Mode and Boundary
**Mode**: Existing Repo Review / Improvement + Execution Prompt Pack.

**Boundary**:
- Treat `SavigeSystemZ.com` as the active writable target repo.
- Treat the project-local AIAST copy inside `SavigeSystemZ.com/_ai_operating_system` as implementation authority for local agent behavior.
- Treat the parent AIAST repo as the protected scaffold/template source.
- **Do not modify** the parent template during normal app work.
- **Runtime product code** must remain completely separate from AIAST/metasystem files.

## 3. Confirmed Context

**AIAST Parent-Template Reality**
The parent AIAST repo is explicitly a template/factory system, not a normal app repo:
- Creates a master template rooted at `~/.MyAppZ_AI_AGENT_SYSTEM_TEMPLATE`.
- Has a `TEMPLATE/` surface for installable/scaffoldable operating-system files.
- Has a `_TEMPLATE_FACTORY/` surface for provenance/build-only assets.
- Recommends using `TEMPLATE/bootstrap/init-project.sh` to install the operating system into target repos.
- Explicitly mandates keeping application runtime code outside `_system/`.

**SavigeSystemZ.com Current Reality**
The platform runs a premium stack:
- Next.js 16 App Router monorepo (with Turbopack).
- pnpm + Turborepo for workspace orchestration.
- TypeScript / React 19 / Tailwind 4.
- Prisma ORM against a PostgreSQL target.
- Public routes: Home, applications, archive, downloads, pricing, reviews, services, bio, repos.
- Self-Hosted Code Repository: `git-http-backend` integration supporting local `.git` bare repos.
- Admin surfaces: Dashboard, launch readiness, analytics, spike notices.
- Stripe (live/mock) checkout + Commerce API.
- Secure Vault: ClamAV S3 lambda-scanning + AES-256-GCM encryption.
- Distributed Rate-Limiting: Sliding-window Redis limiting for strict ops.

## 4. North-Star Product Behavior

### 4.1 Public Side (Digital Museum & Foundry)
The public site should feel like a premium digital museum and high-end software foundry.
- **Aesthetic**: Deep Glass visual system (vibrant colors on dark modes, glassmorphism, dynamic animations, smooth gradients).
- **Function**: Marketplace for software and digital artifacts, premium operator resume, and research/tutorial/library portal.

### 4.2 Admin Command Center
The admin side operates as a true command-and-control center.
- **Features**: Applications, archive entries, media galleries, releases, file/upload/download entitlements, customer purchases/licenses, creator submissions, services, theme/skin management, repository status, and AI-assisted operational queues (spike notices/health checks).

### 4.3 Owner-Private Workspace
A hermetically sealed zone for the owner.
- **Features**: Ideas, internal projects, private notes, linked repos, private files/images, launch planning, AI summaries/checklists, searchable tags/status, and relational linking to public apps/archives.

## 5. Product Blueprint

### Users & Jobs-to-be-Done
- **Visitor**: Browses and discovers what Sys Savige built.
- **Buyer**: Purchases, claims, and downloads products/assets securely.
- **Creator/Submitter**: Submits requests for custom work or platform contributions.
- **Owner/Admin**: Manages the platform, reviews queues, publishes drops.
- **Owner-Private Operator**: Uses internal workspace to manage private ideas and workflows.

### Goals
- Elite visual quality ("Deep Glass").
- Complete public and admin surfaces.
- Highly secure uploads, downloads, and private data separation.
- Fast, accessible (WCAG AA), responsive UX with reduced-motion fallbacks.
- Agent-ready repo with AIAST-compatible prompt packs.

### Non-Goals
- Modifying the parent AIAST template.
- Intertwining runtime app code with `_system/`.
- Permitting public leakage of owner/private/draft data.

## 6. Architecture Extension

### 6.1 Major Domains
`catalog`, `archive`, `commerce`, `downloads/entitlements`, `media/files`, `submissions/services`, `reviews/trust`, `code/repositories`, `owner workspace`, `settings/theming`, `ai`, `auth/audit/security`.

### 6.2 Route Groups
- `(public)`: Consumer-facing discovery and repository browsers.
- `(user)`: Customer purchase, download, and profile dashboard.
- `(admin)`: Owner dashboard, moderation queues, analytics.
- `(owner-private)`: Hermetically sealed private workspace.
- `/api`: Strict boundaries separating public, authenticated user, admin, and private data access.

### 6.3 AI Split
- **Public Concierge**: Grounded purely on public data. Routes visitors correctly.
- **Owner Operator**: Read-only defaults. Summarizes admin state, proposes fixes, flags spike notices. Mutations (publish, delete, etc.) require explicit human 2-step confirmation.

## 7. Data Model Extension (Target Map)

- **Commerce**: `Offer`, `OfferPrice`, `Cart`, `CartItem`, `Order`, `OrderItem`, `DonationIntent`, `Entitlement`.
- **Media/Files**: `FileAsset`, `UploadSession`, `ScanResult`, `ArtifactLink`.
- **Owner-Private Workspace**: `OwnerProject`, `OwnerProjectArtifact`, `OwnerProjectNote`, `Idea`, `WorkspaceTag`, `WorkspaceComment`.
- **Settings/Theming**: `ThemePreset`, `SiteSkin`, `OwnerPreference`, `FeatureFlag`, `UISetting`.
- **AI**: `AiConversation`, `AiMessage`, `AiActionRequest`, `AiActionAudit`.

## 8. UX / IA System & Quality Requirements

**Public**: Home, Apps, Archive, Code Repos, Reviews, Services, Checkout.
**User**: Dashboard, Download History, Profile.
**Admin**: Command Center (with Spike Alerts), Code Manager, Audit Health, Moderation.
**Owner-Private**: Ideas Board, Internal Projects, Notes, Private Repo Link.

**UX Quality Standards**:
- Every screen *must* define: `loading`, `empty`, `error`, `success` states.
- Fully responsive and keyboard-navigable (Tab/Shift-Tab).
- Absolute enforcement of permission boundaries (no IDOR).

## 9. Risk-Ordered Milestones

- **M0 — Ingest / Authority**: Baseline verification, instruction mapping, Postgres DB config. *(DONE)*
- **M1 — Canonical Docs & Blueprint**: Architecture, PRD, Data Model, Risk Registers. *(DONE)*
- **M2 — Deep Glass Visual Shell**: Tokenized themes, strong component primitives, premium motion, reduced-motion fallbacks. *(DONE)*
- **M3 — Admin Command Center**: Consolidated dashboard, spike notices, readiness checks, "fix next" queue. *(DONE)*
- **M4 — Commerce / Cart System**: Free, paid, donation flows, webhook idempotency, strict Stripe integration. *(WIP / Pending Secrets)*
- **M5 — File / Media / S3 Platform**: Unified lifecycle, ClamAV Lambda scanning hooks, signed URL boundaries, size validation. *(WIP / Pending AWS Keys)*
- **M6 — Code / Repo Experience**: Public GitHub-style browser, `git-http-backend` integration, repo sync-all, visibility toggles. *(DONE)*
- **M7 — Library & Resources Expansion**: Treat guides, tools, and videos as first-class content with rich detail pages.
- **M8 — Owner-Private Workspace**: Strict internal vault, notes, ideas, attachment lifecycle. No public leakage.
- **M9 — AI Split & Agentic Ops**: Structured public concierge vs. owner copilot. Injection hardening, rate limits, audit trails.
- **M10 — Security & Release Hardening**: Settings completeness, strict Redis ops, telemetry, rollback drills, security review. *(DONE - Partial)*

## 10. AGY Prompt Pack (Execution Commands)

*These prompts are designed specifically for the AGY system when executed inside the `SavigeSystemZ.com` working directory.*

### Prompt 0 — Ingest / baseline
```text
ROLE
You are a senior repo-aware CLI coding agent working inside SavigeSystemZ.com.

TASK
Plan M0 only: repo ingestion, authority discovery, runtime truth discovery, validation baseline, and conflict scan. Do not edit implementation files yet.

REQUIRED INSPECTION
1. Confirm repo root with `pwd` and `git rev-parse --show-toplevel`.
2. Detect local AIAST surfaces (`_ai_operating_system/`, `CLAUDE.md`, `.cursorrules`).
3. Detect runtime truth (package.json, Prisma schema, tests, CI workflows).
4. Identify actual validation commands (e.g., `pnpm check:all`).
5. Identify conflicts between host plan, repo-local AIAST, and runtime truth.

OUTPUT
Confirmed root, instructions found, runtime facts, validation commands, risk/conflict table.
```

### Prompt 1 — Canonical docs and blueprint
```text
ROLE
You are a principal product architect and repo-aware documentation engineer.

TASK
Implement M1 only: create or upgrade the canonical blueprint/docs so they match the actual repo and world-class target state. 

REQUIREMENTS
- Reflect current reality first, then proposed roadmap.
- Preserve AIAST boundary rules.
- Run lightweight validation to ensure no code drift occurred.
```

### Prompt 2 — Public visual system upgrade
```text
ROLE
You are a senior frontend architect and accessibility specialist.

TASK
Plan and implement M2: Elite visual system ("Deep Glass") and flagship public-shell upgrade.

CONSTRAINTS
- Prefer progressive enhancement over heavy client payloads.
- If proposing 3D/immersive visuals, lazy-load them.
- Follow WCAG AA and include prefers-reduced-motion fallbacks.
- Validation: lint, typecheck, Axe E2E on public routes.
```

### Prompt 3 — Admin command center
```text
ROLE
You are a senior full-stack engineer implementing the owner/admin command center.

TASK
Plan and implement M3: Admin completion (Dashboard, managers, readiness, quick actions, settings).

REQUIREMENTS
- loading/empty/error/success states on every screen.
- Strict authz on every boundary.
- Audit all sensitive mutations.
```

### Prompt 4 — Commerce, cart, and offers
```text
ROLE
You are a senior commerce architect and secure full-stack engineer.

TASK
Plan and implement M4: Commerce/cart/offers expansion.

CONSTRAINTS
- Do not trust client-provided prices. Server authoritative only.
- Preserve mock checkout path for local dev.
- Validate payloads and protect webhook idempotency.
- Validate via unit/integration tests and Stripe smoke tests.
```

### Prompt 5 — Files, media, uploads
```text
ROLE
You are a storage/security/platform engineer.

TASK
Plan and implement M5: Unified file/media/upload platform (S3 + ClamAV).

REQUIREMENTS
- Strict lifecycle states (PENDING -> SCANNED -> QUARANTINED/PUBLISHED).
- Size/type validation.
- Signed URL boundaries for downloads and uploads.
- Audit logs without sensitive leakage.
```

### Prompt 6 — Code and repo experience
```text
ROLE
You are a Git-platform and repo-surface engineer.

TASK
Plan and implement M6: Public repo/code experience and self-hosted `git-http-backend` integration.

GOALS
- Public repo detail pages, README rendering, tree/blob browsing.
- Visibility toggles (PUBLIC/PRIVATE/DRAFT).
- Webhook intake with HMAC verification.
- Enforce strict entitlements for PRIVATE blobs.
```

### Prompt 7 — Library/resources/tutorials
```text
ROLE
You are a product/content-platform engineer.

TASK
Plan and implement M7: Library/resources/tutorials/guides expansion. Treat non-app work as first-class public content.
```

### Prompt 8 — Owner-private workspace
```text
ROLE
You are a product architect and secure full-stack engineer.

TASK
Plan and implement M8: Owner-private workspace.

BOUNDARY
- Owner-only by default. No public leakage.
- Audit all sensitive mutations.
- Keep runtime code separate from AIAST meta files.
```

### Prompt 9 — AI split
```text
ROLE
You are an AI product architect and security engineer.

TASK
Plan and implement M9: Split AI into public concierge and owner operator.

REQUIREMENTS
- Concierge: Public data only.
- Operator: Read-only first. Mutations require explicit 2-step confirmation.
- Prompt injection hardening. No secrets stored in prompts.
```

### Prompt 10 — Hardening and release
```text
ROLE
You are a release engineer, security hardening engineer, and QA lead.

TASK
Implement M10: Hardening, settings completion, release readiness, and rollback quality.

COVER
- Strict Redis ops and rate limits.
- Privacy/security review, upload boundary review.
- Run `pnpm check:all` as final gate.
```

## 11. Optional Local AIAST Tailoring Recommendations
For `SavigeSystemZ.com` local AIAST copy only:
- Maintain milestone registry aligned to M0–M10.
- Keep Theme Skin decision ADR, AI boundary ADR, and file/media lifecycle ADR.
- Maintain public/admin/private surface map and QA checklist.

## 12. Security / Privacy Checkpoints
- **Authz** on every admin/private mutation.
- **No IDOR**.
- **Public/Private/Draft Separation** enforced at the Prisma level.
- **Upload Sanitization** via S3 Lambda hooks.
- **Signed File Boundaries** for all secure downloads.
- **Safe Stripe Handling** with HMAC webhook validation and idempotency keys.
- **AI Logs** sanitized of all secrets.

## 13. Handoff Requirements
For each milestone, the agent should update repo-local handoff files:
- `WHERE_LEFT_OFF.md`
- `SESSION_RECALL.md`
- `TODO.md`
Update these with the files touched, validation results, next milestone, risks, and rollback notes before concluding execution.
