---
name: setup-2
type: workflows
description: >
  Initialises the ShipMate pipeline in the current project. Creates the stories folder, sets up the pipeline state directory, and runs the initial codebase scan to generate project-doc.md and AGENTS.md.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/commands/setup.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, workflows]
---
## What it is
`wshobson/agents` workflow `setup` from the `ship-mate` plugin. Initialises the ShipMate pipeline in the current project. Creates the stories folder, sets up the pipeline state directory, and runs the initial codebase scan to generate project-doc.md and AGENTS.md.

## When to use it
Initialises the ShipMate pipeline in the current project. Creates the stories folder, sets up the pipeline state directory, and runs the initial codebase scan to generate project-doc.md and AGENTS.md.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/commands/setup.md -o .claude/commands/setup.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/commands/setup.md). Plugin: `ship-mate`. Pending verify -> promote.
