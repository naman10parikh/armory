---
name: skill-creator
type: skills
description: >
  Invoke to turn a repeated pattern, approved workflow, or recurring preference into a new reusable skill —
  generates the SKILL.md template, picks the model tier per step, and writes the trigger description.
source_repo: naman10parikh/skillsmith
source_url: https://github.com/naman10parikh/skillsmith
license: MIT
cli_compat: [claude]
maturity: stable
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [self-improve, harness-review, skillsmith]
tags: [meta, skill-authoring, self-improvement, autolab]
forks: 0
pushed_at: "2026-06-10T03:24:43Z"
---

## What it is
The meta-skill that makes a harness self-improving. It generates a well-formed skill from a described pattern:
a `SKILL.md` with a WHEN-to-use trigger, a step-by-step procedure, model-tier hints per step, and an expected
output format. It is how a harness grows new capabilities without hand-authoring boilerplate.

## When to use it
When you notice the same multi-step procedure being done by hand repeatedly, or when a session surfaces a pattern
worth codifying. The trigger is "we keep doing this — make it a skill."

## How to install / invoke
Add to `.claude/skills/` and invoke with a description of the pattern to capture. It pairs with a
self-improvement skill that detects the patterns automatically from session logs.

## Notes
Core to a nightly self-improvement loop: detect a pattern → author a skill → the harness is permanently better.
The standalone CLI form is published separately for skill create/test/share.
