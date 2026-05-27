#!/usr/bin/env bash
#
# worktree-launch.sh — launch a Claude Code instance inside a task worktree.
#
# cd's into the sibling worktree `../engram-wt-<task-slug>` and starts Claude
# Code with the mandatory harness flags. Does NOT pass --model / --effort:
# the adaptive budget system owns those via env vars.
#
# Port isolation:
#   - If portless is installed, the dev server self-isolates per worktree
#     (https://<branch>.engram.localhost) — no manual port. We export
#     ENGRAM_DEV_CMD="pnpm dev:portless" as a hint for the session.
#   - Otherwise we pick a free PORT from a 4000-4999 registry kept at
#     scripts/.worktree-ports and export it so `next dev` / `vite` pick it up.
#
# Usage: scripts/worktree-launch.sh <task-slug>
#
set -euo pipefail

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: scripts/worktree-launch.sh <task-slug>" >&2
  echo "  e.g. scripts/worktree-launch.sh site-polish" >&2
  exit 1
fi

SLUG="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WT_DIR="$(dirname "$REPO_ROOT")/$(basename "$REPO_ROOT")-wt-${SLUG}"
PORT_REGISTRY="$REPO_ROOT/scripts/.worktree-ports"

if [[ ! -d "$WT_DIR" ]]; then
  echo "Error: worktree not found: $WT_DIR" >&2
  echo "  create it first: scripts/worktree-new.sh $SLUG" >&2
  exit 1
fi

cd "$WT_DIR"

if command -v portless >/dev/null 2>&1; then
  echo "portless detected — dev server self-isolates per worktree subdomain."
  echo "  run inside Claude:  pnpm dev:portless   (-> https://${SLUG}.engram.localhost)"
  export ENGRAM_DEV_CMD="pnpm dev:portless"
else
  # Manual PORT registry: one stable port per slug from the 4000-4999 range.
  touch "$PORT_REGISTRY"
  PORT="$(awk -F= -v s="$SLUG" '$1==s {print $2; found=1} END {exit !found}' "$PORT_REGISTRY" || true)"
  if [[ -z "${PORT:-}" ]]; then
    # Find the lowest free port in 4000-4999 not already claimed in the registry.
    USED="$(awk -F= '{print $2}' "$PORT_REGISTRY")"
    PORT=""
    for candidate in $(seq 4000 4999); do
      if ! grep -qx "$candidate" <<<"$USED"; then PORT="$candidate"; break; fi
    done
    if [[ -z "$PORT" ]]; then
      echo "Error: no free port left in 4000-4999 registry." >&2
      exit 1
    fi
    echo "${SLUG}=${PORT}" >>"$PORT_REGISTRY"
  fi
  export PORT
  echo "portless not installed — assigned manual PORT=$PORT for '$SLUG'."
  echo "  run inside Claude:  pnpm dev   (server binds PORT=$PORT)"
  echo "  tip: install portless for auto subdomains — npm i -g portless"
fi

echo "Launching Claude Code in $WT_DIR ..."
exec claude --dangerously-skip-permissions --chrome
