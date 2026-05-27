---
name: deep-think
type: skills
description: >
  Invoke when facing a complex or uncertain decision to run multi-modal reasoning — Socratic questioning,
  self-critique, second/third-order effects, and an adversarial devil's-advocate debate before committing.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [socratic-thinking, architect, harness-review]
tags: [reasoning, decision-making, planning, meta]
---

## What it is
A skill that activates a structured deliberation pass for hard decisions. It layers Socratic self-questioning,
explicit self-critique, a second- and third-order effects analysis, and an internal adversarial debate (the agent
argues against its own preferred answer) before producing a recommendation.

## When to use it
When a choice is consequential and the right answer is non-obvious — architecture trade-offs, a risky migration, or
any decision the agent would otherwise make on intuition. The trigger phrase is uncertainty plus stakes.

## How to install / invoke
Add the skill folder (`SKILL.md` + procedure) to `.claude/skills/` and invoke it by name before deciding. It is a
heavier sibling of the lightweight `socratic-thinking` rule.

## Notes
Best reserved for genuinely hard decisions — running it on trivial choices wastes reasoning budget. Pair with
`architect` when the decision is specifically about system design.
