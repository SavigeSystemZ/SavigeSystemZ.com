#!/usr/bin/env bash
# Quick local dev using SQLite (no Docker needed).
# Temporarily flips the Prisma provider to sqlite, migrates, seeds, and starts dev server.
# The schema change is NOT committed — it's for local dev only.
#
# Usage: ./scripts/dev-sqlite.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SCHEMA="apps/web/prisma/schema.prisma"
export DATABASE_URL="file:./dev.db"

echo "Switching Prisma provider to sqlite for local dev..."
sed -i 's/provider = "postgresql"/provider = "sqlite"/' "$SCHEMA"

cleanup() {
  echo "Restoring Prisma provider to postgresql..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA"
}
trap cleanup EXIT

echo "Running Prisma generate + migrate dev + seed..."
cd apps/web
pnpm exec prisma generate
pnpm exec prisma migrate dev --name local_sqlite --create-only --skip-seed 2>/dev/null || true
pnpm exec prisma migrate deploy 2>/dev/null || pnpm exec prisma db push --skip-generate 2>/dev/null || true
pnpm exec prisma db seed 2>/dev/null || true
cd ../..

echo ""
echo "SQLite is ready. Starting dev server..."
echo "DATABASE_URL=$DATABASE_URL"
echo ""
DATABASE_URL="$DATABASE_URL" pnpm dev:web
