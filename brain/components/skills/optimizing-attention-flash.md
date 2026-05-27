---
name: optimizing-attention-flash
type: skills
description: >
  Optimizes transformer attention with Flash Attention for 2-4x speedup and 10-20x memory reduction. Use when training/running transformers with long sequences (>512 tokens), encountering GPU memory issues with attention, or need faster inference. Supports PyTorch native SDPA, flash-attn library, H100 FP8, and sliding window attention.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/optimization-flash-attention/SKILL.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [optimization-flash-attention, skills]
---
## What it is
Optimizes transformer attention with Flash Attention for 2-4x speedup and 10-20x memory reduction. Use when training/running transformers with long sequences (>512 tokens), encountering GPU memory issues with attention, or need faster inference. Supports PyTorch native SDPA, flash-attn library, H100 FP8, and sliding window attention.

## When to use it
Optimizes transformer attention with Flash Attention for 2-4x speedup and 10-20x memory reduction. Use when training/running transformers with long sequences (>512 tokens), encountering GPU memory issues with attention, or need faster inference. Supports PyTorch native SDPA, flash-attn library, H100 FP8, and sliding window attention.

## How to install / invoke
```bash
# Copy the skill into your .claude/skills/ directory
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/skills/ai-research/optimization-flash-attention/SKILL.md -o .claude/skills/optimization-flash-attention/SKILL.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/optimization-flash-attention/SKILL.md) — optimization-flash-attention category. Type: skills. Pending verify -> promote.
