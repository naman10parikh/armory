---
name: test-writer
type: subagents
description: >
  Spawn to generate a test suite for new or under-covered code — it produces unit tests with edge-case coverage in
  the project's test framework, so the parent can run them as a regression gate.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [code-reviewer, qa-zero-tolerance, golden-tasks]
tags: [testing, test-generation, coverage, sub-agent]
forks: 0
pushed_at: "2026-06-10T03:53:18Z"
---

## What it is
A sub-agent persona that writes tests. Given a module or function, it generates a suite covering the happy path and
edge cases in the project's framework (e.g. Vitest), returning runnable test files. The parent integrates and runs them.

## When to use it
When new code lacks tests, or when a bug reveals a gap the existing suite missed. The trigger is "we need coverage
here before we trust it."

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it with the target module. Run the generated tests as part
of the build before signaling done.

## Notes
Generated tests are a starting point, not gospel — the parent should sanity-check that they assert real behavior.
Complements `qa-zero-tolerance`, which demands user-level testing on top of unit coverage.
