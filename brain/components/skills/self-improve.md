---
name: self-improve
type: skills
description: >
  Invoke after a session to mine its logs for repeated patterns, forgotten rules, and backtracking moments, then
  auto-update CLAUDE.md, skills, and rules so the same mistake never happens twice ("correct once, never again").
source_repo: naman10parikh/skillsmith
source_url: https://github.com/naman10parikh/skillsmith
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [skill-creator, error-post-mortem, harness-review]
tags: [meta, self-improvement, learning, autolab]
---

## What it is
A reflection skill that reads past session work to find repeated patterns, rules the agent forgot to follow, and
moments where it backtracked. It then proposes and applies updates to the harness — new rules, skill tweaks,
CLAUDE.md edits — so the harness gets measurably better after every session.

## When to use it
At the end of a session, or after any session that contained a notable mistake or a newly discovered pattern. The
trigger is "we learned something — make it stick."

## How to install / invoke
Add to `.claude/skills/` and invoke during a wrap-up routine. It pairs with `skill-creator` (to author new skills)
and `error-post-mortem` (to capture the prevention rule).

## Notes
This is the engine of a nightly self-improvement loop: the harness that updates itself is the product. Keep the
edits surgical — append learnings, don't rewrite history.
