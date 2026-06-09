#!/bin/bash
# Copy screenshots from local app repos to showcase directory
# Usage: ./scripts/copy-app-screenshots.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDIA_OUTPUT="$REPO_ROOT/apps/web/public/showcase/app-media"

echo "📸 Copying app screenshots from local repositories..."
echo ""

# Ensure output directory exists
mkdir -p "$MEDIA_OUTPUT"

# Array of apps with their local directories
declare -a APPS=(
  "AppScope:app-scope"
  "BlueWraith:blue-wraith"
  "BudgetBeacon:budget-beacon"
  "CleanoutConnect:cleanout-connect"
  "CodeSeal:code-seal"
  "CouplesWealth:couples-wealth"
  "DeepWeave:deep-weave"
  "FlipHole:flip-hole"
  "ForgeCouncil:forge-council"
  "GhostGrid:ghost-grid"
  "HQIQ:hqiq"
  "Immortality:immortality"
  "LuxeLogic:luxe-logic"
  "ModPilot:mod-pilot"
  "Orignym:orignym"
  "PromptMage:prompt-mage"
  "SiliconLedger:silicon-ledger"
  "Sipher:sipher"
  "SteadyStack:steady-stack"
  "TraceForge:trace-forge"
  "Vetraxis:vetraxis"
  "WisdomWarp:wisdom-warp"
)

TOTAL_COPIED=0
TOTAL_APPS=0

for app_entry in "${APPS[@]}"; do
  IFS=":" read -r app_name app_slug <<< "$app_entry"
  
  # Look for screenshots in the local repo
  app_repo="$REPO_ROOT/../$app_name"
  
  if [ ! -d "$app_repo" ]; then
    echo "⚠️  $app_name: repo not found at $app_repo"
    continue
  fi
  
  # Find screenshots in common locations
  screenshots=()
  for dir in "screenshots" "app/assets" "design/screenshots" ".screenshots"; do
    if [ -d "$app_repo/$dir" ]; then
      while IFS= read -r -d '' file; do
        screenshots+=("$file")
      done < <(find "$app_repo/$dir" -maxdepth 1 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) -print0 2>/dev/null | head -z -3)
    fi
  done
  
  if [ ${#screenshots[@]} -gt 0 ]; then
    app_media_dir="$MEDIA_OUTPUT/$app_slug"
    mkdir -p "$app_media_dir"
    
    for screenshot in "${screenshots[@]}"; do
      cp "$screenshot" "$app_media_dir/" 2>/dev/null || true
      TOTAL_COPIED=$((TOTAL_COPIED + 1))
    done
    
    echo "✅ $app_name: ${#screenshots[@]} screenshot(s) → $app_slug/"
    TOTAL_APPS=$((TOTAL_APPS + 1))
  fi
done

echo ""
echo "=" | awk '{for(i=0;i<70;i++) printf "="}' && echo ""
echo "🎉 Complete! Copied $TOTAL_COPIED screenshots from $TOTAL_APPS apps"
echo ""
echo "Screenshots are now in: $MEDIA_OUTPUT"
echo ""
echo "📋 Next steps:"
echo "1. Upload via admin UI: /admin/applications/[id] → Add Media"
echo "2. Or commit to repo: git add apps/web/public/showcase/app-media/"
echo "3. Use live app screenshots: pnpm code:capture-ui-screenshots"
