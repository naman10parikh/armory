---
name: ceo-launch
type: skills
description: >
  Invoke to launch an autonomous multi-agent "company" from a single directive — deep-ingest context, match the
  task to a harness, plan in plan-mode, spawn a worker grid, and run a monitoring loop until done.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [fractal-delegation, ceo-launch-grid, recursive-grid, harness-review]
tags: [orchestration, ceo, grid, automation, swarm]
---

## What it is
The single entry-point skill for running a worker company. It performs a deep-ingest boot sequence (reads operating
rules, current state, long-term memory, and learnings), loads a harness registry, accepts a directive or raw voice
dump, enters plan mode to design the company, gets approval, spawns a grid of worker panes, and monitors them.

## When to use it
When a task is large enough to warrant parallel workers with distinct roles (builders, QA, content, research)
rather than a single agent. It is the "one command to run" for orchestrated work.

## How to install / invoke
Add to `.claude/skills/` and invoke with the mission directive. It depends on a grid-orchestration CLI to create and
monitor panes, and a harness registry to match the mission to a role layout.

## Notes
Deep ingest before execution is mandatory — rushing planning is the top cause of wasted worker effort. For tasks
with 4+ independent sub-tracks, it can recurse into sub-companies via `recursive-grid`.
