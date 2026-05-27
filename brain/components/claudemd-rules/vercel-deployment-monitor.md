---
name: vercel-deployment-monitor
type: claudemd-rules
description: >
  Real-time Vercel deployment monitor with clickable deploy link. Shows build status, time since last deployment, and a clickable OSC 8 hyperlink to the deployment URL (Cmd+click). Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-deployment-monitor.json
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
Real-time Vercel deployment monitor with clickable deploy link. Shows build status, time since last deployment, and a clickable OSC 8 hyperlink to the deployment URL (Cmd+click). Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.

## When to use it
Real-time Vercel deployment monitor with clickable deploy link. Shows build status, time since last deployment, and a clickable OSC 8 hyperlink to the deployment URL (Cmd+click). Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (or manually replace $VERCEL_TOKEN and $VERCEL_PROJECT_ID in the command if you prefer not to use environment variables). Get your token from vercel.com/account/tokens and project ID from your Vercel dashboard.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/vercel-deployment-monitor.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/vercel-deployment-monitor.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
