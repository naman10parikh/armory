---
name: format-javascript-files
type: hooks
description: >
  Automatically format JavaScript/TypeScript files after any Edit operation using prettier. This hook runs 'npx prettier --write' on any .js, .ts, .jsx, or .tsx file that Claude modifies, ensuring consistent code formatting. Uses npx so prettier doesn't need to be globally installed. Includes error suppression so it won't fail if prettier is not available.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/format-javascript-files.json
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
Automatically format JavaScript/TypeScript files after any Edit operation using prettier. This hook runs 'npx prettier --write' on any .js, .ts, .jsx, or .tsx file that Claude modifies, ensuring consistent code formatting. Uses npx so prettier doesn't need to be globally installed. Includes error suppression so it won't fail if prettier is not available.

## When to use it
Automatically format JavaScript/TypeScript files after any Edit operation using prettier. This hook runs 'npx prettier --write' on any .js, .ts, .jsx, or .tsx file that Claude modifies, ensuring consistent code formatting. Uses npx so prettier doesn't need to be globally installed. Includes error suppression so it won't fail if prettier is not available.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/post-tool/format-javascript-files.json -o .claude/hooks/format-javascript-files.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/format-javascript-files.json) — post-tool category. Type: hooks. Pending verify -> promote.
