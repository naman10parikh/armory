# Armory — Codex Plugin

## Structure

```
.codex-plugin/
└── plugin.json   — Codex plugin manifest (name, version, skills ref, MCP ref)
skills/ agents/ commands/ hooks/ rules/  — 2,546 vendored components at repo root
armory-skill/     — the armory skill (search + install from registry)
armory-mcp/       — the Armory MCP server package (armory-mcp on npm)
```

## What This Provides

- **900 skills** from `./skills/` — ready to use immediately
- **1 MCP server** — `armory-mcp` (`search_components`, `get_component`, `submit_component`)
- **The `armory` skill** — teaches Codex *when* to reach into the registry vs build from scratch

## Installation

```bash
# Add the public repo marketplace
codex plugin marketplace add naman10parikh/armory

# Or add a local checkout while developing
codex plugin marketplace add /absolute/path/to/armory
```

After adding the marketplace, restart Codex and install `armory` from the plugin directory.

## MCP Server Included

| Server | Package | Purpose |
|---|---|---|
| `armory` | `armory-mcp` (npx) | Search + install across 24,000+ cataloged harness components |

## Notes

- `skills/` (and `agents/`, `commands/`, etc.) are shared across all harnesses — same source, no duplication
- `armory-mcp` starts on-demand via `npx -y armory-mcp` — no pre-install needed
- Credentials: none required (registry is public)
- This manifest does **not** override `~/.codex/config.toml` settings

## More

- Site: https://armory-murex.vercel.app
- All harnesses: see `../PLUGIN.md`
