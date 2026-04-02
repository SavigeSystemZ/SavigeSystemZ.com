#!/usr/bin/env bash
set -euo pipefail

echo "== SavigeSystemZ full enhancement cycle =="
pnpm install
pnpm check:all
bash installer/scripts/validate-install.sh || true
echo "Cycle complete."
