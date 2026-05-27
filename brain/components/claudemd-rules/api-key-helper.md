---
name: api-key-helper
type: claudemd-rules
description: >
  Configure a custom script to dynamically generate authentication tokens. The script will be executed to obtain fresh API keys, useful for environments with rotating credentials or temporary access tokens. TTL is set to 1 hour (3600000ms).
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/api-key-helper.json
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
Configure a custom script to dynamically generate authentication tokens. The script will be executed to obtain fresh API keys, useful for environments with rotating credentials or temporary access tokens. TTL is set to 1 hour (3600000ms).

## When to use it
Configure a custom script to dynamically generate authentication tokens. The script will be executed to obtain fresh API keys, useful for environments with rotating credentials or temporary access tokens. TTL is set to 1 hour (3600000ms).

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/authentication/api-key-helper.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/authentication/api-key-helper.json) — authentication category. Type: claudemd-rules. Pending verify -> promote.
