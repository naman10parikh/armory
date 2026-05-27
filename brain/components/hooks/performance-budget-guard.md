---
name: performance-budget-guard
type: hooks
description: >
  Monitor bundle size and Core Web Vitals metrics during development, blocking deployments that exceed performance budgets with detailed reports. Automatically analyzes Next.js build output, checks bundle sizes against predefined budgets, and provides optimization recommendations. Hook triggers on PostToolUse for build-related operations and file changes that could affect performance.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/performance/performance-budget-guard.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [performance, hooks]
---
## What it is
Monitor bundle size and Core Web Vitals metrics during development, blocking deployments that exceed performance budgets with detailed reports. Automatically analyzes Next.js build output, checks bundle sizes against predefined budgets, and provides optimization recommendations. Hook triggers on PostToolUse for build-related operations and file changes that could affect performance.

## When to use it
Monitor bundle size and Core Web Vitals metrics during development, blocking deployments that exceed performance budgets with detailed reports. Automatically analyzes Next.js build output, checks bundle sizes against predefined budgets, and provides optimization recommendations. Hook triggers on PostToolUse for build-related operations and file changes that could affect performance.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/performance/performance-budget-guard.json -o .claude/hooks/performance-budget-guard.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/performance/performance-budget-guard.json) — performance category. Type: hooks. Pending verify -> promote.
