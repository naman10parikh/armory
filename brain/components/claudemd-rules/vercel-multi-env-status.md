---
name: vercel-multi-env-status
type: claudemd-rules
description: >
  Monitors both production and preview environments simultaneously with color-coded status indicators. Perfect for teams managing multiple deployment targets. Shows real-time status of your latest production and preview deployments with green/yellow/red indicators for quick visual assessment. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-multi-env-status.json
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
Monitors both production and preview environments simultaneously with color-coded status indicators. Perfect for teams managing multiple deployment targets. Shows real-time status of your latest production and preview deployments with green/yellow/red indicators for quick visual assessment. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.

## When to use it
Monitors both production and preview environments simultaneously with color-coded status indicators. Perfect for teams managing multiple deployment targets. Shows real-time status of your latest production and preview deployments with green/yellow/red indicators for quick visual assessment. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/vercel-multi-env-status.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-multi-env-status.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
