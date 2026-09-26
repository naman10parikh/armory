#!/usr/bin/env bash
# Fresh-install check (CP138 T50): pack the CLI and the MCP server, install both tarballs into a throw-away
# npm prefix with an empty HOME, and use them the way a new user would, outside this repository. Stops with
# a non-zero exit at the first command that fails. Publishes nothing.
#
#   bash scripts/fresh-install-check.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT
PREFIX="$SCRATCH/prefix"
PROJECT="$SCRATCH/project"
mkdir -p "$SCRATCH/home" "$PROJECT"

step() { printf '\n$ %s\n' "$*"; "$@"; }

echo "▸ build and pack (in the repository)"
for pkg in cli armory-mcp; do
  (cd "$ROOT/$pkg" && npm install --no-audit --no-fund --no-package-lock --silent && npm run build --silent && npm pack --silent --pack-destination "$SCRATCH" >/dev/null)
done
ls -1 "$SCRATCH"/*.tgz | sed "s#$SCRATCH/#  #"

echo "▸ install into a throw-away prefix, with an empty HOME"
export HOME="$SCRATCH/home" npm_config_cache="$SCRATCH/npm-cache"
npm install -g --silent --no-audit --no-fund --prefix "$PREFIX" "$SCRATCH"/namanparikh-armory-*.tgz "$SCRATCH"/armory-mcp-*.tgz
export PATH="$PREFIX/bin:$PATH"
cd "$PROJECT"

echo "▸ the installed CLI, in an empty project"
step armory --version
step armory search memory --limit 3
step armory rank --component memory --limit 3
step armory rank --component tools --limit 3
step armory install github-mcp --cli claude --dry-run
step armory init --claude
step cat .mcp.json

echo "▸ the MCP server, started exactly as init wrote it"
read -r -a server < <(node -e 'const s=require("./.mcp.json").mcpServers.armory; console.log([s.command, ...s.args].join(" "))')
step node "$ROOT/scripts/mcp-probe.mjs" "${server[@]}"

echo
echo "✓ fresh install works: search, rank, install --dry-run, init, and the MCP server"
