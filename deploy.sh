#!/usr/bin/env bash
#
# deploy.sh — publish QUOIN to GitHub Pages in one step.
#
# Usage:
#   ./deploy.sh                 # deploy with an auto-generated commit message
#   ./deploy.sh "your message"  # deploy with your own commit message
#
# What it does:
#   1. Bumps the service-worker cache version (so already-installed phones
#      pick up the new files on their next online launch).
#   2. Commits everything and pushes the `main` branch.
#   3. Publishes the contents of www/ to the `gh-pages` branch that GitHub
#      Pages serves.
#
# After it finishes, open the game once WITH SIGNAL to let the update download,
# then it works offline again.

set -euo pipefail

# Run from the repo root (the folder this script lives in), wherever it's called from.
cd "$(dirname "$0")"

URL="https://travis4dams.github.io/quoin/"
MSG="${1:-Update QUOIN ($(date '+%Y-%m-%d %H:%M'))}"

# Sanity checks
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repo. Run from the quoin folder."; exit 1; }
[ -f www/sw.js ] || { echo "www/sw.js not found — are you in the quoin folder?"; exit 1; }

# 1. Bump the service-worker cache version: quoin-vN -> quoin-v(N+1)
node -e '
  const fs = require("fs"), p = "www/sw.js";
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/quoin-v(\d+)/g, (_, n) => "quoin-v" + (parseInt(n, 10) + 1));
  fs.writeFileSync(p, s);
  console.log("service-worker cache ->", s.match(/quoin-v\d+/)[0]);
'

# 2. Commit + push main
git add -A
if git diff --cached --quiet; then
  echo "Nothing to deploy."
  exit 0
fi
git commit -q -m "$MSG"
git push -q origin main
echo "pushed main"

# 3. Publish www/ to gh-pages
SHA="$(git subtree split --prefix www)"
git push origin "$SHA":refs/heads/gh-pages --force
echo "published gh-pages"

echo
echo "Done. Live in ~1 minute at: $URL"
echo "Open it once with signal to pull the update, then it works offline."
