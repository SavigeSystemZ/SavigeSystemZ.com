# Code Storage — SavigeSystemZ.com

**Status as of 2026-04-22:** GitHub-mirrored metadata only. No self-hosted git storage yet. The M11 decision (how / whether to actually store code blobs on the platform) is **pending**.

## Current state

- `CodeRepository` model (migration `0002_code_repository`, 2026-04-22) — owner-scoped, DB-backed cache of GitHub repo metadata (name, description, default branch, language, stars, forks, latest commit, visibility, sync status).
- `Application.codeRepositoryId` optional FK (migration `0003_application_code_repository_link`) — lets multiple applications link to a single public repo; surfaces a "Source code" card on `/applications/[slug]` when `CodeRepository.visibility === 'PUBLIC'`.
- Sync via `apps/web/lib/github-client.ts` (GitHub REST API, optional `GITHUB_TOKEN`) + `apps/web/lib/code-repository.ts`.
- Admin UI: `/admin/code` for connect / sync / link / untrack.

**The platform stores metadata, not blobs.** Clone / push / pull still happens on github.com.

## M11 decision matrix (pending)

Three candidate approaches for storing code directly on SavigeSystemZ.com:

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Gitea sidecar** | Full git-smart-HTTP protocol, web UI for free, proven | New service to operate, Docker / VM / persistent disk, auth bridging to our session system | Medium |
| **S3-mirrored bare repos** | Uses existing S3 infra, no new daemon, blob-level access control | Have to implement (or wrap) git-smart-HTTP ourselves, trickier fetch semantics | Medium-High |
| **No self-host yet** | Zero infra cost, mirrors-only stays simple | "Store code" promise stays aspirational | Zero |

### Open questions

1. **Scope:** is self-hosted storage actually needed, or is GitHub mirroring + the PUBLIC-only source-code card sufficient for the foundry-platform vision?
2. **Access control:** `CodeRepository.visibility` today maps cleanly to page-level gates. Blob-level gating for PRIVATE repos needs an entitlement model (reuse `AssetVisibility` + `License`, or new `CodeEntitlement`?).
3. **Push/pull protocol:** smart HTTP vs. read-only mirror. Read-only mirror is materially simpler and covers 90% of "display my code" use cases.
4. **Size budget:** per-repo cap, total bucket cap, GC for dead branches.
5. **Webhook intake:** `POST /api/webhooks/github` with HMAC signature (in the M5.4 plan) auto-syncs metadata today; same endpoint extended in M11 to trigger blob sync.

### Decision criteria

Pick an option when:
- Owner confirms that metadata-only (current) is insufficient
- At least one repo has a concrete need to be hosted here (not on GitHub)
- Storage cost / ops cost estimate against the marketplace revenue line suggests it's worth operating

Until then: **current state (metadata only) is the decision**.

## References

- `apps/web/prisma/schema.prisma` — `CodeRepository`, enums
- `apps/web/lib/code-repository.ts`, `apps/web/lib/github-client.ts`
- `apps/web/app/api/admin/code/route.ts`, `apps/web/app/api/admin/code/[id]/route.ts`
- `_ai_operating_system/PROMPT_PACK.md` M11 section
- `_ai_operating_system/VISION_AND_ROADMAP.md` M11
