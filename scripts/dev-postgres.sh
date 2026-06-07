#!/usr/bin/env bash
# Start local Postgres + run the web dev server against it.
# Usage: ./scripts/dev-postgres.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Starting Postgres via Docker Compose..."
docker compose -f docker-compose.postgres.yml up -d

echo "Waiting for Postgres to be healthy..."
until docker compose -f docker-compose.postgres.yml exec -T postgres pg_isready -U ssz -d savige >/dev/null 2>&1; do
  sleep 1
done

export DATABASE_URL="postgresql://ssz:dev@localhost:5433/savige"

echo "Running Prisma generate + migrate + seed..."
cd apps/web
pnpm exec prisma generate
pnpm exec prisma migrate deploy
cd ../..
echo "Bootstrapping foundry catalog from GitHub..."
DATABASE_URL="$DATABASE_URL" pnpm code:bootstrap || echo "Bootstrap skipped or partially failed — run 'pnpm code:bootstrap' manually."

echo ""
echo "Postgres is ready. Starting dev server..."
echo "DATABASE_URL=$DATABASE_URL"
echo ""
DATABASE_URL="$DATABASE_URL" pnpm dev:web
