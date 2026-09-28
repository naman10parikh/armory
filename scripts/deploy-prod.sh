#!/usr/bin/env bash
# deploy-prod.sh — ship HEAD to Vercel production and prove it landed.
#
# Deploys from a CLEAN worktree of HEAD (never the working tree, which may hold half-finished lane
# work), waits for the build, moves the production alias, then checks every page and the API. Exit
# non-zero on any failure so a cron or a person notices.
#
#   bash scripts/deploy-prod.sh            # deploy HEAD
#   bash scripts/deploy-prod.sh --no-alias # a preview deployment; production is left alone
#
# CP147 (2026-09-27): a `--prod` deploy took the production domain by itself, so `--no-alias` alone
# still put an unmerged branch live. A preview is now deployed without `--prod`, and because previews
# sit behind Vercel's login, its pages are checked through `vercel curl`.
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALIAS="armory-murex.vercel.app"
PAGES=(/ /leaderboard /ask /formula /pipeline /status /browse /c /c/memory /stack /e/mcps/github-mcp /llms.txt)
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

preview=0; prod="--prod"
[[ "${1:-}" == "--no-alias" ]] && { preview=1; prod=""; }
echo "▸ vercel deploy ${prod:-(preview)} (archive=tgz)"
# CLI 59 streams the build log and prints the deployment URL among it, on either stream — take the
# last deployment URL it mentions rather than trusting "the last line of stdout".
(cd "$WT/web" && vercel deploy $prod --yes --archive=tgz > /tmp/armory-deploy.out 2>&1) || true
url="$(grep -oE 'https://armory-[a-z0-9]+-darwain\.vercel\.app' /tmp/armory-deploy.out | tail -1)"
[[ "$url" == https://* ]] || { echo "deploy failed:"; tail -40 /tmp/armory-deploy.out; exit 1; }
echo "  deployment: $url"

echo "▸ waiting for READY"
for _ in $(seq 1 60); do
  # The status line is "status<TAB>● Ready" — match the word, not a column (the glyph broke awk).
  # vercel inspect prints on STDERR; `\s` is not BSD grep — match the word on the status line.
  # CP143 (2026-09-25): `vercel inspect` aborted with exit 134 under memory pressure while the build itself
  # was fine, and set -e killed the deploy before the alias moved. A failed poll now just polls again.
  state="$( (vercel inspect "$url" 2>&1 || true) | grep -m1 -iE '^[[:space:]]*status' | grep -oE 'Ready|Error|Canceled|Building|Queued|Initializing' | head -1 || true)"
  case "$state" in Ready|READY) break ;; Error|ERROR|Canceled|CANCELED) echo "build $state"; exit 1 ;; esac
  sleep 10
done
[[ "$state" =~ ^(Ready|READY)$ ]] || { echo "timed out waiting for READY (last: $state)"; exit 1; }

if [[ $preview -eq 0 ]]; then
  echo "▸ alias → $ALIAS"
  vercel alias set "$url" "$ALIAS" >/dev/null
fi

base="https://$ALIAS"; [[ $preview -eq 1 ]] && base="$url"
get() {  # get <path> <curl options>: a preview goes through `vercel curl`, which passes Vercel's login
  local path=$1; shift
  if [[ $preview -eq 1 ]]; then (cd "$WT/web" && vercel curl "$path" --deployment "$url" -- "$@" 2>/dev/null)
  else curl "$@" "$base$path"; fi
}
echo "▸ verifying $base"
fail=0
for p in "${PAGES[@]}"; do
  code="$(get "$p" -s -o /dev/null -w '%{http_code}' | tail -1)"
  printf '  %s  %s\n' "$code" "$p"
  [[ "$code" == "200" ]] || fail=1
done
top="$(get "/api/rank?limit=3" -s | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.items.map(i=>`${i.name} ${i.universal} ev=${i.evidence} ${i.kind}`).join(" · "))})')"
echo "  /api/rank top-3: $top"
[[ -n "$top" ]] || fail=1
[[ $fail -eq 0 ]] && echo "✓ $sha is live on $base" || { echo "✗ verification failed"; exit 1; }
