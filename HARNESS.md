# Armory's Own Harness — vs. the Catalog

**Two different things live in this repo. Don't confuse them.**

## 🔧 Armory's own harness — the gear that *is* Armory

Install these to give **your** agent the ability to search + pull from the whole registry:

| Piece | Path | What it is |
|---|---|---|
| **Armory MCP server** | `armory-mcp/` | `search_components` / `get_component` / `submit_component` over stdio (pkg `armory-mcp`) |
| **Armory CLI** | `cli/` | `armory search` / `armory install` (pkg `@namanparikh/armory`) |
| **Armory skill** | `armory-skill/` | the `armory` skill — teaches an agent *when + how* to reach into the registry |
| **Armory plugin** | `armory-plugin/` | one-install Claude Code plugin bundling the MCP + skill + `/armory` |

There is exactly **one** Armory MCP server (`armory-mcp/`). It is **not** one of the cataloged MCPs.

## 📚 The catalog — the 24,356 components Armory *aggregates*

| Piece | Path | What it is |
|---|---|---|
| **The brain** | `brain/` | Obsidian metadata graph (frontmatter + `[[wikilinks]]`) — source of truth |
| **The index** | `catalog.json` | generated, never hand-typed |
| **The actual gear** | `components/<type>/` | the **real files**: skills, agents, commands, hooks, rules, mcp-servers |
| **Harness drops** | `.claude/ .cursor/ .codex/ .opencode/ .gemini/` | the catalog laid out in each harness's native format |

## The one rule that prevents confusion

- `armory-mcp/` (our **one** server) ≠ `components/mcp-servers/` (the **thousands** we catalog).
- `armory-skill/` (our **one** skill) ≠ `components/skills/` (the **~1,100** we catalog).

Our gear is prefixed `armory-*`. Everything under `components/`, `brain/`, and the harness-native dot-folders is *catalog data Armory aggregates from many sources* — no single source is special.
