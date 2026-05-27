---
name: vercel-error-alert-system
type: claudemd-rules
description: >
  Intelligent error monitoring system that tracks deployment failures and build issues. Automatically sends desktop notifications when errors are detected and maintains error count tracking. Features building status monitoring and provides immediate alerts for deployment problems, helping you catch issues quickly. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard. Desktop notifications work on macOS.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-error-alert-system.json
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
Intelligent error monitoring system that tracks deployment failures and build issues. Automatically sends desktop notifications when errors are detected and maintains error count tracking. Features building status monitoring and provides immediate alerts for deployment problems, helping you catch issues quickly. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard. Desktop notifications work on macOS.

## When to use it
Intelligent error monitoring system that tracks deployment failures and build issues. Automatically sends desktop notifications when errors are detected and maintains error count tracking. Features building status monitoring and provides immediate alerts for deployment problems, helping you catch issues quickly. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard. Desktop notifications work on macOS.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/vercel-error-alert-system.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-error-alert-system.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
