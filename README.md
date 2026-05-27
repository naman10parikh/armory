<div align="center">

# ⚔️ Armory

### Where agents gear up.

**Armory** is the open-source, ever-evolving registry of every agent-harness component on earth — MCPs, skills, hooks, sub-agents, identity files, memory patterns, rules, CLIs, eval frameworks, observability, infrastructure, and the workflows that compose them. One armory your agent reaches into to grab exactly the gear it needs.

***For agents, by agents, of agents.***

[**🔗 Live registry → armory-murex.vercel.app**](https://armory-murex.vercel.app) · [Browse 24,000+ components](https://armory-murex.vercel.app/browse)

![components](https://img.shields.io/badge/components-24%2C356-e0a458) ![categories](https://img.shields.io/badge/categories-12-e0a458) ![license](https://img.shields.io/badge/license-MIT-e0a458)

</div>

---

## The most of everything, in one place

Armory mirrors and de-duplicates the biggest open-source catalogs into a single connected brain — so it holds **more harness components than any individual registry**:

| Category | What it holds |
|---|---|
| **MCPs** | PulseMCP + Smithery + Glama + mcp.so + awesome-mcp-servers + the official `modelcontextprotocol/servers` — deduped into ~21,000 |
| **Skills** | `anthropics/skills` + `obra/superpowers` + community skill packs + awesome-claude-code |
| **Sub-Agents** | wshobson, VoltAgent, davila7, + community collections |
| **Rules** | awesome-cursorrules + multi-language rule packs + CLAUDE.md collections |
| **Hooks** | disler hooks-mastery, decider, awesome-claude-code, + community hook sets |
| **CLIs & Tools · Evals · Observability · Infrastructure** | the four categories every other list under-covers — first-class here |
| **Identity · Memory · Workflows** | SOUL/persona specs, memory layers, command + composition recipes |

Every entry is de-duplicated by name, carries provenance (`source_repo`, `license`, `stars`, `verified_at`), and is wired into a knowledge graph via `related:` links — so following one component leads you to the next.

## Not an aggregator for humans — a brain for agents

Curated lists get starred and forgotten in a browser tab. Armory is built to be **used by the agents themselves**:

- 🤖 **Agents read it** — your coding agent pulls the right component straight into its harness.
- 🔎 **Agents query it** — the Armory MCP server, the `armory` CLI, and the search site all read one generated `catalog.json`.
- 🛠️ **Agents install from it** — `armory install <name>` *fetches the real thing* (via `gh`/git) and drops it into whatever harness you're in.
- ♻️ **Agents improve it** — it self-evolves: crawl new sources, re-verify, score, prune. The armory restocks itself.

## Gear up — the CLI is a package manager for harnesses

```bash
npm i -g @namanparikh/armory                  # install once — the command is `armory`
armory search "browser automation"              # rank across ~17,000 components
armory install playwright-mcp                   # fetch + wire it into THIS project's harness
armory install code-reviewer --cli cursor       # …or target Cursor / Codex / OpenCode / Gemini
# no global install? one-off:  npx @namanparikh/armory search "…"
```

`armory install` auto-detects your harness (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.gemini/`), fetches the component from its source repo, and installs it the right way for that CLI — MCPs into the MCP config, skills into the skills dir, sub-agents/hooks/rules/commands into their slots. One command, any harness, any component type.

## Install Armory itself as a plugin — one step, any harness

Armory ships as a **plugin for every coding harness**. Install once and your agent can search + pull from all 24,000+ components — and the 2,546 vendored skills / agents / commands are right there.

| Harness | Install |
|---|---|
| **Claude Code** | `claude plugin marketplace add naman10parikh/armory && claude plugin install armory@armory` |
| **Codex** | `codex plugin marketplace add naman10parikh/armory` |
| **OpenCode** | add `armory-mcp` to `opencode.json` — see [PLUGIN.md](./PLUGIN.md) |
| **Gemini CLI** | add `armory-mcp` to `.gemini/settings.json` |
| **Hermes** | `hermes plugin add naman10parikh/armory` |
| **Anything** | `bash install.sh` (auto-detects the harness) |

The plugin wires in the **Armory MCP server** (`armory-mcp` — live search/install at runtime) + the `armory` skill. Full per-harness commands in [PLUGIN.md](./PLUGIN.md); Armory's own harness vs. the catalog is documented in [HARNESS.md](./HARNESS.md).

## The actual gear lives here — not just links

The catalog isn't only metadata. The **real component files** are vendored in:

- `components/{skills,agents,commands,hooks,rules}/` — 2,546 actual files (content verbatim + provenance header).
- Harness-native drops: `.claude/{skills,agents,commands,hooks}`, `.cursor/rules/` — ready to use as-is.
- `brain/` stays the metadata knowledge-graph (source of truth). MCP servers are cataloged as install-specs in `catalog.json` (the servers themselves run externally).

## Open it as a brain

`brain/` is an **Obsidian vault** — markdown + frontmatter + `[[wikilinks]]`. Open the folder in Obsidian and explore the whole graph; the `related:` edges are the connections between gear. One source of truth → the site, the MCP server, and the CLI are all generated from it (counts computed, never hand-typed).

## Contribute

Armory is a registry — add a component via PR or `armory submit`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the one-file format and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Every contribution restocks the armory for every agent.

## License

MIT. Built in the open for the agent community.

<div align="center"><sub>⚔️ Armory · where agents gear up</sub></div>
