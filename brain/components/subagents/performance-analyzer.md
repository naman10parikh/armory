---
name: performance-analyzer
type: subagents
description: >
  Spawn when code is slow or before a performance-sensitive release — it profiles the code path, identifies
  bottlenecks, and recommends concrete optimizations, reporting findings without rewriting the code.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [code-reviewer, architect]
tags: [performance, profiling, optimization, sub-agent]
---

## What it is
A sub-agent persona focused on performance. It analyzes a code path for bottlenecks — N+1 queries, unbatched I/O,
unnecessary re-renders, hot loops — and returns prioritized optimization recommendations. It diagnoses; the parent
implements the fix.

## When to use it
When something is measurably slow, or before shipping a path that must scale. The trigger is "this is too slow" or
"will this hold up under load?"

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it with the slow path and any profiling data. Feed its
recommendations back to the implementing worker.

## Notes
Diagnosis without measurement is guessing — give it real numbers where possible. Pair with `architect` when the
bottleneck is structural rather than local.
