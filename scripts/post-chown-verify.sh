#!/usr/bin/env bash
# Verify the repo is healthy after restoring ownership.
# Run after: sudo chown -R whyte:whyte /home/whyte/.MyAppZ/SavigeSystemZ.com
#
# Exits non-zero on the first failure; logs each step so you can see where it
# stops if something is still off.
set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

step() { printf '\n[post-chown] %s\n' "$*"; }

step "1. Ownership sweep — files still owned by root"
root_owned="$(find . -path ./node_modules -prune -o -user root -print 2>/dev/null | head -5)"
if [[ -n "${root_owned}" ]]; then
  echo "  STILL ROOT-OWNED:"
  echo "${root_owned}" | sed 's/^/    /'
  echo "  Re-run: sudo chown -R whyte:whyte ${REPO_ROOT}"
  exit 1
fi
echo "  ok — no root-owned files outside node_modules"

step "2. Git fsck"
git fsck --full 2>&1 | head -40 || true
git rev-parse HEAD >/dev/null
echo "  ok — HEAD resolves to $(git rev-parse --short HEAD)"

step "3. Postgres reachability"
if ! docker compose -f docker-compose.postgres.yml ps 2>/dev/null | grep -q 'savige.*Up'; then
  echo "  Postgres container not up. Starting…"
  ./scripts/dev-postgres.sh || true
fi

step "4. Apply pending migrations"
pnpm --filter web exec prisma migrate deploy

step "5. Quality gate"
pnpm check:all

step "6. Boot dev server (background) and probe"
SITE_PORT=43907 pnpm dev:web >/tmp/savigesystemz-postchown.log 2>&1 &
dev_pid=$!
trap 'kill "${dev_pid}" 2>/dev/null || true; wait "${dev_pid}" 2>/dev/null || true' EXIT INT TERM

waited=0
until (echo > /dev/tcp/127.0.0.1/43907) >/dev/null 2>&1; do
  if (( waited >= 60 )); then
    echo "  TIMEOUT — dev server did not bind 43907 in 60s"
    tail -50 /tmp/savigesystemz-postchown.log >&2 || true
    exit 3
  fi
  sleep 1
  waited=$((waited + 1))
done

if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:43907/api/health; then
  echo
  echo "  ok — /api/health responded"
else
  echo "  /api/health did not respond cleanly"
  exit 4
fi

echo
echo "[post-chown] All checks passed. Site is live on http://127.0.0.1:43907/"
echo "[post-chown] Background dev server PID ${dev_pid} — kill with: kill ${dev_pid}"
trap - EXIT INT TERM
disown "${dev_pid}" 2>/dev/null || true
