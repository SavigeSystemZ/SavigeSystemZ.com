#!/usr/bin/env bash
set -euo pipefail

echo "== SavigeSystemZ full enhancement cycle =="
pnpm install
./scripts/verify-release.sh
bash installer/scripts/validate-install.sh || true
echo "Cycle complete. For E2E: E2E_PORT=43907 pnpm --filter web test:e2e (see docs/CATALOG_OPERATIONS.md)."
