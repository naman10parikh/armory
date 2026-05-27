---
name: bash-timeouts
type: claudemd-rules
description: >
  Configure timeout settings for bash command execution. Prevents long-running commands from hanging indefinitely while allowing sufficient time for complex operations like builds and deployments.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/environment/bash-timeouts.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [environment, claudemd-rules]
---
## What it is
Configure timeout settings for bash command execution. Prevents long-running commands from hanging indefinitely while allowing sufficient time for complex operations like builds and deployments.

## When to use it
Configure timeout settings for bash command execution. Prevents long-running commands from hanging indefinitely while allowing sufficient time for complex operations like builds and deployments.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/environment/bash-timeouts.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/environment/bash-timeouts.json) — environment category. Type: claudemd-rules. Pending verify -> promote.
