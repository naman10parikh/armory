---
type: moc
title: Hooks — category hub
created: 2026-05-26
tags: [moc, hooks]
---

# hooks

Lifecycle hooks the harness (not the model) executes at defined events — session start, before/after a tool call,
before compaction, on stop, on session end. Hooks are how you enforce behavior deterministically: a rule the model
might forget, a hook always runs. They guard dangerous commands, verify deploys, flush memory before context is
lost, and force clean session migration. These components cover the load-bearing hooks of a production harness, keyed
by their event.

## Components

- [[pre-compact-memory-flush]] — write handoff + anchor state before compaction
- [[stop-verify]] — force clean migration at the compaction threshold
- [[post-push-verify]] — verify the deploy after every git push
- [[block-dangerous-commands]] — block destructive shell commands
- [[enforce-agentgrid]] — steer grid ops to the safe tool
- [[session-start-context]] — load operating context at session start
