#!/usr/bin/env bash
# deploy-prod.sh — ship HEAD to Vercel production and prove it landed.
#
# Deploys from a CLEAN worktree of HEAD (never the working tree, which may hold half-finished lane
# work), waits for the build, moves the production alias (Vercel does NOT move it for CLI deploys),
# then checks every page and the API. Exit non-zero on any failure so a cron or a person notices.
#
#   bash scripts/deploy-prod.sh            # deploy HEAD
#   bash scripts/deploy-prod.sh --no-alias # deploy only (preview URL), leave production alone
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALIAS="armory-murex.vercel.app"
PAGES=(/ /leaderboard /ask /formula /graph /status /browse /c /c/memory /stack /e/mcps/github-mcp /llms.txt)
WT="$(mktemp -d)/armory-deploy"

cleanup() { git -C "$ROOT" worktree remove --force "$WT" >/dev/null 2>&1 || true; }
trap cleanup EXIT

sha="$(git -C "$ROOT" rev-parse --short HEAD)"
echo "▸ worktree of $sha → $WT"
git -C "$ROOT" worktree add --detach "$WT" HEAD >/dev/null
cp -R "$ROOT/web/.vercel" "$WT/web/.vercel"          # project link (gitignored)
# Vendor catalog.json (+ the brain the pages read) into web/ — the deploy root is web/, and the
# parent-dir source is not uploaded. Without this the remote `npm run build` dies in copy-data.
(cd "$WT/web" && node scripts/copy-data.mjs >/dev/null)

echo "▸ vercel deploy --prod (archive=tgz)"
# CLI 59 streams the build log and prints the deployment URL among it, on either stream — take the
# last deployment URL it mentions rather than trusting "the last line of stdout".
(cd "$WT/web" && vercel deploy --prod --yes --archive=tgz > /tmp/armory-deploy.out 2>&1) || true
url="$(grep -oE 'https://armory-[a-z0-9]+-darwain\.vercel\.app' /tmp/armory-deploy.out | tail -1)"
[[ "$url" == https://* ]] || { echo "deploy failed:"; tail -40 /tmp/armory-deploy.out; exit 1; }
echo "  deployment: $url"

echo "▸ waiting for READY"
for _ in $(seq 1 60); do
  # The status line is "status<TAB>● Ready" — match the word, not a column (the glyph broke awk).
  # vercel inspect prints on STDERR; `\s` is not BSD grep — match the word on the status line.
  state="$(vercel inspect "$url" 2>&1 | grep -m1 -iE '^[[:space:]]*status' | grep -oE 'Ready|Error|Canceled|Building|Queued|Initializing' | head -1)"
  case "$state" in Ready|READY) break ;; Error|ERROR|Canceled|CANCELED) echo "build $state"; exit 1 ;; esac
  sleep 10
done
[[ "$state" =~ ^(Ready|READY)$ ]] || { echo "timed out waiting for READY (last: $state)"; exit 1; }

if [[ "${1:-}" != "--no-alias" ]]; then
  echo "▸ alias → $ALIAS"
  vercel alias set "$url" "$ALIAS" >/dev/null
fi

base="https://$ALIAS"; [[ "${1:-}" == "--no-alias" ]] && base="$url"
echo "▸ verifying $base"
fail=0
for p in "${PAGES[@]}"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$base$p")"
  printf '  %s  %s\n' "$code" "$p"
  [[ "$code" == "200" ]] || fail=1
done
top="$(curl -s "$base/api/rank?limit=3" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.items.map(i=>`${i.name} ${i.universal} ev=${i.evidence} ${i.kind}`).join(" · "))})')"
echo "  /api/rank top-3: $top"
[[ -n "$top" ]] || fail=1
[[ $fail -eq 0 ]] && echo "✓ $sha is live on $base" || { echo "✗ verification failed"; exit 1; }
