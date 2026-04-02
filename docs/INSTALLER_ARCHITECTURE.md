# Installer and Packaging Architecture

## Targets
- Linux `.deb`
- Linux AppImage
- Tarball fallback

## Installer responsibilities
- Install desktop launcher entry (`.desktop`)
- Install icon assets
- Validate runtime prerequisites
- Register uninstall and repair procedures

## Packaging safeguards
- Build reproducible artifacts in CI
- Generate checksums
- Optionally sign release assets
- Keep immutable release artifact versions
