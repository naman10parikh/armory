#!/usr/bin/env bash
#
# worktree-new.sh — create an isolated git worktree for a parallel Claude Code task.
#
# Creates a sibling worktree `../engram-wt-<task-slug>` on a new branch
# `wt/<task-slug>` off main. Symlinks shared secrets (.env / .env.local) so a
# single source of truth feeds every worktree, but NEVER symlinks node_modules
# (native binaries + pnpm's .pnpm virtual store break across symlinks). Runs
# `pnpm install` so the worktree is ready to build.
#
# Usage: scripts/worktree-new.sh <task-slug>
#   <task-slug>  short kebab-case task name, e.g. "auth", "site-polish"
#
set -euo pipefail

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "Usage: scripts/worktree-new.sh <task-slug>" >&2
  echo "  e.g. scripts/worktree-new.sh site-polish" >&2
  exit 1
fi

SLUG="$1"
# Resolve repo root from this script's location so it works from any CWD.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
BRANCH="wt/${SLUG}"
WT_DIR="$(dirname "$REPO_ROOT")/$(basename "$REPO_ROOT")-wt-${SLUG}"

if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  echo "Error: branch '${BRANCH}' already exists. Pick a new slug or clean up first." >&2
  exit 1
fi
if [[ -e "$WT_DIR" ]]; then
  echo "Error: worktree path already exists: $WT_DIR" >&2
  exit 1
fi

echo "Creating worktree '$WT_DIR' on branch '$BRANCH' off main..."
git -C "$REPO_ROOT" worktree add "$WT_DIR" -b "$BRANCH" main

# Symlink shared secrets (single source of truth in the main worktree).
# Per-worktree PORT/URL overrides belong in .env.development.local, not here.
for secret in .env .env.local; do
  if [[ -f "$REPO_ROOT/$secret" ]]; then
    ln -sf "$REPO_ROOT/$secret" "$WT_DIR/$secret"
    echo "  symlinked $secret (shared)"
  fi
done

# NEVER symlink node_modules — each worktree gets its own install. pnpm's
# global content-addressed store (~/.pnpm-store) is shared automatically, so
# this is cheap on disk (hardlinks), just not free on time.
echo "Running pnpm install in worktree (this may take a moment)..."
( cd "$WT_DIR" && pnpm install )

echo ""
echo "Worktree ready."
echo "  path:   $WT_DIR"
echo "  branch: $BRANCH"
echo "  next:   scripts/worktree-launch.sh $SLUG   # launch Claude Code there"
