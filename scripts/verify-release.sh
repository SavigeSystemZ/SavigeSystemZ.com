#!/usr/bin/env bash
# Pre-merge / pre-tag release verification: quality gates + catalog integrity.
#
# Usage:
#   ./scripts/verify-release.sh
#   ./scripts/verify-release.sh --with-staging   # also run staging:verify (needs secrets)
#   ./scripts/verify-release.sh --with-staging-probes  # HTTP + presign against SITE_URL
#
set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

WITH_STAGING=0
WITH_PROBES=0
for arg in "$@"; do
  case "${arg}" in
    --with-staging) WITH_STAGING=1 ;;
    --with-staging-probes) WITH_STAGING=1; WITH_PROBES=1 ;;
    *) echo "Unknown arg: ${arg}" >&2; exit 2 ;;
  esac
done

export DATABASE_URL="${DATABASE_URL:-postgresql://ssz:dev@localhost:5433/savige}"

printf '\n[verify-release] 1/3 — pnpm check:all\n'
pnpm check:all

printf '\n[verify-release] 2/3 — catalog completeness (GITHUB_MOCK_MODE=1)\n'
GITHUB_MOCK_MODE=1 pnpm --filter web code:verify-catalog -- --require-ui-catalog

if [[ "${WITH_STAGING}" -eq 1 ]]; then
  printf '\n[verify-release] 3/3 — staging readiness\n'
  extra=()
  if [[ "${WITH_PROBES}" -eq 1 ]]; then
    export SITE_URL="${SITE_URL:-http://127.0.0.1:43907}"
    extra+=(-- --probe-http --probe-presign)
    echo "  SITE_URL=${SITE_URL}"
  fi
  pnpm staging:verify "${extra[@]}"
else
  printf '\n[verify-release] 3/3 — skipped (pass --with-staging when Stripe/S3 env is configured)\n'
fi

echo
echo "[verify-release] All requested checks passed."
