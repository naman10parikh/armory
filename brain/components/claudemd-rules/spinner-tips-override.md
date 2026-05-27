---
name: spinner-tips-override
type: claudemd-rules
description: >
  Customize the spinner tips shown while Claude is thinking. Replace the example tip string in the 'tips' array with your own custom messages. Set 'excludeDefault: true' to show only your custom tips, or 'false' to mix them with the built-in ones.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/spinner-tips-override.json
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
Customize the spinner tips shown while Claude is thinking. Replace the example tip string in the 'tips' array with your own custom messages. Set 'excludeDefault: true' to show only your custom tips, or 'false' to mix them with the built-in ones.

## When to use it
Customize the spinner tips shown while Claude is thinking. Replace the example tip string in the 'tips' array with your own custom messages. Set 'excludeDefault: true' to show only your custom tips, or 'false' to mix them with the built-in ones.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/global/spinner-tips-override.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/spinner-tips-override.json) — global category. Type: claudemd-rules. Pending verify -> promote.
