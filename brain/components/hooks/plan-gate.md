---
name: plan-gate
type: hooks
description: >
  Planning gate that warns when editing production code without an approved specification. Checks for recent .spec.md files in the project directory (last 14 days). If no spec is found, shows a warning suggesting to create one first. Non-blocking (exit 0) — acts as a reminder, not a hard gate. Supports 16 programming languages. Part of the Spec-Driven Development (SDD) methodology where every implementation should be backed by an approved specification.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/plan-gate.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [quality-gates, hooks]
---
## What it is
Planning gate that warns when editing production code without an approved specification. Checks for recent .spec.md files in the project directory (last 14 days). If no spec is found, shows a warning suggesting to create one first. Non-blocking (exit 0) — acts as a reminder, not a hard gate. Supports 16 programming languages. Part of the Spec-Driven Development (SDD) methodology where every implementation should be backed by an approved specification.

## When to use it
Planning gate that warns when editing production code without an approved specification. Checks for recent .spec.md files in the project directory (last 14 days). If no spec is found, shows a warning suggesting to create one first. Non-blocking (exit 0) — acts as a reminder, not a hard gate. Supports 16 programming languages. Part of the Spec-Driven Development (SDD) methodology where every implementation should be backed by an approved specification.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/quality-gates/plan-gate.json -o .claude/hooks/plan-gate.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/plan-gate.json) — quality-gates category. Type: hooks. Pending verify -> promote.
