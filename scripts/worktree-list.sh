#!/usr/bin/env bash
#
# worktree-list.sh — list all git worktrees and the port each is using.
#
# Combines `git worktree list` with the port view: if portless is installed,
# each worktree's dev URL is the auto subdomain (https://<branch>.engram.localhost);
# otherwise the manual PORT from scripts/.worktree-ports is shown.
#
# Usage: scripts/worktree-list.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
PORT_REGISTRY="$REPO_ROOT/scripts/.worktree-ports"
APP_NAME="$(basename "$REPO_ROOT")"

PORTLESS_ON=false
command -v portless >/dev/null 2>&1 && PORTLESS_ON=true

echo "Git worktrees for ${APP_NAME}:"
echo ""

# `git worktree list --porcelain` emits a record per worktree:
#   worktree <path>
#   branch refs/heads/<name>   (or "detached")
while IFS= read -r line; do
  case "$line" in
    worktree\ *) WT_PATH="${line#worktree }" ;;
    branch\ *)   BRANCH="${line#branch refs/heads/}" ;;
    detached)    BRANCH="(detached)" ;;
    "")  # end of one record — print it (skip the trailing sentinel blank line)
      [[ -z "${WT_PATH:-}" ]] && continue
      SLUG="${BRANCH#wt/}"
      if [[ "$PORTLESS_ON" == true ]]; then
        if [[ "$BRANCH" == wt/* ]]; then
          PORT_INFO="https://${SLUG}.${APP_NAME}.localhost (portless)"
        else
          PORT_INFO="https://${APP_NAME}.localhost (portless)"
        fi
      elif [[ -f "$PORT_REGISTRY" ]] && grep -q "^${SLUG}=" "$PORT_REGISTRY"; then
        PORT_INFO="PORT=$(awk -F= -v s="$SLUG" '$1==s{print $2}' "$PORT_REGISTRY")"
      else
        PORT_INFO="(no port assigned yet)"
      fi
      printf "  %-45s %-18s %s\n" "$WT_PATH" "$BRANCH" "$PORT_INFO"
      BRANCH=""; WT_PATH=""
      ;;
  esac
done < <(git -C "$REPO_ROOT" worktree list --porcelain; echo "")

if [[ "$PORTLESS_ON" == false ]]; then
  echo ""
  echo "portless not installed — showing manual PORT registry. Install for auto subdomains:"
  echo "  npm i -g portless"
fi
