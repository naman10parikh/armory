# Armory — Hermes Plugin

> Hermes plugin support is less standardized than Claude Code or Codex. This manifest follows the Codex convention (best available reference) adapted for Hermes. Treat it as best-effort until Hermes publishes an official plugin spec.

## Install

```bash
# If Hermes supports repo-based plugin install
hermes plugin add naman10parikh/armory

# Manual: point Hermes at this directory
hermes plugin install /path/to/armory
```

## What you get

- **Armory MCP** (`armory-mcp` via npx) — `search_components`, `get_component`, `submit_component`
- **900 skills** from `components/skills/`
- **804 agents** from `components/agents/`
- **500 commands** from `components/commands/`

## MCP Server

Hermes picks up MCP servers from the `mcpServers` block in `plugin.json`. The `armory` server starts on-demand via `npx -y armory-mcp` — no pre-install needed.

## More

- Site: https://armory-murex.vercel.app
- All harnesses: see `../PLUGIN.md`
