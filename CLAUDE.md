@AGENTS.md

# Claude Code notes for Armory

What Armory is, its tools, the ONE rule and the hard rules are in `AGENTS.md`, imported above. This file keeps only
what is specific to Claude Code.

## Hooks

- `.claude/settings.json` runs `scripts/hooks/protect-catalog.mjs` before Edit, Write and MultiEdit. A hand-edit to
  `catalog.json` is denied with the reason (hard rule 1); regenerate it with `pnpm catalog` instead.

## The plugin

- `.claude-plugin/plugin.json` ships the Armory MCP server, `skills/` (Armory's own `armory-*` skills beside the
  vendored ones), `armory-skill/`, the commands in `workflows/`, the two `armory-*` sub-agents and one SessionStart
  reminder (`scripts/hooks/plugin-hooks.json`). Check it with `claude plugin validate .`.
- `.mcp.json` holds only Armory's own server (`npx -y armory-mcp`), so it is safe for anyone who installs the plugin.

## Working here

- `.claude/skills/`, `.claude/agents/`, `.claude/commands/` and `.claude/hooks/` hold cataloged components laid out
  for Claude Code. Only files named `armory-*` are Armory's own.
- Run `pnpm test && pnpm eval` before you say a change is done. For a catalog change, also run
  `node ingest/catalog.mjs` and commit the regenerated `catalog.json`.
- The nightly loop (`autolab.yml`) commits to `main` around 07:00 UTC. Pull before you start, keep commits small,
  push promptly, and rebase (never force) if a push is rejected.
