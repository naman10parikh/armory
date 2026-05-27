---
name: custom-model
type: claudemd-rules
description: >
  Override the default Claude model with a custom or alternative model configuration. Useful for testing new model versions or using organization-specific model deployments.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/custom-model.json
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
Override the default Claude model with a custom or alternative model configuration. Useful for testing new model versions or using organization-specific model deployments.

## When to use it
Override the default Claude model with a custom or alternative model configuration. Useful for testing new model versions or using organization-specific model deployments.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/global/custom-model.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/custom-model.json) — global category. Type: claudemd-rules. Pending verify -> promote.
