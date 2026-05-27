---
name: force-claudeai-login
type: claudemd-rules
description: >
  Restrict authentication to Claude.ai accounts only. This prevents users from logging in with Anthropic Console accounts, ensuring all access goes through the Claude.ai platform for consistent user experience and billing.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/force-claudeai-login.json
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
Restrict authentication to Claude.ai accounts only. This prevents users from logging in with Anthropic Console accounts, ensuring all access goes through the Claude.ai platform for consistent user experience and billing.

## When to use it
Restrict authentication to Claude.ai accounts only. This prevents users from logging in with Anthropic Console accounts, ensuring all access goes through the Claude.ai platform for consistent user experience and billing.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/authentication/force-claudeai-login.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/force-claudeai-login.json) — authentication category. Type: claudemd-rules. Pending verify -> promote.
