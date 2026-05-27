# incoming/wshobson — sub-agent seeds (wshobson/agents)

**Provenance:** [`wshobson/agents`](https://github.com/wshobson/agents) — a large
curated collection of Claude Code sub-agents, organized into plugins under
`plugins/<plugin>/agents/<name>.md`. Cloned `--depth 1` from `main`. 191 unique
agent definitions across 77 plugins were parsed; 46 representative agents were
selected via round-robin across plugins (one per plugin, richest description
first) to maximize domain coverage. Curated, not exhaustive — quality over volume.

**Date seeded:** 2026-05-26
**Category:** `subagents`
**License:** MIT (Copyright (c) 2024 Seth Hobson)
**Count:** 46 stubs

**Status:** pending verify → promote. These are review-queue stubs. Before
promotion to `brain/components/subagents/`, each needs: `source_url` resolves to
the live agent file, and the install/copy command verified.

Each stub's `description` is the agent's own frontmatter `description` (the
WHEN-to-use routing hint the author wrote), and `source_url` deep-links to the
exact agent file in the repo. The `model` assignment from the source frontmatter
is preserved in the body.
