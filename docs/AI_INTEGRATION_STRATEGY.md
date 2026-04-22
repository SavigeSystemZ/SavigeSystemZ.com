# AI Integration Strategy — SavigeSystemZ.com

> **Stub.** M6 (Agentic AI split) owns the content of this file. The sections below are the table of contents only — see `_ai_operating_system/PROMPT_PACK.md` M6 prompt for the plan that will populate them.

**Status as of 2026-04-22:** scaffolded. Current AI surface is rule-based only:
- `apps/web/lib/concierge.ts` — keyword routing into catalog / archive / pricing
- `apps/web/app/api/ai/chat/route.ts` — `POST` with 20/min in-memory rate limit
- `apps/web/components/ai-dock.tsx` — bottom-right dock
- `apps/web/packages/ai/src/` — small package, `sanitizePromptInput` helper

Owner copilot does not exist yet.

---

## Table of contents (M6 populates)

1. Model / provider abstraction
   - Current: local rule-based
   - Future: pluggable interface in `packages/ai/` backed by Anthropic SDK or OpenAI-compatible provider
2. Retrieval sources per copilot
   - Public concierge: catalog, archive, pricing, services (PUBLIC rows only)
   - Owner copilot: everything a `requireOwner()`-gated API returns
3. Public ↔ private data boundary matrix
4. Tool / action registry schema
   - `name`, `description`, `inputSchema (Zod)`, `requiresOwnerApproval`, `auditAction`
5. Approval gates for mutation tools
   - `PendingAction` row model, two-step owner confirmation
6. Prompt-injection hardening
   - Input sanitizer, output allow-list, refusal templates, 12 named injection fixtures
7. Conversation / audit model
   - `Conversation`, `Message` rows (optional per phase)
8. Rate limits + abuse controls
   - In-memory today; Redis sliding window before multi-instance deploy
9. Leakage / injection / authz test suite
   - `tests/unit/ai-injection.test.ts` (fixtures)
   - Leakage assertions against DRAFT / PRIVATE / owner-only surfaces
   - Owner copilot authz

## Phase plan (M6)

- **Phase A:** Public concierge retrieval hardening (token-aware, still no LLM)
- **Phase B:** Optional LLM fallback for "no rule matched" (cost + leakage gated)
- **Phase C:** Owner-only `/owner/copilot` with **read-only** tools
- **Phase D:** Owner-confirmed mutation tools gated by `PendingAction`

Each phase requires its own owner approval gate.

---

See `_ai_operating_system/PROMPT_PACK.md` → M6 for the repo-anchored execution plan.
