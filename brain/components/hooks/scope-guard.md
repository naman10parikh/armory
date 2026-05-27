---
name: scope-guard
type: hooks
description: >
  Scope guard that detects files modified outside the declared scope of a specification. When a .spec.md file contains a 'Files to Create/Modify' section, this hook compares git-modified files against the declared list. Files outside scope trigger a warning (non-blocking). Automatically excludes test files, config files, infrastructure files, and documentation. Essential for Spec-Driven Development to prevent scope creep during implementation.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/scope-guard.json
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
Scope guard that detects files modified outside the declared scope of a specification. When a .spec.md file contains a 'Files to Create/Modify' section, this hook compares git-modified files against the declared list. Files outside scope trigger a warning (non-blocking). Automatically excludes test files, config files, infrastructure files, and documentation. Essential for Spec-Driven Development to prevent scope creep during implementation.

## When to use it
Scope guard that detects files modified outside the declared scope of a specification. When a .spec.md file contains a 'Files to Create/Modify' section, this hook compares git-modified files against the declared list. Files outside scope trigger a warning (non-blocking). Automatically excludes test files, config files, infrastructure files, and documentation. Essential for Spec-Driven Development to prevent scope creep during implementation.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/quality-gates/scope-guard.json -o .claude/hooks/scope-guard.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/scope-guard.json) — quality-gates category. Type: hooks. Pending verify -> promote.
