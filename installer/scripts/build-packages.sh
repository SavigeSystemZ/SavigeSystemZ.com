#!/usr/bin/env bash
# Build SavigeSystemZ.com Linux launcher packages: AppImage + .deb.
#
# Inputs:
#   - Repository checkout (the script auto-resolves the repo root).
#   - Optional env: APPIMAGETOOL=/path/to/appimagetool (vendored or system).
#                   VERSION=0.1.0 (overrides the value parsed from package.json).
#
# Outputs:
#   dist/packages/SavigeSystemZ-<version>-x86_64.AppImage
#   dist/packages/savigesystemz_<version>_all.deb
#   dist/packages/SHA256SUMS
#
# Both artifacts are smart launchers — they resolve the SavigeSystemZ.com
# repository on the user's disk via SAVIGESYSTEMZ_REPO or
# $HOME/.MyAppZ/SavigeSystemZ.com, then spawn `pnpm dev:web`. They do not
# bundle the Next.js build; that is intentional for the dev-launcher use case.
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly DIST_DIR="${REPO_ROOT}/dist"
readonly STAGE_DIR="${DIST_DIR}/stage"
readonly OUT_DIR="${DIST_DIR}/packages"

VERSION="${VERSION:-$(node -p "require('${REPO_ROOT}/package.json').version" 2>/dev/null || echo 0.1.0)}"
readonly VERSION

log() { printf '[build-packages] %s\n' "$*"; }

clean_stage() {
  rm -rf "${STAGE_DIR}"
  mkdir -p "${STAGE_DIR}" "${OUT_DIR}"
}

# ---------------------------------------------------------------- AppImage ---

build_appimage() {
  log "Staging AppImage tree (version=${VERSION})…"
  local app_dir="${STAGE_DIR}/SavigeSystemZ.AppDir"
  mkdir -p \
    "${app_dir}/usr/bin" \
    "${app_dir}/usr/share/applications" \
    "${app_dir}/usr/share/icons/hicolor/scalable/apps"

  install -m 0755 "${REPO_ROOT}/installer/packaging/appimage/AppRun" "${app_dir}/AppRun"
  install -m 0644 "${REPO_ROOT}/installer/packaging/appimage/savigesystemz.desktop" \
    "${app_dir}/savigesystemz.desktop"
  install -m 0644 "${REPO_ROOT}/installer/packaging/appimage/savigesystemz.desktop" \
    "${app_dir}/usr/share/applications/savigesystemz.desktop"
  install -m 0644 "${REPO_ROOT}/installer/desktop/icons/savigesystemz.svg" \
    "${app_dir}/savigesystemz.svg"
  install -m 0644 "${REPO_ROOT}/installer/desktop/icons/savigesystemz.svg" \
    "${app_dir}/usr/share/icons/hicolor/scalable/apps/savigesystemz.svg"

  local out="${OUT_DIR}/SavigeSystemZ-${VERSION}-x86_64.AppImage"
  if command -v "${APPIMAGETOOL:-appimagetool}" >/dev/null 2>&1; then
    log "Building ${out} with appimagetool…"
    ARCH=x86_64 "${APPIMAGETOOL:-appimagetool}" -n "${app_dir}" "${out}"
  else
    log "appimagetool not on PATH — packaging AppDir as a tarball fallback."
    log "Install appimagetool (https://github.com/AppImage/AppImageKit/releases) for a real .AppImage."
    out="${OUT_DIR}/SavigeSystemZ-${VERSION}-AppDir.tar.gz"
    tar -C "${STAGE_DIR}" -czf "${out}" "SavigeSystemZ.AppDir"
  fi

  printf '%s' "${out}"
}

# ---------------------------------------------------------------------- DEB ---

build_deb() {
  log "Staging .deb tree (version=${VERSION})…"
  local pkg_dir="${STAGE_DIR}/savigesystemz_${VERSION}_all"
  mkdir -p \
    "${pkg_dir}/DEBIAN" \
    "${pkg_dir}/usr/bin" \
    "${pkg_dir}/usr/share/applications" \
    "${pkg_dir}/usr/share/icons/hicolor/scalable/apps" \
    "${pkg_dir}/usr/share/savigesystemz"

  # Render the control file with the resolved version.
  sed -e "s/^Version:.*/Version: ${VERSION}/" \
    "${REPO_ROOT}/installer/packaging/deb/control" \
    > "${pkg_dir}/DEBIAN/control"
  install -m 0755 "${REPO_ROOT}/installer/packaging/deb/postinst" "${pkg_dir}/DEBIAN/postinst"
  install -m 0755 "${REPO_ROOT}/installer/packaging/deb/prerm" "${pkg_dir}/DEBIAN/prerm"

  install -m 0755 "${REPO_ROOT}/installer/packaging/appimage/AppRun" \
    "${pkg_dir}/usr/share/savigesystemz/launch.sh"

  cat > "${pkg_dir}/usr/bin/savigesystemz" <<'EOSH'
#!/usr/bin/env bash
exec /usr/share/savigesystemz/launch.sh "$@"
EOSH
  chmod 0755 "${pkg_dir}/usr/bin/savigesystemz"

  # Patch the .desktop entry so it points at the system binary, not "AppRun".
  sed -e 's|^Exec=.*|Exec=/usr/bin/savigesystemz|' \
    "${REPO_ROOT}/installer/packaging/appimage/savigesystemz.desktop" \
    > "${pkg_dir}/usr/share/applications/savigesystemz.desktop"
  chmod 0644 "${pkg_dir}/usr/share/applications/savigesystemz.desktop"

  install -m 0644 "${REPO_ROOT}/installer/desktop/icons/savigesystemz.svg" \
    "${pkg_dir}/usr/share/icons/hicolor/scalable/apps/savigesystemz.svg"

  local out="${OUT_DIR}/savigesystemz_${VERSION}_all.deb"
  if command -v dpkg-deb >/dev/null 2>&1; then
    log "Building ${out}…"
    dpkg-deb --root-owner-group --build "${pkg_dir}" "${out}" >/dev/null
  else
    log "dpkg-deb not found — falling back to tarball stage."
    out="${OUT_DIR}/savigesystemz_${VERSION}_all.tar.gz"
    tar -C "${STAGE_DIR}" -czf "${out}" "savigesystemz_${VERSION}_all"
  fi

  printf '%s' "${out}"
}

# ------------------------------------------------------------------ Driver ---

main() {
  clean_stage
  local appimage_path deb_path
  appimage_path="$(build_appimage)"
  deb_path="$(build_deb)"

  ( cd "${OUT_DIR}" && sha256sum "$(basename "${appimage_path}")" "$(basename "${deb_path}")" \
    > SHA256SUMS )

  log "Artifacts:"
  log "  AppImage: ${appimage_path}"
  log "  DEB:      ${deb_path}"
  log "  SHA256:   ${OUT_DIR}/SHA256SUMS"
}

main "$@"
