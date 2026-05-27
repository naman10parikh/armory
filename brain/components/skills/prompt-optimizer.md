---
name: prompt-optimizer
type: skills
description: >
  >- Analyze raw prompts, identify intent and gaps, match ECC components (skills/commands/agents/hooks), and output a ready-to-paste optimized prompt. Advisory role only — never executes the task itself. TRIGGER when: user says "optimize prompt", "improve my prompt", "how to write a prompt for", "h…
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/skills/prompt-optimizer/SKILL.md
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
>- Analyze raw prompts, identify intent and gaps, match ECC components (skills/commands/agents/hooks), and output a ready-to-paste optimized prompt. Advisory role only — never executes the task itself. TRIGGER when: user says "optimize prompt", "improve my prompt", "how to write a prompt for", "help me prompt", "rewrite this prompt", or explicitly asks to enhance prompt quality. Also triggers on Chinese equivalents: "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令". DO NOT TRIGGER when: user wants the task executed directly, or says "just do it" / "直接做". DO NOT TRIGGER when user says "优化代码", "优化性能", "optimize performance", "optimize this code" — those are refactoring/performance tasks, not prompt optimization.

## When to use it
>- Analyze raw prompts, identify intent and gaps, match ECC components (skills/commands/agents/hooks), and output a ready-to-paste optimized prompt. Advisory role only — never executes the task itself. TRIGGER when: user says "optimize prompt", "improve my prompt", "how to write a prompt for", "help me prompt", "rewrite this prompt", or explicitly asks to enhance prompt quality. Also triggers on Chinese equivalents: "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令". DO NOT TRIGGER when: user wants the task executed directly, or says "just do it" / "直接做". DO NOT TRIGGER when user says "优化代码", "优化性能", "optimize performance", "optimize this code" — those are refactoring/performance tasks, not prompt optimization.

## How to install / invoke
Vendored from `affaan-m/ecc` (`skills`). See the source: https://github.com/affaan-m/ecc/blob/main/skills/prompt-optimizer/SKILL.md

## Notes
Ingested from the affaan-m/ecc harness library (MIT). Pending verify → promote.
