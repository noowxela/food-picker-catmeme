#!/usr/bin/env bash
# Build a flat static site for GitHub Pages (project site root).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-"$ROOT/site"}"
API_BASE="${API_BASE:-http://localhost:3000/v1/}"
CAT_API_KEY="${CAT_API_KEY:-}"

rm -rf "$OUT"
mkdir -p "$OUT/assets"

cp "$ROOT/pages/index.html" "$OUT/index.html"
cp "$ROOT/pages/restaurants.html" "$OUT/restaurants.html"
cp "$ROOT/pages/history.html" "$OUT/history.html"
cp "$ROOT/pages/main.js" "$OUT/main.js"
cp -R "$ROOT/assets/." "$OUT/assets/"

# Ensure trailing slash on API base for client path joins.
case "$API_BASE" in
  */) ;;
  *) API_BASE="${API_BASE}/" ;;
esac

python3 - "$OUT/assets/js/config.js" "$API_BASE" "$CAT_API_KEY" <<'PY'
import json, pathlib, sys
out, api_base, cat_key = sys.argv[1], sys.argv[2], sys.argv[3]
pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True)
pathlib.Path(out).write_text(
    f"window.API_BASE = {json.dumps(api_base)};\n"
    f"window.CAT_API_KEY = {json.dumps(cat_key)};\n",
    encoding="utf-8",
)
print(f"wrote {out}")
PY

echo "Static site ready at $OUT"
