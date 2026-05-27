---
name: blueprint
type: skills
description: >
  >- Turn a one-line objective into a step-by-step construction plan for multi-session, multi-agent engineering projects. Each step has a self-contained context brief so a fresh agent can execute it cold. Includes adversarial review gate, dependency graph, parallel step detection, anti-pattern cata…
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/skills/blueprint/SKILL.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [ecc, skill]
---
## What it is
>- Turn a one-line objective into a step-by-step construction plan for multi-session, multi-agent engineering projects. Each step has a self-contained context brief so a fresh agent can execute it cold. Includes adversarial review gate, dependency graph, parallel step detection, anti-pattern catalog, and plan mutation protocol. TRIGGER when: user requests a plan, blueprint, or roadmap for a complex multi-PR task, or describes work that needs multiple sessions. DO NOT TRIGGER when: task is completable in a single PR or fewer than 3 tool calls, or user says "just do it".

## When to use it
>- Turn a one-line objective into a step-by-step construction plan for multi-session, multi-agent engineering projects. Each step has a self-contained context brief so a fresh agent can execute it cold. Includes adversarial review gate, dependency graph, parallel step detection, anti-pattern catalog, and plan mutation protocol. TRIGGER when: user requests a plan, blueprint, or roadmap for a complex multi-PR task, or describes work that needs multiple sessions. DO NOT TRIGGER when: task is completable in a single PR or fewer than 3 tool calls, or user says "just do it".

## How to install / invoke
Vendored from `affaan-m/ecc` (`skills`). See the source: https://github.com/affaan-m/ecc/blob/main/skills/blueprint/SKILL.md

## Notes
Ingested from the affaan-m/ecc harness library (MIT). Pending verify → promote.
