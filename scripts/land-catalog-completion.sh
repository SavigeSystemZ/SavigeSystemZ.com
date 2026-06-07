#!/usr/bin/env bash
# Land the World-Class catalog completion batch as themed commits.
#
# Run only when the working tree matches the completion plan (catalog 52/52,
# staging probes, UI unification, E2E green). Validates first, then commits
# in dependency order.
#
# Usage:
#   ./scripts/land-catalog-completion.sh          # interactive confirm
#   ./scripts/land-catalog-completion.sh --yes    # skip confirm
#   ./scripts/land-catalog-completion.sh --dry-run
#
# Does NOT push — review with `git log --oneline -n 10` then push yourself.
set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

DRY_RUN=0
ASSUME_YES=0
for arg in "$@"; do
  case "${arg}" in
    --dry-run) DRY_RUN=1 ;;
    --yes) ASSUME_YES=1 ;;
    *) echo "Unknown arg: ${arg}" >&2; exit 2 ;;
  esac
done

step() { printf '\n[land] %s\n' "$*"; }

if [[ -n "$(git status --porcelain --untracked-files=no)" ]] && [[ "${ASSUME_YES}" -eq 0 ]] && [[ "${DRY_RUN}" -eq 0 ]]; then
  step "Uncommitted changes detected."
  git status --short | head -20
  echo "…"
  read -r -p "Proceed with themed commits? [y/N] " ans
  [[ "${ans}" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

commit() {
  local msg="$1"
  shift
  if [[ "$#" -eq 0 ]]; then
    echo "  (skip — no paths)"
    return 0
  fi
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    echo "  [dry-run] git add $*"
    echo "  [dry-run] git commit -m \"${msg}\""
    return 0
  fi
  git add -- "$@"
  if git diff --cached --quiet; then
    echo "  (skip — nothing staged for: ${msg})"
    return 0
  fi
  git commit -m "${msg}"
}

step "0. Pre-flight — quality + catalog integrity"
if [[ "${DRY_RUN}" -eq 1 ]]; then
  echo "  (skipped in --dry-run)"
else
  export DATABASE_URL="${DATABASE_URL:-postgresql://ssz:dev@localhost:5433/savige}"
  pnpm check:all
  GITHUB_MOCK_MODE=1 pnpm code:verify-catalog
fi

step "1/8 — catalog core (verify, mock GitHub, bootstrap scripts)"
commit "feat(catalog): add 52-repo verify pipeline and foundry bootstrap scripts" \
  scripts/bootstrap-foundry.mjs \
  package.json \
  apps/web/package.json \
  apps/web/lib/verify-catalog-completeness.ts \
  apps/web/lib/github-mock-catalog.ts \
  apps/web/lib/web-root.ts \
  apps/web/lib/catalog-from-repos.ts \
  apps/web/lib/catalog-enrichment.ts \
  apps/web/lib/catalog-media-copy.ts \
  apps/web/lib/catalog-media-display.ts \
  apps/web/lib/catalog-rich-copy.ts \
  apps/web/lib/catalog-showcase-media.ts \
  apps/web/lib/catalog-showcase-svg.ts \
  apps/web/lib/flagship-applications.ts \
  apps/web/lib/flagship-releases.ts \
  apps/web/lib/mock-screenshot-png.ts \
  apps/web/lib/catalog-launch-registry.ts \
  apps/web/scripts/capture-catalog-ui-screenshots.ts \
  apps/web/scripts/discover-catalog-launches.ts \
  apps/web/lib/catalog-resolver.ts \
  apps/web/lib/github-client.ts \
  apps/web/lib/code-repository.ts \
  apps/web/lib/showcase-content.ts \
  apps/web/scripts/sync-github-org-repos.ts \
  apps/web/scripts/seed-flagship-applications.ts \
  apps/web/scripts/seed-flagship-releases.ts \
  apps/web/scripts/generate-catalog-showcases.ts \
  apps/web/scripts/fetch-catalog-screenshots.ts \
  apps/web/scripts/verify-catalog-completeness.ts \
  apps/web/tests/unit/verify-catalog-completeness.test.ts \
  apps/web/tests/unit/catalog-from-repos.test.ts \
  apps/web/tests/unit/catalog-enrichment.test.ts \
  apps/web/tests/unit/catalog-media-copy.test.ts \
  apps/web/tests/unit/catalog-media-display.test.ts \
  apps/web/tests/unit/catalog-rich-copy.test.ts \
  apps/web/tests/unit/catalog-showcase-media.test.ts \
  apps/web/tests/unit/catalog-showcase-svg.test.ts \
  apps/web/tests/unit/flagship-applications.test.ts \
  apps/web/tests/unit/flagship-releases.test.ts \
  apps/web/tests/unit/catalog-launch-registry.test.ts \
  apps/web/tests/unit/github-client.test.ts \
  apps/web/tests/unit/code-repository.test.ts

step "2/8 — public catalog UI + showcase assets"
commit "feat(catalog): unify preview media, search, runway, and showcase tiers" \
  apps/web/components/application-preview-image.tsx \
  apps/web/components/catalog-search-filter.tsx \
  apps/web/components/featured-catalog-runway.tsx \
  apps/web/components/app-showcase-card.tsx \
  apps/web/components/application-media-gallery.tsx \
  apps/web/components/archive-entry-card.tsx \
  apps/web/components/hero.tsx \
  apps/web/components/site-footer.tsx \
  apps/web/app/\(public\)/page.tsx \
  apps/web/app/\(public\)/applications/page.tsx \
  apps/web/app/\(public\)/applications/\[slug\]/page.tsx \
  apps/web/app/\(public\)/downloads/page.tsx \
  apps/web/app/\(public\)/archive/\[slug\]/page.tsx \
  apps/web/app/\(public\)/repos/page.tsx \
  apps/web/app/sitemap.ts \
  apps/web/next.config.ts \
  apps/web/public/showcase \
  docs/CATALOG_UI_SCREENSHOT_REPORT.md \
  apps/web/tests/unit/application-preview-image.test.ts \
  apps/web/tests/e2e/flagship-catalog.spec.ts \
  apps/web/tests/e2e/catalog-coverage.spec.ts

step "3/8 — commerce + donate lane"
commit "feat(commerce): donate checkout lane and unified application commerce panel" \
  apps/web/app/api/donate \
  apps/web/lib/donate-config.ts \
  apps/web/lib/validation.ts \
  apps/web/components/donate-cta.tsx \
  apps/web/components/application-commerce-panel.tsx \
  apps/web/components/checkout-cta.tsx \
  apps/web/app/\(public\)/pricing/page.tsx \
  apps/web/tests/unit/donate-config.test.ts \
  apps/web/tests/e2e/commerce.spec.ts

step "4/8 — admin staging + catalog screenshot promotion"
commit "feat(admin): staging readiness probes and catalog screenshot promotion" \
  apps/web/lib/staging-readiness.ts \
  apps/web/lib/staging-probes.ts \
  apps/web/lib/launch-readiness.ts \
  apps/web/scripts/verify-staging-readiness.ts \
  apps/web/app/api/admin/application-media/\[id\]/set-catalog-screenshot \
  apps/web/app/api/health/route.ts \
  apps/web/app/\(admin\)/admin/launch/page.tsx \
  apps/web/components/admin/application-media-manager.tsx \
  apps/web/tests/unit/staging-readiness.test.ts \
  apps/web/tests/unit/staging-probes.test.ts \
  apps/web/tests/e2e/staging-presign.spec.ts \
  apps/web/tests/e2e/admin-media-catalog.spec.ts

step "5/8 — CI + Lighthouse + webhook smoke"
commit "ci: bootstrap catalog verify in quality/e2e and extend Lighthouse URLs" \
  .github/workflows/ci.yml \
  .github/workflows/stripe-webhook-smoke.yml \
  apps/web/lighthouserc.json

step "6/8 — E2E stability + rate limits"
commit "test(e2e): catalog coverage, owner helpers, and dev rate-limit headroom" \
  apps/web/playwright.config.ts \
  apps/web/tests/e2e/helpers \
  apps/web/tests/e2e/critical.spec.ts \
  apps/web/tests/e2e/a11y.spec.ts \
  apps/web/tests/e2e/admin-code.spec.ts \
  apps/web/tests/e2e/admin-command-palette.spec.ts \
  apps/web/tests/e2e/admin-dashboard.spec.ts \
  apps/web/tests/e2e/admin-publish.spec.ts \
  apps/web/tests/e2e/archive-launch.spec.ts \
  apps/web/tests/e2e/audit.spec.ts \
  apps/web/tests/e2e/full-pipeline.spec.ts \
  apps/web/tests/e2e/repos.spec.ts \
  apps/web/app/api/submissions/route.ts \
  apps/web/app/api/project-requests/route.ts \
  apps/web/app/api/auth/login/route.ts

step "7/8 — env templates + operator docs"
commit "docs: catalog ops runbook, staging env templates, and agent handoff" \
  apps/web/.env.example \
  apps/web/AGENTS.md \
  infra/.env.example \
  docs/CATALOG_OPERATIONS.md \
  README.md \
  docs/LAUNCH_CHECKLIST.md \
  _ai_operating_system/WHERE_LEFT_OFF.md \
  _ai_operating_system/SESSION_RECALL.md \
  _ai_operating_system/VALIDATION_LOG.md \
  _ai_operating_system/TODO.md

step "8/8 — remaining chore"
commit "chore: verify-release script, dev-postgres hook, packaging control" \
  scripts/land-catalog-completion.sh \
  scripts/verify-release.sh \
  scripts/post-chown-verify.sh \
  scripts/full-cycle.sh \
  scripts/dev-postgres.sh \
  installer/packaging/deb/control

step "Done."
if [[ "${DRY_RUN}" -eq 0 ]]; then
  git status --short
  echo
  git log --oneline -n 10
  echo
  echo "Review commits, then: git push origin main  (or open a PR)"
fi
