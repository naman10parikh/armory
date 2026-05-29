<div align="center">

# ⚔️ Armory

### Where agents gear up.

**Armory** is the open-source, ever-evolving registry of every agent-harness component on earth — MCPs, skills, hooks, sub-agents, identity files, memory patterns, rules, CLIs, eval frameworks, observability, infrastructure, and the workflows that compose them. One armory your agent reaches into to grab exactly the gear it needs.

***For agents, by agents, of agents.***

[**🔗 Live registry → armory-murex.vercel.app**](https://armory-murex.vercel.app) · [Browse 25,000+ components](https://armory-murex.vercel.app/browse)

![components](https://img.shields.io/badge/components-25%2C000%2B-e0a458) ![categories](https://img.shields.io/badge/categories-12-e0a458) ![license](https://img.shields.io/badge/license-MIT-e0a458)

</div>

---

## Repo map — five zones

```
🧰 COMPONENT TYPES — every harness component is its own root folder
   mcps/ (~21,850)  skills/ (~1,130)  subagents/ (~730)  workflows/ (~716)
   claudemd-rules/  hooks/  clis-tools/  evals/  observability/
   infrastructure/  memory/  identity/
   └─ each <type>/ holds installable files; full metadata → brain/components/<type>/

📚 brain/           The catalog's source of truth (Obsidian vault) — a detail page per component
catalog.json        └─ generated index (never hand-edited; counts grow nightly)

🔧 ARMORY'S OWN HARNESS — install Armory itself
   armory-mcp/  armory-skill/  cli/
   .claude-plugin/  .codex-plugin/  .hermes-plugin/  .cursor/  .codex/
   .opencode/  .gemini/  opencode.json  .mcp.json  install.sh  install.ps1

⚙️ THE MACHINERY — grow + self-improve
   ingest/ (crawlers, promote, catalog, validate, test-gate, surface)
   incoming/ (ephemeral staging)  repos/ (source-repo watchlist)  autolab.yml  dsip.json

🌐 SITE + DOCS
   web/ (the registry website → armory-murex.vercel.app)  docs/  scripts/ (dev helpers)
```

> **Where are the MCPs?** → `mcps/<slug>.json` (install configs) · details → `brain/components/mcps/<slug>.md`
> Full map of every folder: [STRUCTURE.md](./STRUCTURE.md)

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
- ♻️ **Agents improve it** — it self-evolves nightly ([`autolab.yml`](./.github/workflows/autolab.yml), a remote cron — no laptop needed). `claude -p` discovers new sources (Darwin [DSIP](./dsip.json) Performance-Novelty selection); every candidate passes the [Hamel test-gate](./ingest/test-gate.mjs) — functional + behavioral — *before* it enters, so skills can't drift or go stale. Then dedup → validate → commit. The armory restocks itself.

## Gear up — the CLI is a package manager for harnesses

```bash
npm i -g @namanparikh/armory                  # install once — the command is `armory`
armory search "browser automation"              # rank across ~25,000 components
armory install playwright-mcp                   # fetch + wire it into THIS project's harness
armory install code-reviewer --cli cursor       # …or target Cursor / Codex / OpenCode / Gemini
# no global install? one-off:  npx @namanparikh/armory search "…"
```

`armory install` auto-detects your harness (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.gemini/`), fetches the component from its source repo, and installs it the right way for that CLI — MCPs into the MCP config, skills into the skills dir, sub-agents/hooks/rules/commands into their slots. One command, any harness, any component type.

## Install Armory itself as a plugin — one step, any harness

Armory ships as a **plugin for every coding harness**. Install once and your agent can search + pull from all 25,000+ components — and the ~2,500 vendored skills / sub-agents / workflows / hooks / rules are right there.

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

- `skills/ subagents/ workflows/ hooks/ claudemd-rules/` — ~2,500 actual files at repo root (content verbatim + provenance header).
- Harness-native drops: `.claude/{skills,agents,commands,hooks}`, `.cursor/rules/` — ready to use as-is.
- `brain/` stays the metadata knowledge-graph (source of truth). MCP details live in `brain/components/mcps/<slug>.md`. MCP servers are cataloged as install-specs in `catalog.json` (the servers themselves run externally).

## Open it as a brain

`brain/` is an **Obsidian vault** — markdown + frontmatter + `[[wikilinks]]`. Open the folder in Obsidian and explore the whole graph; the `related:` edges are the connections between gear. One source of truth → the site, the MCP server, and the CLI are all generated from it (counts computed, never hand-typed).

## Standing on the shoulders of

Armory is **for agents, by agents, of agents** — agent-native and recursively self-improving, built almost entirely by agents. But none of it would exist without the open-source catalogs, collections, and reference repos we mirror, de-dup, and learn from. We owe them. The self-improving loop literally [keeps tabs on them](./repos/README.md) so their newest work keeps flowing in — the live list with freshness is [`repos/watchlist.json`](./repos/watchlist.json).

- **Navigation & awesome-lists** — [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code), [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents), [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules), [vijaythecoder/awesome-claude-agents](https://github.com/vijaythecoder/awesome-claude-agents)
- **Mega-collections** — [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates), [affaan-m/ecc](https://github.com/affaan-m/ecc) (**ECC**), [wshobson/agents](https://github.com/wshobson/agents) + [wshobson/commands](https://github.com/wshobson/commands), [dl-ezo/claude-code-sub-agents](https://github.com/dl-ezo/claude-code-sub-agents)
- **Anthropic official** — [anthropics/skills](https://github.com/anthropics/skills), [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook), [anthropics/anthropic-quickstarts](https://github.com/anthropics/anthropic-quickstarts), [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **Hooks & skills** — [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery), [decider/claude-hooks](https://github.com/decider/claude-hooks), [obra/superpowers](https://github.com/obra/superpowers)
- **MCP registries** — [PulseMCP](https://www.pulsemcp.com), [Smithery](https://smithery.ai) ([smithery-ai/registry](https://github.com/smithery-ai/registry)), [Glama](https://glama.ai/mcp), [mcp.so](https://mcp.so)
- **Protocol** — [google/A2A](https://github.com/google/A2A)

Every cataloged entry carries its `source_repo` + `license` provenance back to one of these. Thank you. 🙏

## Contribute

Armory is a registry — add a component via PR or `armory submit`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the one-file format and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Every contribution restocks the armory for every agent.

## License

MIT. Built in the open for the agent community.

<div align="center"><sub>⚔️ Armory · where agents gear up</sub></div>
