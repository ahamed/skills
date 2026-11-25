#!/usr/bin/env bash
# Render an HTML banner to a PNG at an exact pixel size with headless Chrome.
#
# Usage: render_banner.sh <input.html> <output.png> [width] [height]
# Defaults: 1200 x 627 (LinkedIn shared-image size).
#
# Falls back to Playwright (npx) when no Chrome/Chromium binary is found.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <input.html> <output.png> [width] [height]" >&2
  exit 1
fi

IN="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
OUT="$2"
W="${3:-1200}"
H="${4:-627}"

mkdir -p "$(dirname "$OUT")"
OUT="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

find_chrome() {
  local c
  for c in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"; do
    [[ -x "$c" ]] && { echo "$c"; return; }
  done
  for c in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge; do
    command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return; }
  done
}

CHROME="$(find_chrome || true)"

if [[ -n "$CHROME" ]]; then
  # virtual-time-budget gives web fonts time to load before the capture.
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${W},${H}" \
    --virtual-time-budget=4000 \
    --screenshot="$OUT" "file://$IN" >/dev/null 2>&1
elif command -v npx >/dev/null 2>&1; then
  npx -y playwright@1.47.2 screenshot --viewport-size="${W},${H}" \
    --wait-for-timeout=2000 "file://$IN" "$OUT" >/dev/null
else
  echo "No Chrome/Chromium and no npx found. Install Chrome or Node.js." >&2
  exit 2
fi

[[ -s "$OUT" ]] || { echo "Render failed: $OUT is empty or missing." >&2; exit 3; }
echo "$OUT"
