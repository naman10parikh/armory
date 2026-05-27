---
name: command-statusline
type: claudemd-rules
description: >
  Configure a custom status line using a shell command that receives session context via JSON stdin. The script can display model name, current directory, git branch, or any dynamic information. Create your script at ~/.claude/statusline.sh and make it executable.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/command-statusline.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [statusline, claudemd-rules]
---
## What it is
Configure a custom status line using a shell command that receives session context via JSON stdin. The script can display model name, current directory, git branch, or any dynamic information. Create your script at ~/.claude/statusline.sh and make it executable.

## When to use it
Configure a custom status line using a shell command that receives session context via JSON stdin. The script can display model name, current directory, git branch, or any dynamic information. Create your script at ~/.claude/statusline.sh and make it executable.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/command-statusline.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/command-statusline.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
