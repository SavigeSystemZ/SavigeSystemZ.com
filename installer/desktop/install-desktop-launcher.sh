#!/usr/bin/env bash
# Install the SavigeSystemZ local dev launcher.
#
# Modes:
#   default  — drop a `xdg-open http://127.0.0.1:43907/` shortcut on the user's
#              Desktop. Lightweight; expects `pnpm dev:web` to be running.
#   --smart  — drop a shortcut that runs the AppRun launcher directly: it
#              acquires a single-instance lock, spawns `pnpm dev:web` if the
#              port is free, polls for the bind, then opens the browser.
#   --package — invoke installer/scripts/build-packages.sh and (if a .deb is
#              produced and `dpkg` is available) install it via sudo.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ICON_PATH="$REPO_ROOT/installer/desktop/icons/savigesystemz.svg"
LAUNCHER="$REPO_ROOT/installer/packaging/appimage/AppRun"
TEMPLATE="$SCRIPT_DIR/SavigeSystemZ-local.desktop.in"

mode="default"
for arg in "$@"; do
  case "$arg" in
    --smart) mode="smart" ;;
    --package) mode="package" ;;
    --help|-h)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown flag: $arg" >&2; exit 64 ;;
  esac
done

if [[ ! -f "$ICON_PATH" ]]; then
  echo "Missing icon: $ICON_PATH" >&2
  exit 1
fi

resolve_desktop_dir() {
  if [[ -n "${DESKTOP_DIR:-}" ]]; then
    printf '%s' "$DESKTOP_DIR"
  elif [[ -n "${HOME:-}" && -d "${HOME}/Desktop" ]]; then
    printf '%s' "${HOME}/Desktop"
  elif [[ -n "${XDG_DESKTOP_DIR:-}" ]]; then
    printf '%s' "$XDG_DESKTOP_DIR"
  else
    echo "Could not find Desktop. Set DESKTOP_DIR=/path/to/Desktop" >&2
    exit 1
  fi
}

install_default() {
  local dest_dir out
  dest_dir="$(resolve_desktop_dir)"
  out="$dest_dir/SavigeSystemZ-local.desktop"
  sed "s|@ICON_PATH@|$ICON_PATH|g" "$TEMPLATE" >"$out"
  chmod 755 "$out"
  echo "Installed: $out"
  echo "Start the site from repo: cd $REPO_ROOT && pnpm dev:web"
}

install_smart() {
  local dest_dir out
  dest_dir="$(resolve_desktop_dir)"
  out="$dest_dir/SavigeSystemZ-local.desktop"
  if [[ ! -x "$LAUNCHER" ]]; then
    chmod +x "$LAUNCHER" || {
      echo "Cannot make $LAUNCHER executable" >&2
      exit 1
    }
  fi
  cat > "$out" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=SavigeSystemZ (smart)
Comment=Auto-spawn pnpm dev:web on 43907 if needed, then open the browser
Exec=env SAVIGESYSTEMZ_REPO=$REPO_ROOT $LAUNCHER
Icon=$ICON_PATH
Terminal=false
Categories=Development;WebDevelopment;
StartupNotify=true
EOF
  chmod 755 "$out"
  echo "Installed (smart): $out"
  echo "Click it: launches the dev server if it's not already running, then opens 127.0.0.1:43907."
}

install_package() {
  local build="$REPO_ROOT/installer/scripts/build-packages.sh"
  if [[ ! -x "$build" ]]; then
    echo "Build script missing/non-executable: $build" >&2
    exit 1
  fi
  "$build"
  local deb
  deb="$(find "$REPO_ROOT/dist/packages" -maxdepth 1 -name 'savigesystemz_*.deb' \
    -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2- || true)"
  if [[ -n "$deb" && -f "$deb" ]] && command -v dpkg >/dev/null 2>&1; then
    echo "Installing $deb via sudo dpkg…"
    sudo dpkg -i "$deb" || {
      echo "dpkg failed; running apt -f to resolve dependencies" >&2
      sudo apt -f install -y || true
    }
  else
    echo "Skipping system install (no .deb produced or dpkg unavailable)."
    echo "Artifacts are in $REPO_ROOT/dist/packages/"
  fi
}

case "$mode" in
  default) install_default ;;
  smart)   install_smart ;;
  package) install_package ;;
esac
