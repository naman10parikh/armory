---
name: research-agent
type: subagents
description: >
  Spawn to do deep background research without polluting the parent's context — it web-searches, reads sources, and
  synthesizes findings into a tight summary, keeping its own large context budget separate from the main thread.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [troubleshoot, architect, resource-integration-pipeline]
tags: [research, web-search, synthesis, sub-agent, context-protection]
---

## What it is
A sub-agent persona for deep research. It searches the web, reads documents, and synthesizes the results into a
concise brief for the parent. Its key value is context isolation — the raw research happens in the sub-agent's own
window, so only the distilled summary returns to the main thread.

## When to use it
When a decision needs current external information (SOTA, competitive landscape, library behavior) and reading it
all inline would blow the parent's context. The trigger is "go find out X and report back."

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it with a focused question. Keep each spawn tightly scoped —
a couple of sources, a bounded word count — so it returns fast and stays within budget.

## Notes
Sub-agents research and plan; the parent implements. Don't over-fan-out — a small number of well-scoped research
agents beats a large swarm that exhausts the budget.
