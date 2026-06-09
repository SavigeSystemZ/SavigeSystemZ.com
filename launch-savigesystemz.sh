#!/usr/bin/env bash
set -euo pipefail
URL="http://127.0.0.1:41361/"
systemctl --user start savigesystemz.service 2>/dev/null || true
for _ in $(seq 1 30); do curl -fs -o /dev/null "$URL" 2>/dev/null && break; sleep 1; done
exec /home/whyte/.local/bin/myappz-open "$URL"
