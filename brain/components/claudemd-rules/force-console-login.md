---
name: force-console-login
type: claudemd-rules
description: >
  Restrict authentication to Anthropic Console accounts only. This ensures all usage is billed through the API billing system and prevents access via Claude.ai accounts, ideal for enterprise environments with centralized billing.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/force-console-login.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [authentication, claudemd-rules]
---
## What it is
Restrict authentication to Anthropic Console accounts only. This ensures all usage is billed through the API billing system and prevents access via Claude.ai accounts, ideal for enterprise environments with centralized billing.

## When to use it
Restrict authentication to Anthropic Console accounts only. This ensures all usage is billed through the API billing system and prevents access via Claude.ai accounts, ideal for enterprise environments with centralized billing.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/authentication/force-console-login.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/force-console-login.json) — authentication category. Type: claudemd-rules. Pending verify -> promote.
