#!/bin/bash
# Hide Friction app and make GitHub repo private
# Usage: ./scripts/hide-friction.sh

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set. Cannot update database."
  echo ""
  echo "Set it in your .env.local:"
  echo '  export DATABASE_URL="postgresql://ssz:dev@127.0.0.1:5433/savige?schema=public"'
  exit 1
fi

echo "🔧 Hiding Friction app from public catalog..."
echo ""

# Hide from public visibility
npx prisma db execute --stdin << SQL
-- Hide Friction app (sets visibility to DRAFT so it won't appear in public catalog)
UPDATE "Application" 
SET visibility = 'DRAFT', updatedAt = NOW()
WHERE slug = 'friction' OR slug ILIKE '%friction%';

-- Verify the update
SELECT slug, name, visibility FROM "Application" WHERE slug ILIKE '%friction%';
SQL

echo ""
echo "✅ Friction app hidden (visibility set to DRAFT)"
echo ""
echo "Next steps:"
echo "1. Make GitHub repo private: https://github.com/SavigeSystemZ/Friction/settings"
echo "   - Settings → General → Danger Zone → Change visibility to Private"
echo "2. Update admin /code panel to reflect private status"
echo "3. Friction will no longer appear in:"
echo "   - Public catalog (/applications)"
echo "   - Home page featured apps"
echo "   - Repository list (/repos)"
