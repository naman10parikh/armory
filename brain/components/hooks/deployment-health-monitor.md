---
name: deployment-health-monitor
type: hooks
description: >
  Monitor deployment status, error rates, and performance metrics, sending notifications for failed deployments or performance degradation. Tracks Vercel deployment health, monitors build success/failure rates, and provides alerts for deployment issues. Setup: Export 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get from vercel.com/account/tokens and Vercel dashboard).
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/deployment-health-monitor.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [automation, hooks]
---
## What it is
Monitor deployment status, error rates, and performance metrics, sending notifications for failed deployments or performance degradation. Tracks Vercel deployment health, monitors build success/failure rates, and provides alerts for deployment issues. Setup: Export 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get from vercel.com/account/tokens and Vercel dashboard).

## When to use it
Monitor deployment status, error rates, and performance metrics, sending notifications for failed deployments or performance degradation. Tracks Vercel deployment health, monitors build success/failure rates, and provides alerts for deployment issues. Setup: Export 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get from vercel.com/account/tokens and Vercel dashboard).

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/deployment-health-monitor.json -o .claude/hooks/deployment-health-monitor.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/deployment-health-monitor.json) — automation category. Type: hooks. Pending verify -> promote.
