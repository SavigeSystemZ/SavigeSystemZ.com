#!/usr/bin/env bash
set -euo pipefail

test -f "${HOME}/.local/share/applications/savigesystemz.desktop"
echo "desktop_entry=ok"
if [[ -f "${HOME}/.local/share/icons/hicolor/256x256/apps/savigesystemz.png" ]]; then
  echo "icon=ok"
else
  echo "icon=missing"
fi
