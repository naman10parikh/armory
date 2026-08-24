---
name: agentgrid
type: clis-tools
description: >
  Use to run many agents in parallel as a visible grid of terminal panes — create an NxM layout, name and monitor
  panes, broadcast or target prompts, and save/restore whole company configurations.
source_repo: naman10parikh/agentgrid
source_url: https://github.com/naman10parikh/agentgrid
license: MIT
cli_compat: [claude, codex, opencode]
maturity: stable
stars: 8
eval_score: null
verified_at: 2026-05-26
related: [agentswarm, ceo-launch, ceo-launch-grid, recursive-grid]
tags: [orchestration, grid, tmux, parallelism, dispatch]
---

## What it is
A CLI for multi-pane agent orchestration. It creates a visible grid of agent panes (an NxM layout), labels each
pane, reports health (working/waiting/done/idle), broadcasts a prompt to all panes or sends to one, equalizes
sizes, and saves/restores a named company configuration for repeatable launches.

## When to use it
When a job is large enough to split across several agents working at once — a builder/QA/content/research company —
and you want to see and steer them. The trigger is "spawn a grid" or "run these workers in parallel."

## How to install / invoke
Install the package globally and create a grid (e.g. `agentgrid 2x3 "claude ..."`), then `agentgrid status` to
monitor and `agentgrid save <name>` to persist the layout. It is the dispatch backbone for a CEO-launch workflow.

## Notes
Keep grids visible to the operator rather than headless, and validate the layout after spawn (right pane count,
named panes, no idle slots). Every pane should always have useful work.
