---
name: pre-compact-memory-flush
type: hooks
description: >
  Wire to the PreCompact event to flush state before context is summarized away — write a handoff doc, an anchor
  state, a daily log entry, and a backup — so nothing critical is lost when the window compacts.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [stop-verify, session-start-context, four-layer-memory]
tags: [hook, precompact, memory, handoff, persistence]
---

## What it is
A PreCompact hook. Just before the model compacts its context (losing 70-80% of detail in one pass), it writes a
tight handoff document (active task, files changed, decisions, next actions), an anchor-state file (big picture +
next action), a daily-log entry, and a backup. It turns an information-destroying event into a checkpoint.

## When to use it
In any long-running agent where context will eventually compact. The trigger is structural — you install it once and
it fires automatically at every compaction.

## How to install / invoke
Register a command hook on the `PreCompact` event in your harness settings, pointing at the flush script. It runs
unconditionally before compaction.

## Notes
Compaction is lossy and irreversible — the only defense is writing state to disk first. Pair with a stop hook that
forces migration to a fresh session so the agent doesn't keep degrading.
