#!/usr/bin/env bash
# install.sh — Wire Armory into any coding harness.
#
# Usage:
#   bash install.sh              # auto-detect harness from current directory
#   bash install.sh --cli claude  # target a specific harness
#   bash install.sh --help
#
# Supported harnesses: claude, codex, opencode, gemini, hermes
#
# What this script does:
#   1. Detects which harness is present (or uses --cli flag)
#   2. Wires armory-mcp into that harness's MCP config
#   3. Copies/links component files into that harness's native slot
#   4. Prints exact next-steps

set -euo pipefail

# ── resolve script dir (symlink-safe) ──────────────────────────────────────────
SCRIPT_PATH="$0"
while [ -L "$SCRIPT_PATH" ]; do
  link_dir="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
  SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
  case "$SCRIPT_PATH" in
    /*) ;;
    *) SCRIPT_PATH="$link_dir/$SCRIPT_PATH" ;;
  esac
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

# ── colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

ok()   { printf "${GREEN}  ✓${NC} %s\n" "$*"; }
info() { printf "${CYAN}  →${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}  !${NC} %s\n" "$*"; }
die()  { printf "${RED}  ✗${NC} %s\n" "$*" >&2; exit 1; }
header() { printf "\n${BOLD}%s${NC}\n" "$*"; }

# ── help ──────────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF

${BOLD}Armory installer${NC} — wire the 24,000+ component registry into any coding harness.

${BOLD}Usage:${NC}
  bash install.sh                     Auto-detect harness from current directory
  bash install.sh --cli <harness>     Target a specific harness
  bash install.sh --help              Show this message

${BOLD}Supported harnesses:${NC}
  claude    Claude Code  (writes to .mcp.json + prints plugin install command)
  codex     OpenAI Codex (writes to .codex/mcp.json + codex plugin marketplace add)
  opencode  OpenCode     (writes to opencode.json)
  gemini    Gemini CLI   (writes to .gemini/settings.json)
  hermes    Hermes       (writes to .hermes/config.json)

${BOLD}What you get after install:${NC}
  • armory-mcp running as an MCP server (search + install across 24,000+ components)
  • 2,546 vendored components (skills, agents, commands, hooks) ready to use
  • The 'armory' skill that teaches your agent when to reach into the registry

${BOLD}Examples:${NC}
  cd my-project && bash /path/to/armory/install.sh
  bash install.sh --cli claude
  bash install.sh --cli gemini

${BOLD}Per-harness install command (no script needed):${NC}
  Claude Code : claude plugin marketplace add naman10parikh/armory && claude plugin install armory@armory
  Codex       : codex plugin marketplace add naman10parikh/armory
  OpenCode    : (opencode.json auto-discovered — just clone armory into project root)
  Gemini CLI  : (copy .gemini/settings.json from armory repo into your project)
  Hermes      : hermes plugin add naman10parikh/armory

EOF
}

# ── MCP server snippet ─────────────────────────────────────────────────────────
ARMORY_MCP_SNIPPET='"armory": { "command": "npx", "args": ["-y", "armory-mcp"] }'

# ── JSON merge helper (pure bash, no jq required) ─────────────────────────────
# Injects the armory MCP entry into an existing or new JSON config file.
# Arg 1: target file path
# Arg 2: JSON key path prefix (e.g. "mcpServers" or "mcp")
inject_mcp_entry() {
  local target="$1"
  local key="$2"

  if [ ! -f "$target" ]; then
    printf '{ "%s": { %s } }\n' "$key" "$ARMORY_MCP_SNIPPET" > "$target"
    ok "Created $target with armory MCP entry"
    return
  fi

  # If armory already present, skip
  if grep -q '"armory"' "$target" 2>/dev/null; then
    warn "armory entry already present in $target — skipping"
    return
  fi

  # Simple append: insert before the last closing brace of the key block.
  # This is a best-effort approach without jq. If the file is non-trivial,
  # we warn and ask the user to merge manually.
  if command -v node >/dev/null 2>&1; then
    node - "$target" "$key" "$ARMORY_MCP_SNIPPET" <<'NODE'
const fs = require('fs');
const [,, file, key, snippet] = process.argv;
const raw = fs.readFileSync(file, 'utf8');
let cfg;
try { cfg = JSON.parse(raw); } catch(e) { process.stderr.write('parse error: ' + e.message + '\n'); process.exit(1); }
if (!cfg[key]) cfg[key] = {};
const entry = JSON.parse('{' + snippet + '}');
cfg[key] = Object.assign(cfg[key], entry);
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
NODE
    ok "Merged armory MCP entry into $target"
  else
    warn "Cannot auto-merge $target (node not found). Add this manually:"
    printf '  "%s": { %s }\n' "$key" "$ARMORY_MCP_SNIPPET"
  fi
}

# ── detect harness ─────────────────────────────────────────────────────────────
detect_harness() {
  local cwd="$1"
  if [ -d "$cwd/.claude" ] || [ -f "$cwd/.claude/settings.json" ]; then
    echo "claude"
  elif [ -d "$cwd/.codex" ] || [ -f "$cwd/.codex/config.toml" ]; then
    echo "codex"
  elif [ -f "$cwd/opencode.json" ] || [ -d "$cwd/.opencode" ]; then
    echo "opencode"
  elif [ -d "$cwd/.gemini" ] || [ -f "$cwd/.gemini/settings.json" ]; then
    echo "gemini"
  elif [ -d "$cwd/.hermes" ]; then
    echo "hermes"
  else
    echo "unknown"
  fi
}

# ── per-harness install logic ──────────────────────────────────────────────────
install_claude() {
  header "Installing Armory for Claude Code"
  info "Step 1: Wiring armory-mcp into .mcp.json (project-level)"
  inject_mcp_entry ".mcp.json" "mcpServers"
  info "Step 2: Installing the Claude Code plugin (skills + commands + MCP)"
  printf "\n${BOLD}Run these commands now:${NC}\n"
  printf "  claude plugin marketplace add naman10parikh/armory\n"
  printf "  claude plugin install armory@armory\n\n"
  ok "MCP wired. Run the two commands above to complete plugin install."
}

install_codex() {
  header "Installing Armory for Codex"
  mkdir -p ".codex"
  info "Wiring armory-mcp into .codex/mcp.json"
  inject_mcp_entry ".codex/mcp.json" "mcpServers"
  printf "\n${BOLD}Run this to add the marketplace:${NC}\n"
  printf "  codex plugin marketplace add naman10parikh/armory\n\n"
  ok "MCP wired. Add the marketplace to complete install."
}

install_opencode() {
  header "Installing Armory for OpenCode"
  info "Merging armory-mcp into opencode.json"
  inject_mcp_entry "opencode.json" "mcp"
  ok "Done. OpenCode auto-discovers opencode.json from the project root."
  printf "\n${BOLD}Next steps:${NC}\n"
  printf "  Restart OpenCode — armory-mcp will appear in your MCP list.\n\n"
}

install_gemini() {
  header "Installing Armory for Gemini CLI"
  mkdir -p ".gemini"
  info "Merging armory-mcp into .gemini/settings.json"
  inject_mcp_entry ".gemini/settings.json" "mcpServers"
  ok "Done. Restart Gemini CLI to pick up the new MCP server."
  printf "\n${BOLD}Next steps:${NC}\n"
  printf "  gemini  # restart — armory-mcp will be available\n\n"
}

install_hermes() {
  header "Installing Armory for Hermes"
  mkdir -p ".hermes"
  info "Merging armory-mcp into .hermes/config.json"
  inject_mcp_entry ".hermes/config.json" "mcpServers"
  printf "\n${BOLD}Optional: add via marketplace if supported:${NC}\n"
  printf "  hermes plugin add naman10parikh/armory\n\n"
  ok "MCP wired. Restart Hermes to activate."
}

install_unknown() {
  header "No harness detected — showing all options"
  warn "Could not detect a harness in the current directory."
  printf "\nUse ${BOLD}--cli <harness>${NC} to target one explicitly:\n"
  printf "  bash install.sh --cli claude\n"
  printf "  bash install.sh --cli codex\n"
  printf "  bash install.sh --cli opencode\n"
  printf "  bash install.sh --cli gemini\n"
  printf "  bash install.sh --cli hermes\n\n"
  printf "Or install via plugin marketplace (Claude Code):\n"
  printf "  claude plugin marketplace add naman10parikh/armory && claude plugin install armory@armory\n\n"
  exit 0
}

# ── main ───────────────────────────────────────────────────────────────────────
main() {
  local cli_flag=""

  # parse args
  while [ $# -gt 0 ]; do
    case "$1" in
      --help|-h) usage; exit 0 ;;
      --cli)
        shift
        cli_flag="${1:-}"
        [ -z "$cli_flag" ] && die "--cli requires a harness name (claude|codex|opencode|gemini|hermes)"
        shift
        ;;
      *) die "Unknown argument: $1. Run 'bash install.sh --help' for usage." ;;
    esac
  done

  printf "\n${BOLD}Armory v0.2.0 installer${NC}\n"
  printf "Repo: %s\n" "$SCRIPT_DIR"

  local harness
  if [ -n "$cli_flag" ]; then
    harness="$cli_flag"
  else
    harness="$(detect_harness "$(pwd)")"
    if [ "$harness" = "unknown" ]; then
      install_unknown
      return
    fi
    info "Detected harness: $harness"
  fi

  case "$harness" in
    claude)  install_claude ;;
    codex)   install_codex ;;
    opencode) install_opencode ;;
    gemini)  install_gemini ;;
    hermes)  install_hermes ;;
    *) die "Unknown harness '$harness'. Supported: claude, codex, opencode, gemini, hermes" ;;
  esac

  header "Armory install complete"
  printf "  • MCP server : npx -y armory-mcp (starts on-demand)\n"
  printf "  • Skills     : %s/skills/\n" "$SCRIPT_DIR"
  printf "  • Agents     : %s/agents/\n" "$SCRIPT_DIR"
  printf "  • Commands   : %s/commands/\n" "$SCRIPT_DIR"
  printf "  • Docs       : https://armory-murex.vercel.app\n\n"
}

main "$@"
