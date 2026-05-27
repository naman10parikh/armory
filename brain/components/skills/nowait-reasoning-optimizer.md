---
name: nowait-reasoning-optimizer
type: skills
description: >
  Implements the NOWAIT technique for efficient reasoning in R1-style LLMs. Use when optimizing inference of reasoning models (QwQ, DeepSeek-R1, Phi4-Reasoning, Qwen3, Kimi-VL, QvQ), reducing chain-of-thought token usage by 27-51% while preserving accuracy. Triggers on "optimize reasoning", "reduce thinking tokens", "efficient inference", "suppress reflection tokens", or when working with verbose CoT outputs.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/productivity/nowait/SKILL.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [nowait, skills]
---
## What it is
Implements the NOWAIT technique for efficient reasoning in R1-style LLMs. Use when optimizing inference of reasoning models (QwQ, DeepSeek-R1, Phi4-Reasoning, Qwen3, Kimi-VL, QvQ), reducing chain-of-thought token usage by 27-51% while preserving accuracy. Triggers on "optimize reasoning", "reduce thinking tokens", "efficient inference", "suppress reflection tokens", or when working with verbose CoT outputs.

## When to use it
Implements the NOWAIT technique for efficient reasoning in R1-style LLMs. Use when optimizing inference of reasoning models (QwQ, DeepSeek-R1, Phi4-Reasoning, Qwen3, Kimi-VL, QvQ), reducing chain-of-thought token usage by 27-51% while preserving accuracy. Triggers on "optimize reasoning", "reduce thinking tokens", "efficient inference", "suppress reflection tokens", or when working with verbose CoT outputs.

## How to install / invoke
```bash
# Copy the skill into your .claude/skills/ directory
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/skills/productivity/nowait/SKILL.md -o .claude/skills/nowait/SKILL.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/productivity/nowait/SKILL.md) — nowait category. Type: skills. Pending verify -> promote.
