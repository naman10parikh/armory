---
name: eval-judge
type: subagents
description: >
  LLM judge for plugin quality assessment. Scores skills on triggering accuracy, orchestration fitness, output quality, and scope calibration using anchored rubrics.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/plugin-eval/agents/eval-judge.md
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
`wshobson/agents` sub-agent `eval-judge` (model: sonnet) from the `plugin-eval` plugin. LLM judge for plugin quality assessment. Scores skills on triggering accuracy, orchestration fitness, output quality, and scope calibration using anchored rubrics.

## When to use it
LLM judge for plugin quality assessment. Scores skills on triggering accuracy, orchestration fitness, output quality, and scope calibration using anchored rubrics.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/plugin-eval/agents/eval-judge.md -o .claude/agents/eval-judge.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/plugin-eval/agents/eval-judge.md). Plugin: `plugin-eval`. Pending verify -> promote.
