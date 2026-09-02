---
name: session-start-context
type: hooks
description: >
  Wire to the SessionStart event to auto-load operating context at the top of every session — the rules, current
  state, and long-term memory — and to surface unprocessed inbox items, so the agent boots fully armed, not cold.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [pre-compact-memory-flush, stop-verify, four-layer-memory]
tags: [hook, sessionstart, context-loading, boot, deep-ingest]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A SessionStart hook that performs the boot sequence. It injects the operating rules, the current-state doc, and
long-term memory into the new session's context, runs a memory/health check, and flags any unprocessed inbox items
to handle first. It is how a fresh session starts deeply ingested instead of amnesiac.

## When to use it
In every session of a persistent agent, and especially as the landing point after a forced migration — the new
session reads the handoff the PreCompact hook wrote. The trigger is structural — it fires on session start.

## How to install / invoke
Register a command hook on `SessionStart` pointing at the context-load script. Combine with a PreCompact flush and a
Stop-verify hook so handoff state is always written before it's read here.

## Notes
Deep ingest before execution is the top defense against wasted work. This hook makes "read everything first"
automatic rather than a discipline the agent must remember.
