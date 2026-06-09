#!/bin/bash
set -e

# This script:
# 1. Sets Friction app visibility to DRAFT (hidden from public catalog)
# 2. Collects screenshots from all local app repositories for media upload

echo "🔧 Updating app visibility and collecting screenshots..."
echo ""

# Update database: Set Friction to DRAFT visibility
if [ -n "$DATABASE_URL" ]; then
  echo "📵 Hiding Friction app (setting to DRAFT visibility)..."
  npx prisma db execute --stdin << SQL
UPDATE "Application" 
SET visibility = 'DRAFT' 
WHERE slug = 'friction';
SQL
  echo "✅ Friction hidden from public catalog"
else
  echo "⚠️  DATABASE_URL not set; skipping DB update"
  echo "   To hide Friction manually, run:"
  echo "   UPDATE \"Application\" SET visibility = 'DRAFT' WHERE slug = 'friction';"
fi

echo ""
echo "📸 Collecting app screenshots for media upload..."
echo ""

# Create output directory
MEDIA_DIR="apps/web/public/showcase/app-media"
mkdir -p "$MEDIA_DIR"

# Map of apps with screenshots
declare -A apps=(
  ["AppScope"]="3"
  ["BlueWraith"]="1"
  ["BudgetBeacon"]="15"
  ["CleanoutConnect"]="10"
  ["CodeSeal"]="2"
  ["CouplesWealth"]="10"
  ["DeepWeave"]="2"
  ["FlipHole"]="1"
  ["ForgeCouncil"]="2"
  ["GhostGrid"]="11"
  ["HQIQ"]="14"
  ["Immortality"]="14"
  ["LuxeLogic"]="8"
  ["ModPilot"]="10"
  ["Orignym"]="9"
  ["PromptMage"]="5"
  ["SiliconLedger"]="3"
  ["Sipher"]="52"
  ["SteadyStack"]="5"
  ["TraceForge"]="3"
  ["Vetraxis"]="5"
  ["WisdomWarp"]="2"
)

# Copy first 3 screenshots from each app (most representative)
for app in "${!apps[@]}"; do
  app_slug=$(echo "$app" | tr '[:upper:]' '[:lower:]' | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
  app_media_dir="$MEDIA_DIR/$app_slug"
  mkdir -p "$app_media_dir"
  
  # Look for screenshots
  count=0
  for ss_dir in ../$app/screenshots ../$app/app/assets ../$app/design/screenshots; do
    if [ -d "$ss_dir" ]; then
      for file in "$ss_dir"/*.{png,jpg,jpeg,webp} 2>/dev/null; do
        if [ -f "$file" ]; then
          cp "$file" "$app_media_dir/" 2>/dev/null || true
          count=$((count + 1))
          if [ $count -ge 3 ]; then
            break 2
          fi
        fi
      done
    fi
  done
  
  if [ $count -gt 0 ]; then
    echo "✅ $app: $count screenshots copied to $app_media_dir"
  fi
done

echo ""
echo "🎉 Done! Screenshots ready in: $MEDIA_DIR"
echo ""
echo "Next steps:"
echo "1. Upload screenshots via /admin/applications/[id] media panel"
echo "2. Or use: pnpm code:capture-ui-screenshots (to refresh live app UIs)"
