---
name: aws-credentials
type: claudemd-rules
description: >
  Configure AWS credential management for Bedrock integration. Set up custom scripts for credential refresh and export, useful for environments with rotating AWS credentials or SSO integration.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/aws-credentials.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [global, claudemd-rules]
---
## What it is
Configure AWS credential management for Bedrock integration. Set up custom scripts for credential refresh and export, useful for environments with rotating AWS credentials or SSO integration.

## When to use it
Configure AWS credential management for Bedrock integration. Set up custom scripts for credential refresh and export, useful for environments with rotating AWS credentials or SSO integration.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/global/aws-credentials.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/aws-credentials.json) — global category. Type: claudemd-rules. Pending verify -> promote.
