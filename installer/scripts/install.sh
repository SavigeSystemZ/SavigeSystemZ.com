#!/usr/bin/env bash
set -euo pipefail

PREFIX="${1:-/opt/savigesystemz}"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"
DESKTOP_DIR="${HOME}/.local/share/applications"

mkdir -p "${PREFIX}" "${ICON_DIR}" "${DESKTOP_DIR}"
cp -f installer/savigesystemz.desktop "${DESKTOP_DIR}/savigesystemz.desktop"
cp -f installer/assets/icons/savigesystemz.png "${ICON_DIR}/savigesystemz.png" || true

sed -i "s|Exec=.*|Exec=${PREFIX}/start.sh|g" "${DESKTOP_DIR}/savigesystemz.desktop"
chmod +x "${DESKTOP_DIR}/savigesystemz.desktop"

echo "Installed launcher and icon to user paths."
