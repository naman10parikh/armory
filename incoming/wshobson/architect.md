---
name: architect
type: subagents
description: >
  Architect agent. Reads orchestrator-output.md, AGENTS.md, and project-doc.md to produce a numbered step-by-step implementation plan. Pauses for human approval before implementation begins.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/architect.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, subagents]
---
## What it is
`wshobson/agents` sub-agent `architect` (model: inherit) from the `ship-mate` plugin. Architect agent. Reads orchestrator-output.md, AGENTS.md, and project-doc.md to produce a numbered step-by-step implementation plan. Pauses for human approval before implementation begins.

## When to use it
Architect agent. Reads orchestrator-output.md, AGENTS.md, and project-doc.md to produce a numbered step-by-step implementation plan. Pauses for human approval before implementation begins.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/architect.md -o .claude/agents/architect.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/architect.md). Plugin: `ship-mate`. Pending verify -> promote.
