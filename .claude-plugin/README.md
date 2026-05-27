# Armory — Claude Code Plugin

One install gives your Claude Code agent:
- **Armory MCP** (`armory-mcp`) — `search_components` + `get_component` + `submit_component` across 24,000+ cataloged harness pieces
- **900 vendored skills** from `components/skills/` — ready to invoke immediately
- **500 vendored commands** from `components/commands/`
- **The `armory` skill** — teaches the agent *when and how* to reach into the registry

## Install

### Via marketplace (recommended)

```bash
claude plugin marketplace add naman10parikh/armory
claude plugin install armory@armory
```

### Manual

```bash
git clone https://github.com/naman10parikh/armory
cd armory
claude plugin install ./
```

## What you get after install

Your agent can immediately:

```
# Search the registry
armory search "browser automation"

# Install any component into the current harness
armory install playwright-skill

# Via MCP (in-conversation)
search_components query="memory store"
get_component name="mem0-mcp"
```

## Armory vs ECC

| | ECC | Armory |
|---|---|---|
| Component source | hand-curated set | aggregator of 24k+ from 7 sources |
| MCP bundled | no | yes — `armory-mcp` (search + install) |
| Skills | 246 | 900 vendored + growing |
| Commands | 76 | 500 |
| Self-updating | manual | `armory update` pulls latest catalog |

## More

- Site: https://armory-murex.vercel.app
- Repo: https://github.com/naman10parikh/armory
- All harnesses: see `../PLUGIN.md`
