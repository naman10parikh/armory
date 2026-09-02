---
name: qa-zero-tolerance
type: claudemd-rules
description: >
  Add to CLAUDE.md to forbid shipping any product, tool, or feature that has not been tested end-to-end as a real
  user — "it compiles" and "tests pass" count for nothing without a fresh install, every feature exercised, and screenshots.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [test-before-build, ralph-loop, playwright-cli]
tags: [qa, testing, quality-gate, user-testing]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A zero-tolerance quality rule: every product, OSS project, agent, article, or feature MUST be tested end-to-end from
the user's perspective before it ships. Any bug found by QA is a blocker. Only an explicit human override ("ship
without testing") bypasses it. In a swarm, a dedicated QA persona runs last and tests the combined output of all workers.

## When to use it
Before declaring anything done or merging anything that a user will touch. The trigger is the temptation to ship on
green CI alone — that is exactly when this rule must fire.

## How to install / invoke
Add the policy to `CLAUDE.md` and make a QA report (test table, bugs found, bugs fixed, screenshots) a required
artifact. Drive the actual testing with a browser skill for UI flows.

## Notes
The minimum checklist: fresh install, structure validation, every feature exercised, edge cases, UX review,
screenshot evidence. "Passes tests" is necessary, never sufficient.
