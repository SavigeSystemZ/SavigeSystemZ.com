# Desktop launcher (local dev)

Opens **`http://127.0.0.1:3000/`** in your default browser. Start the app first:

```bash
cd /path/to/SavigeSystemZ.com
pnpm install
cd apps/web && pnpm exec prisma migrate deploy && pnpm exec prisma db seed
cd ../..
pnpm dev:web
```

## Install shortcut

From repo root:

```bash
chmod +x installer/desktop/install-desktop-launcher.sh
./installer/desktop/install-desktop-launcher.sh
```

To install for another user (e.g. from a root shell):

```bash
DESKTOP_DIR=/home/youruser/Desktop HOME=/home/youruser ./installer/desktop/install-desktop-launcher.sh
```

First launch: your desktop environment may ask to **trust** the launcher (mark executable is already applied).

## Icon

Custom icon: **`icons/savigesystemz.svg`** (cyan/magenta on dark). If your DE does not show SVG icons, convert to PNG and edit the `Icon=` line in the generated `.desktop` file.
