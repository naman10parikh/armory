#!/usr/bin/env bash
#
# worktree-clean.sh — remove a task worktree and its branch when done.
#
# Removes `../engram-wt-<task-slug>` and deletes branch `wt/<task-slug>` IF it
# is merged into main. Guards against destroying uncommitted work: a dirty
# worktree is warned about, not force-removed. Also frees its port-registry
# entry so the slot can be reused.
#
# Usage: scripts/worktree-clean.sh <task-slug>
#
set -euo pipefail

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: scripts/worktree-clean.sh <task-slug>" >&2
  echo "  e.g. scripts/worktree-clean.sh site-polish" >&2
  exit 1
fi

SLUG="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
BRANCH="wt/${SLUG}"
WT_DIR="$(dirname "$REPO_ROOT")/$(basename "$REPO_ROOT")-wt-${SLUG}"
PORT_REGISTRY="$REPO_ROOT/scripts/.worktree-ports"

if [[ ! -d "$WT_DIR" ]]; then
  echo "Warning: worktree dir not found: $WT_DIR (already removed?)" >&2
else
  # Refuse to nuke uncommitted work. The chairman can re-run after committing.
  if [[ -n "$(git -C "$WT_DIR" status --porcelain)" ]]; then
    echo "Refusing to remove DIRTY worktree (uncommitted changes present):" >&2
    echo "  $WT_DIR" >&2
    echo "  Commit or stash there first, then re-run. (Not forcing — your work is safe.)" >&2
    exit 1
  fi
  echo "Removing clean worktree: $WT_DIR"
  git -C "$REPO_ROOT" worktree remove "$WT_DIR"
fi

git -C "$REPO_ROOT" worktree prune

# Delete branch only if fully merged into main; otherwise warn and keep it.
if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  if git -C "$REPO_ROOT" branch --merged main | grep -qE "^[* ]*${BRANCH}$"; then
    git -C "$REPO_ROOT" branch -d "$BRANCH"
    echo "Deleted merged branch: $BRANCH"
  else
    echo "Branch '$BRANCH' is NOT merged into main — keeping it." >&2
    echo "  Force-delete manually if you're sure: git -C $REPO_ROOT branch -D $BRANCH" >&2
  fi
fi

# Free the manual-port registry entry, if any.
if [[ -f "$PORT_REGISTRY" ]] && grep -q "^${SLUG}=" "$PORT_REGISTRY"; then
  grep -v "^${SLUG}=" "$PORT_REGISTRY" >"${PORT_REGISTRY}.tmp" || true
  mv "${PORT_REGISTRY}.tmp" "$PORT_REGISTRY"
  echo "Freed port registry entry for '$SLUG'."
fi

echo "Done."
