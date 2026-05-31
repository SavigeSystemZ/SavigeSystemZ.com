#!/usr/bin/env bash
# Smoke-test the installed launcher (.deb path) and, when present, the AppImage
# artifact in dist/packages/.
#
# Modes:
#   default — assert the user-installed desktop entry + icon (legacy check).
#   --appimage — also exercise the latest AppImage in dist/packages/: launch it,
#                wait for port 43907, hit /api/health, then tear it down.
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly PORT="${SITE_PORT:-43907}"
readonly HEALTH_URL="http://127.0.0.1:${PORT}/api/health"
readonly TIMEOUT_SECONDS=45

log() { printf '[validate-install] %s\n' "$*"; }

check_legacy_install() {
  if [[ -f "${HOME}/.local/share/applications/savigesystemz.desktop" ]]; then
    log "desktop_entry=ok"
  else
    log "desktop_entry=missing"
  fi
  if [[ -f "${HOME}/.local/share/icons/hicolor/256x256/apps/savigesystemz.png" ]] \
    || [[ -f "${HOME}/.local/share/icons/hicolor/scalable/apps/savigesystemz.svg" ]]; then
    log "icon=ok"
  else
    log "icon=missing"
  fi
}

probe_port() {
  (echo > "/dev/tcp/127.0.0.1/${PORT}") >/dev/null 2>&1
}

smoke_appimage() {
  local image
  image="$(find "${REPO_ROOT}/dist/packages" -maxdepth 1 -name 'SavigeSystemZ-*.AppImage' \
    -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2- || true)"
  if [[ -z "${image}" || ! -f "${image}" ]]; then
    log "appimage=missing (run installer/scripts/build-packages.sh first)"
    return 0
  fi

  if probe_port; then
    log "appimage=skipped (port ${PORT} already bound)"
    return 0
  fi

  log "appimage=launch ${image}"
  chmod +x "${image}"
  "${image}" >/tmp/savigesystemz-appimage.log 2>&1 &
  local pid=$!
  trap 'kill "${pid}" 2>/dev/null || true; wait "${pid}" 2>/dev/null || true' EXIT INT TERM

  local waited=0
  until probe_port; do
    if (( waited >= TIMEOUT_SECONDS )); then
      log "appimage=timeout (no port bind in ${TIMEOUT_SECONDS}s)"
      log "----- launch log -----"
      cat /tmp/savigesystemz-appimage.log >&2 || true
      exit 3
    fi
    if ! kill -0 "${pid}" 2>/dev/null; then
      log "appimage=exited (process gone before port bind)"
      log "----- launch log -----"
      cat /tmp/savigesystemz-appimage.log >&2 || true
      exit 3
    fi
    sleep 1
    waited=$((waited + 1))
  done

  log "appimage=port_bound; checking ${HEALTH_URL}"
  if curl --fail --silent --show-error --max-time 10 "${HEALTH_URL}" >/dev/null; then
    log "appimage=health_ok"
  else
    log "appimage=health_failed"
    exit 4
  fi
}

main() {
  local want_appimage=0
  for arg in "$@"; do
    case "${arg}" in
      --appimage) want_appimage=1 ;;
      *) log "unknown arg: ${arg}"; exit 64 ;;
    esac
  done

  check_legacy_install
  if (( want_appimage )); then
    smoke_appimage
  fi
}

main "$@"
