---
name: claude-harness
type: clis-tools
description: >
  Use to scaffold a complete agent-native harness — the CLAUDE.md, rules, skills, hooks, sub-agents, and memory
  layout — so a new project starts with the full discipline stack instead of an empty repo.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [karpathy-coding-discipline, skillsmith, harness-review, agent-file-format]
tags: [harness, scaffold, bootstrap, claude-md, agent-native]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A CLI that scaffolds the whole agent-native harness for a project: the operating rules (CLAUDE.md / AGENTS.md), a
rules directory, a skills directory, lifecycle hooks, sub-agent definitions, and the memory layout. It is the
"whole harness in a box" — the assembled form of every other component in this brain.

## When to use it
When starting a new agent-native project and you want the proven discipline stack from day one — not an empty repo
you'll bolt rules onto later. The trigger is "set up the harness for this repo."

## How to install / invoke
Install globally and run it in a new project directory to lay down the harness scaffold. Then prune to what the
project needs and run a harness review to keep it lean.

## Notes
The harness is the product. Start from the full scaffold, then apply Simplicity-First — keep the components that
earn their place and remove the rest. Pair with `harness-review` and `agentbench` to keep it healthy and scored.
