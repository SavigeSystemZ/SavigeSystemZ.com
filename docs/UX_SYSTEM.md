# UX System — SavigeSystemZ.com

Stub. This doc is the canonical spec for the visual / interaction / motion system. M1 (Design-system upgrade) is expected to flesh it out — see `_ai_operating_system/PROMPT_PACK.md` M1 prompt.

**Status as of 2026-04-22:** M1 slice 1 landed. `prefers-reduced-motion` fallback now exists in `apps/web/app/globals.css`, and first promoted primitives (`Panel`, `StatusChip`, `SectionHeading`) are available in `packages/ui/src/`.

---

## Visual principles

- **Glass** — translucent panels over deep backgrounds (`.surface-panel` in `apps/web/app/globals.css`)
- **Scanline** — subtle CRT-texture overlays (`scanline` utility)
- **Depth** — layered glow and shadow to signal hierarchy without heavy borders
- **Signal** — chroma-rich accents (cyan, amber, signal-green, alert-rose) used sparingly to highlight state

## Color tokens

Defined in `apps/web/app/globals.css` as CSS custom properties. M1 promotes these to a documented scale (semantic names: `--surface-*`, `--ink-*`, `--accent-*`, `--status-*`). Contrast audit against WCAG 2.2 AA is an M1 deliverable (warm amber on dark panel is the suspected weak point).

## Typography

- **Display:** Space Grotesk (`display-title` utility)
- **Body:** Inter
- **Mono:** system monospace stack
- **Scale:** tailwind default with custom utilities for hero / section heads

## Motion utilities

Current utilities defined in `apps/web/app/globals.css`:

| Utility | Effect | Reduced-motion fallback |
|---------|--------|-------------------------|
| `drift-slow` / `drift-fast` | Subtle translate-Y loop for ambient panels | Disabled under reduced motion |
| `reveal` / `reveal-stagger` | Fade + translate-up on mount | Disabled under reduced motion |
| `scanline` | CRT texture overlay loop | Disabled under reduced motion |
| `pulse-glow` | Edge glow pulse | Replaced with static low-glow state |
| `border-shimmer` | Animated gradient edge | Disabled under reduced motion |

**Reduced-motion status:** `@media (prefers-reduced-motion: reduce)` is implemented in `apps/web/app/globals.css`; a11y E2E now includes reduced-motion checks for home + applications routes.

## Component primitives

Current state:

- `packages/ui/` now hosts `SectionCard`, `Panel`, `StatusChip`, and promoted `SectionHeading`
- Admin + public surfaces duplicate panel / card / chip patterns across ~10 components
- `apps/web/components/section-heading.tsx` now re-exports from `@savige/ui` to ease migration

M1 slice 2 promotes the duplicated patterns into `packages/ui/`:
- `Panel` (`.surface-panel`)
- `StatusChip` (`.signal-chip` with `success` / `warn` / `danger` / `info` variants)
- `SectionHeading` (promoted from `apps/web/components`)
- `FieldGroup`, `EmptyState` (new)

## Responsive

Tailwind breakpoint defaults, `max-w-6xl` typical container. Admin surfaces use `max-w-5xl`. M1 will document container strategy.

## Accessibility

- WCAG 2.2 AA target
- Keyboard focus rings on all interactives (uses `ring-offset` — M1 verifies end-to-end)
- `aria-live` regions planned for toast + AI dock (M1)
- axe E2E currently covers 13 public routes (`tests/e2e/a11y.spec.ts`); M1 expands coverage

## References

- Current CSS: `apps/web/app/globals.css`
- Current primitives: `packages/ui/src/`
- Section heading: `apps/web/components/section-heading.tsx`
- AI dock: `apps/web/components/ai-dock.tsx`
- a11y test: `apps/web/tests/e2e/a11y.spec.ts`
