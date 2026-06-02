---
type: moc
title: Armory — Map of Content
created: 2026-05-26
tags: [moc, armory, agent-brain]
---

# 🧠 Armory — Map of Content

The master hub of the agent-native brain. Every component links back here; this note links out to every category. Open `brain/` as an Obsidian vault and this is your entry point — the `related:` fields draw the graph (the synapses) between components.

> *For agents, by agents, of agents.* Each component below is one unit of agent capability — a thing you install into a harness.

## The 12 Categories

- **[[mcps]]** — Model Context Protocol servers, registries, transports, auth patterns
- **[[skills]]** — coding, workflow, domain, and meta skills
- **[[hooks]]** — lifecycle hooks by event and by purpose
- **[[subagents]]** — roles, swarms, and orchestration patterns
- **[[identity]]** — SOUL, persona, brand, and agent-format specs
- **[[memory]]** — bootstrap, compression, and memory layers
- **[[claudemd-rules]]** — CLAUDE.md, AGENTS.md, and rule packs (incl. behavior norms)
- **[[clis-tools]]** — agent toolkits, provisioning CLIs, dev tools
- **[[evals]]** — rubrics, golden tasks, eval harnesses, metrics
- **[[observability]]** — tracing, platforms, dashboards
- **[[infrastructure]]** — sandboxing, browser, deploy, payments rails, tunnels
- **[[workflows]]** — recipes and compositions (hook + MCP + skill + agent chains)

## How the brain stays honest

- **Source of truth:** the markdown files under `components/`. Everything else is generated.
- **`catalog.json`:** computed from these files (counts never hand-typed).
- **Verification:** each component carries `verified_at`; the self-improving loop re-checks staleness.

## Foundational components (the constitution)

- **THE FOUR THINGS** — Think-Before-Coding · Simplicity-First · Surgical-Changes · Goal-Driven-Execution (the behavior norm every coding agent should ingrain first). → `claudemd-rules/karpathy-coding-discipline`

## Related

- [CONTRIBUTING](../CONTRIBUTING.md) — the component template + submission flow
- [README](../README.md) — what Armory is and why it's agent-native
