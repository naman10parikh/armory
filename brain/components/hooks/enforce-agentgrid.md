---
name: enforce-agentgrid
type: hooks
description: >
  Wire to the PreToolUse(Bash) event to steer grid operations toward the safe orchestration tool — warn on raw
  tmux use and hard-block focus-stealing commands — so multi-agent orchestration stays consistent and non-disruptive.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [block-dangerous-commands, agentgrid]
tags: [hook, pretooluse, orchestration, tmux, guardrail]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A PreToolUse hook matched to Bash that governs grid operations. It warns when the agent reaches for raw `tmux`
instead of the dedicated orchestration CLI, and hard-blocks the specific commands that would steal the operator's
focus (like selecting a pane). It keeps a multi-agent session predictable and the operator in control.

## When to use it
When running grid/swarm orchestration where ad-hoc terminal manipulation would disrupt the operator or diverge from
the managed tooling. The trigger is structural — it fires before Bash calls and nudges or blocks.

## How to install / invoke
Register a command hook on `PreToolUse` with a Bash matcher, pointing at the enforcement script. It allows most
tmux fallbacks (reading panes, sending keys) but blocks focus theft.

## Notes
Prefer the managed tool; allow tmux as a documented fallback; block only what disrupts the human. Pair with the
orchestration CLI itself so the safe path is always available.
