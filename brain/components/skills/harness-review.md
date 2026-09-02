---
name: harness-review
type: skills
description: >
  Invoke to audit an agent harness (its skills, rules, hooks, MCPs, and templates) for quality, token efficiency,
  and correctness — surfacing gaps, conflicts, and over-weight components before they cost you.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [skill-creator, harness-rubric, agentbench, deep-think]
tags: [meta, audit, harness-engineering, token-efficiency]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A skill grounded in harness-engineering research that scans a harness end-to-end. It inventories skills, rules,
hooks, MCPs, and templates; flags missing capabilities, conflicting rules, and components that burn more tokens than
they justify; and recommends consolidations.

## When to use it
Periodically (e.g. weekly) to keep a growing harness healthy, and before relying on it for a high-stakes run. The
trigger is harness sprawl — too many skills, overlapping rules, or unexplained token cost.

## How to install / invoke
Add to `.claude/skills/` and invoke against a harness directory. Pair with an eval rubric to score the harness
quantitatively and with `skill-creator` to fill the gaps it finds.

## Notes
Remember "Agent = Model + Harness" — if you are not improving the model, you are improving the harness, and this is
how you keep that surface lean and correct.
