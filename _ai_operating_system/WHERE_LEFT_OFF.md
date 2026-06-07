# Where Left Off

- **Timestamp:** 2026-06-07 (Showcase pipeline hardened — discover, verify ui-catalog, apps-only capture)
- **Status:** `pnpm verify:release` green with **52/52 ui-catalog PNGs** gate; 4 live app UIs captured; operator tooling complete.
- **Shipped:**
  - **`pnpm code:discover-launches`** — LIVE/DOWN/DESKTOP/NO_URL report across MyAppZ sibling repos.
  - **`--require-ui-catalog`** on verify-catalog + verify-release + post-chown-verify.
  - **`--apps-only`** capture mode (~10s re-probe of running dev servers).
  - **`CAPTURE_UI=1 pnpm code:bootstrap`** — optional Playwright + media sync after seed.
- **Live app UI (manual tier):** LedgerLoop, CandleCompass, IdeaForge, SavigeSystemZ.com.
- **Operator report:** `docs/CATALOG_UI_SCREENSHOT_REPORT.md` — Immortality (:3777) + Vetraxis (:38222) still DOWN.
- **Next actionable:** Start flagships → `pnpm code:capture-ui-screenshots -- --apps-only --allow-partial && pnpm code:seed-releases`; then `./scripts/land-catalog-completion.sh`.
