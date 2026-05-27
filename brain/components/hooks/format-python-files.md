---
name: format-python-files
type: hooks
description: >
  Automatically format Python files after any Edit operation using black formatter. This hook runs 'black' on any .py file that Claude modifies, ensuring consistent Python code formatting. Requires black to be installed ('pip install black'). The command includes error suppression (2>/dev/null || true) so it won't fail if black is not installed.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/format-python-files.json
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
Automatically format Python files after any Edit operation using black formatter. This hook runs 'black' on any .py file that Claude modifies, ensuring consistent Python code formatting. Requires black to be installed ('pip install black'). The command includes error suppression (2>/dev/null || true) so it won't fail if black is not installed.

## When to use it
Automatically format Python files after any Edit operation using black formatter. This hook runs 'black' on any .py file that Claude modifies, ensuring consistent Python code formatting. Requires black to be installed ('pip install black'). The command includes error suppression (2>/dev/null || true) so it won't fail if black is not installed.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/post-tool/format-python-files.json -o .claude/hooks/format-python-files.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/format-python-files.json) — post-tool category. Type: hooks. Pending verify -> promote.
