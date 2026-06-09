#!/usr/bin/env bash
# Meta System Coherence Checker
# Validates operational files for consistency, drift, and broken references
# Usage: bash scripts/check-meta-system-coherence.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
META_DIR="$REPO_ROOT/_ai_operating_system"
AI_DIR="$REPO_ROOT/.ai"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_error() {
  echo -e "${RED}✗ ERROR${NC}: $1"
  ((ERRORS++))
}

log_warning() {
  echo -e "${YELLOW}⚠ WARNING${NC}: $1"
  ((WARNINGS++))
}

log_pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
}

echo "════════════════════════════════════════════════════════════════"
echo "   Meta System Coherence Checker"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Verify all referenced commits exist
echo "Test 1: Commit References"
echo "───────────────────────────────────────────────────────────────"
commits=()
while IFS= read -r commit; do
  if [[ $commit =~ [a-f0-9]{7,40} ]]; then
    commits+=("$commit")
  fi
done < <(grep -rho '\`[a-f0-9]\{7,40\}\`' "$META_DIR" "$AI_DIR" | tr -d '`' | sort -u)

for commit in "${commits[@]}"; do
  if git -C "$REPO_ROOT" rev-parse "$commit" &>/dev/null; then
    log_pass "Commit $commit exists"
  else
    log_error "Commit $commit NOT FOUND"
  fi
done
echo ""

# Test 2: Verify file references
echo "Test 2: File References"
echo "───────────────────────────────────────────────────────────────"
files_in_meta=$(find "$META_DIR" -type f -name "*.md" | xargs grep -ho 'apps/[a-z/_-]*\|docs/[a-z/_-]*\|scripts/[a-z/_-.]*\.sh' | sort -u)
for file in $files_in_meta; do
  if [[ -f "$REPO_ROOT/$file" ]]; then
    log_pass "File exists: $file"
  else
    log_warning "File NOT FOUND (may be intentional): $file"
  fi
done
echo ""

# Test 3: Timestamp Alignment
echo "Test 3: Timestamp Alignment"
echo "───────────────────────────────────────────────────────────────"
where_ts=$(grep "Last updated" "$META_DIR/WHERE_LEFT_OFF.md" | tail -1 | grep -o '2026-[0-9][0-9]-[0-9][0-9]' | head -1)
recall_ts=$(grep "Last updated" "$META_DIR/SESSION_RECALL.md" | tail -1 | grep -o '2026-[0-9][0-9]-[0-9][0-9]' | head -1)
current_ts=$(grep "Last Updated" "$AI_DIR/CURRENT_STATUS.md" | head -1 | grep -o '2026-[0-9][0-9]-[0-9][0-9]')

if [[ "$where_ts" == "$recall_ts" ]]; then
  log_pass "WHERE_LEFT_OFF and SESSION_RECALL timestamps aligned: $where_ts"
else
  log_warning "WHERE_LEFT_OFF ($where_ts) and SESSION_RECALL ($recall_ts) timestamps differ"
fi

if [[ "$where_ts" == "$current_ts" ]]; then
  log_pass "WHERE_LEFT_OFF and CURRENT_STATUS timestamps aligned: $where_ts"
else
  log_warning "WHERE_LEFT_OFF ($where_ts) and CURRENT_STATUS ($current_ts) timestamps differ"
fi
echo ""

# Test 4: Priority Consistency (P0/P1/P2)
echo "Test 4: Priority Consistency"
echo "───────────────────────────────────────────────────────────────"
p0_where=$(grep -c "P0" "$META_DIR/WHERE_LEFT_OFF.md" || echo 0)
p0_recall=$(grep -c "P0" "$META_DIR/SESSION_RECALL.md" || echo 0)
p0_todo=$(grep -c "P0" "$META_DIR/TODO.md" || echo 0)

if [[ $p0_where -gt 0 && $p0_recall -gt 0 && $p0_todo -gt 0 ]]; then
  log_pass "P0 mentioned in WHERE_LEFT_OFF, SESSION_RECALL, TODO"
else
  log_warning "P0 priority mentioned inconsistently across files"
fi
echo ""

# Test 5: No Orphan Files in Meta Directory
echo "Test 5: Orphan File Check"
echo "───────────────────────────────────────────────────────────────"
meta_files=$(find "$META_DIR" -type f -name "*.md" | xargs basename -a | sort)
readme_files=$(grep -o '| `[^`]*\.md' "$META_DIR/README.md" | tr -d '|` ' | sort -u)

for file in $meta_files; do
  if grep -q "$file" "$META_DIR/README.md"; then
    log_pass "File $file is referenced in README.md"
  else
    log_warning "Possible orphan: $file (not in README index)"
  fi
done
echo ""

# Test 6: Git Cleanliness
echo "Test 6: Git State"
echo "───────────────────────────────────────────────────────────────"
if git -C "$REPO_ROOT" diff --quiet HEAD -- "$META_DIR" "$AI_DIR" 2>/dev/null; then
  log_pass "No uncommitted changes to meta files"
else
  log_warning "Uncommitted changes detected in meta files"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo "Summary"
echo "════════════════────────────────────────────────────────────────"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"

if [[ $ERRORS -eq 0 ]]; then
  echo -e "${GREEN}✓ Meta system coherence check PASSED${NC}"
  exit 0
else
  echo -e "${RED}✗ Meta system coherence check FAILED${NC}"
  exit 1
fi
