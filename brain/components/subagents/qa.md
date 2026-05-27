---
name: qa
type: subagents
description: >
  QA Agent. Tests all acceptance criteria and edge cases from orchestrator-output.md. Generates a structured qa-report.md with pass/fail per criterion and bug triage. Loops back to implement if bugs found (max 2 iterations).
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/qa.md
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
`wshobson/agents` sub-agent `qa` (model: sonnet) from the `ship-mate` plugin. QA Agent. Tests all acceptance criteria and edge cases from orchestrator-output.md. Generates a structured qa-report.md with pass/fail per criterion and bug triage. Loops back to implement if bugs found (max 2 iterations).

## When to use it
QA Agent. Tests all acceptance criteria and edge cases from orchestrator-output.md. Generates a structured qa-report.md with pass/fail per criterion and bug triage. Loops back to implement if bugs found (max 2 iterations).

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/qa.md -o .claude/agents/qa.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/qa.md). Plugin: `ship-mate`. Pending verify -> promote.
