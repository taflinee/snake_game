#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
PORT="${PORT:-8000}"
URL="http://localhost:${PORT}/index.html"

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
fi

printf 'Petal is running at %s\nPress Ctrl+C to stop.\n' "$URL"
python3 -m http.server "$PORT"
