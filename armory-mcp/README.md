# armory-mcp

The MCP server for [Armory](https://armory-murex.vercel.app), a ranked catalog of open-source parts for
coding agents. It gives an agent the catalog over stdio, so it can find a component by what it does and
read how to set it up.

## Tools

| Tool | What it does |
|---|---|
| `search_components` | Find components by name, description and tags |
| `search_catalog` | The same search, returned as ranked JSON with each hit's score and strongest signal |
| `rank_components` | The top of one shelf or domain, ordered by the 0 to 100 score |
| `get_component` | One component in full: source, license, how to install it, related components |
| `submit_component` | Propose a new component; it lands in `incoming/` for review |

Installing is not a tool here. Use the CLI's `armory install`.

## Setup

Not yet on npm. From a clone of the repository:

```bash
cd armory-mcp && pnpm install && pnpm build
```

Then add it to your harness's MCP config, for example `.mcp.json` for Claude Code:

```json
{
  "mcpServers": {
    "armory": { "command": "node", "args": ["/path/to/armory/armory-mcp/dist/index.js"] }
  }
}
```

It reads `catalog.json` from the repository root. Set `ARMORY_ROOT` to use a catalog in another folder.

## License

MIT, like the repository. See [LICENSE](./LICENSE).
