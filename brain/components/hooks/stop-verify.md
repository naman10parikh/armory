---
name: stop-verify
type: hooks
description: >
  Wire to the Stop event to force a clean session migration once context has degraded — at the compaction
  threshold it writes a migration marker and exits so a fresh session can resume with full context, not a degraded one.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [pre-compact-memory-flush, session-start-context]
tags: [hook, stop, migration, context-health, auto-switch]
---

## What it is
A Stop hook that enforces context health. When compaction count crosses a threshold (quality degrades sharply after
the first compaction), it writes a migration-pending marker and exits cleanly, so an outer session-loop can start a
fresh agent with full context re-injected rather than letting the current one keep working in a degraded state.

## When to use it
In autonomous and overnight runs where an agent would otherwise grind on past the point its context is reliable.
The trigger is structural — it fires on every stop and decides whether to force migration.

## How to install / invoke
Register a command hook on the `Stop` event pointing at the verify script, and run the agent inside a session-loop
wrapper that reads the migration marker and restarts.

## Notes
The hard rule it implements: after one compaction, stop and migrate. Pair with the PreCompact flush so the handoff
the new session reads is already written.
