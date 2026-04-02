#!/usr/bin/env bash
# Install SavigeSystemZ local dev launcher to the user's Desktop.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ICON_PATH="$REPO_ROOT/installer/desktop/icons/savigesystemz.svg"
TEMPLATE="$SCRIPT_DIR/SavigeSystemZ-local.desktop.in"

if [[ ! -f "$ICON_PATH" ]]; then
  echo "Missing icon: $ICON_PATH" >&2
  exit 1
fi

# Target Desktop: explicit DESKTOP_DIR, else HOME/Desktop, else XDG
if [[ -n "${DESKTOP_DIR:-}" ]]; then
  DEST_DIR="$DESKTOP_DIR"
elif [[ -n "${HOME:-}" && -d "${HOME}/Desktop" ]]; then
  DEST_DIR="${HOME}/Desktop"
elif [[ -n "${XDG_DESKTOP_DIR:-}" ]]; then
  DEST_DIR="$XDG_DESKTOP_DIR"
else
  echo "Could not find Desktop. Set DESKTOP_DIR=/path/to/Desktop" >&2
  exit 1
fi

OUT="$DEST_DIR/SavigeSystemZ-local.desktop"
sed "s|@ICON_PATH@|$ICON_PATH|g" "$TEMPLATE" >"$OUT"
chmod 755 "$OUT"
echo "Installed: $OUT"
echo "Start the site from repo: cd $REPO_ROOT && pnpm dev:web"
