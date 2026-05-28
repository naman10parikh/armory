# Install Armory as a Plugin

One install gives any coding harness:
- **Armory MCP** (`armory-mcp`) — `search_components` / `get_component` / `submit_component` across 24,000+ cataloged harness components
- **2,546 vendored components** — skills, agents, commands, hooks ready to use immediately

---

## Claude Code

```bash
claude plugin marketplace add naman10parikh/armory
claude plugin install armory@armory
```

Or add the MCP server manually to `.mcp.json`:

```json
{
  "mcpServers": {
    "armory": { "command": "npx", "args": ["-y", "armory-mcp"] }
  }
}
```

Plugin manifest: `.claude-plugin/plugin.json`

---

## Codex

```bash
codex plugin marketplace add naman10parikh/armory
```

Or add the MCP server manually to `.codex/mcp.json`:

```json
{
  "mcpServers": {
    "armory": { "command": "npx", "args": ["-y", "armory-mcp"] }
  }
}
```

Plugin manifest: `.codex-plugin/plugin.json`

---

## OpenCode

Add to `opencode.json` in your project root:

```json
{
  "mcp": {
    "armory": { "command": "npx", "args": ["-y", "armory-mcp"] }
  }
}
```

Or clone Armory into your project and OpenCode will auto-discover `opencode.json`.

Config: `opencode.json`

---

## Gemini CLI

Add to `.gemini/settings.json` in your project:

```json
{
  "mcpServers": {
    "armory": { "command": "npx", "args": ["-y", "armory-mcp"] }
  }
}
```

Config: `.gemini/settings.json`

---

## Hermes

```bash
hermes plugin add naman10parikh/armory
```

Or add the MCP server manually to `.hermes/config.json`:

```json
{
  "mcpServers": {
    "armory": { "command": "npx", "args": ["-y", "armory-mcp"] }
  }
}
```

Plugin manifest: `.hermes-plugin/plugin.json`

---

## Auto-detect (any harness)

```bash
# Clone and run the installer — it detects your harness automatically
git clone https://github.com/naman10parikh/armory
cd armory
bash install.sh

# Or target a specific harness
bash install.sh --cli claude
bash install.sh --cli gemini
```

Windows:

```powershell
.\install.ps1
.\install.ps1 -Cli claude
```

---

## What the armory MCP provides

Once installed, your agent can call:

| Tool | What it does |
|---|---|
| `search_components` | Full-text + semantic search across 24,000+ components |
| `get_component` | Full detail on any component: source, license, install cmd, related gear |
| `submit_component` | Add a component back to the registry |

And the `armory` skill (in `armory-skill/SKILL.md`) teaches the agent *when* to reach into the registry vs build from scratch.

---

## Armory vs community skill packs

| | Community skill packs | Armory |
|---|---|---|
| Component source | hand-curated sets | aggregator of 24k+ from 7 sources |
| MCP bundled | no | yes — `armory-mcp` (search + install live) |
| Skills | hundreds | 900 vendored + catalog growing |
| Commands | dozens | 500 vendored |
| Sub-agents | dozens | 804 vendored |
| Self-updating | manual | `armory update` pulls latest catalog |
| Key differentiator | battle-tested patterns | dynamic registry access at agent runtime |

---

## Links

- Site: https://armory-murex.vercel.app
- Repo: https://github.com/naman10parikh/armory
- MCP package: `npx armory-mcp`
- CLI: `npm install -g @namanparikh/armory`
