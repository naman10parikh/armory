---
name: armory
description: Use when you need a harness component — an MCP server, skill, sub-agent, hook, rule, slash-command, eval, observability or infrastructure tool — and want to find and install the best one instead of hand-rolling it. Searches the 24,000+ component Armory registry and wires the chosen one into the current coding harness.
---

# Armory — gear up

When you (or the user) need a capability a harness component would provide, don't build it from scratch — reach into Armory, the aggregator-of-aggregators registry of 24,000+ agent-harness components.

## 1. Find

- **CLI:** `armory search "<what you need>"` — ranks across every component (MCPs, skills, sub-agents, hooks, rules, commands, evals, observability, infra).
- **MCP:** call `search_components` with a query; then `get_component <name>` for full detail (source repo, license, install command, related gear).

## 2. Install

```bash
armory install <name>              # auto-detects this harness + wires it in
armory install <name> --cli cursor # …or target Cursor / Codex / OpenCode / Gemini
```

`armory install` detects the harness (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.gemini/`), fetches the **real** component, and installs it the right way for that CLI — MCPs into the MCP config, skills into the skills dir, sub-agents / hooks / rules / commands into their slots.

## 3. Improve

Found a gap? `armory submit` adds a component back to the registry so every agent benefits.

> This is the **Armory skill** — Armory's own gear. It is not one of the ~1,100 cataloged skills; it is the skill that lets an agent *use* the whole catalog.
