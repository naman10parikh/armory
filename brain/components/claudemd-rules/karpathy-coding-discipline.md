---
name: karpathy-coding-discipline
type: claudemd-rules
description: >
  Drop into CLAUDE.md/AGENTS.md as the first behavior norm a coding agent ingrains — think before coding,
  prefer the simplest solution, change only what you own, and execute toward the stated goal.
source_repo: multica-ai/andrej-karpathy-skills
source_url: https://github.com/multica-ai/andrej-karpathy-skills
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 209417
eval_score: null
verified_at: 2026-05-26
related: [socratic-thinking, simplicity-first, surgical-changes, goal-driven-execution]
tags: [discipline, coding, constitution, behavior-norm, four-things]
forks: 21315
pushed_at: "2026-04-20T10:05:04Z"
---

## What it is
THE FOUR THINGS — a four-clause behavioral constitution for any coding agent, distilled from Andrej Karpathy's
working style. (1) **Think Before Coding**: state the plan and the assumptions first. (2) **Simplicity First**:
the simplest solution that works wins; don't gold-plate. (3) **Surgical Changes**: touch only the files you own;
never reformat or "improve" neighbors. (4) **Goal-Driven Execution**: every action moves toward the stated goal,
and you verify the goal is met before declaring done.

## When to use it
Make this the FIRST rule in any agent harness — it is the constitution that governs every other rule. Reach for it
whenever an agent is over-engineering, sprawling across files it doesn't own, or shipping without verifying.

## How to install / invoke
Paste the four clauses near the top of your `CLAUDE.md` (or `AGENTS.md`). Reference it from every worker mission so
sub-agents inherit it. The four clauses are short enough to quote verbatim in a system prompt.

## Notes
This is the behavior-norm layer, not a linter — it shapes how the agent decides, not what the code looks like.
Pairs with `socratic-thinking` (debate before building) and `test-before-build` (verify the goal as a user).
