---
name: run-tests-after-changes
type: hooks
description: >
  Automatically run quick tests after code modifications to ensure nothing breaks. This hook executes 'npm run test:quick' silently after any Edit operation and provides feedback on test status. Helps catch breaking changes immediately during development. Only runs if package.json exists and the test:quick script is available.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/run-tests-after-changes.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [post-tool, hooks]
---
## What it is
Automatically run quick tests after code modifications to ensure nothing breaks. This hook executes 'npm run test:quick' silently after any Edit operation and provides feedback on test status. Helps catch breaking changes immediately during development. Only runs if package.json exists and the test:quick script is available.

## When to use it
Automatically run quick tests after code modifications to ensure nothing breaks. This hook executes 'npm run test:quick' silently after any Edit operation and provides feedback on test status. Helps catch breaking changes immediately during development. Only runs if package.json exists and the test:quick script is available.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/post-tool/run-tests-after-changes.json -o .claude/hooks/run-tests-after-changes.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/run-tests-after-changes.json) — post-tool category. Type: hooks. Pending verify -> promote.
