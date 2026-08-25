---
name: agentswarm
type: clis-tools
description: >
  Use to orchestrate a swarm of sub-agents under a CEO pattern — break a mission into roles, dispatch them, and
  coordinate via signal files, when one agent isn't enough but a full visible grid is overkill.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [agentgrid, ceo-launch, research-agent, recursive-grid]
tags: [orchestration, swarm, sub-agents, dispatch, ceo]
---

## What it is
A CLI for CEO-style sub-agent orchestration. It decomposes a mission into worker roles, dispatches them, and
coordinates completion through a signal-file protocol (done / needs-qa / migrating). It is the dispatch primitive
for fan-out work that coordinates via files rather than a live terminal grid.

## When to use it
When a mission has several independent sub-tasks that benefit from parallel workers, and you want programmatic
coordination via signals. The trigger is "split this into workers and coordinate them."

## How to install / invoke
Install globally and invoke with a mission to decompose into roles. Workers signal completion to a shared signal
directory the orchestrator polls.

## Notes
Pair with `agentgrid` when you also want the swarm to be visible. Follow the same-worker rule for follow-ups: route
a regression back to the worker that already has context rather than broadcasting to the whole swarm.
