---
name: zero-config-deployment-monitor
type: claudemd-rules
description: >
  Auto-detecting Vercel deployment monitor with zero configuration required. Automatically discovers your Vercel auth token from CLI config (macOS: ~/Library/Application Support/com.vercel.cli/auth.json, Linux: ~/.config/vercel/auth.json, Windows: %APPDATA%/vercel/auth.json) and project ID from .vercel/project.json. Shows real-time deployment status, build state icons, deployment URL preview, and time elapsed since last deployment. Falls back gracefully to environment variables VERCEL_TOKEN and VERCEL_PROJECT_ID if auto-detection fails. Works across all platforms without any manual setup.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/zero-config-deployment-monitor.json
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
Auto-detecting Vercel deployment monitor with zero configuration required. Automatically discovers your Vercel auth token from CLI config (macOS: ~/Library/Application Support/com.vercel.cli/auth.json, Linux: ~/.config/vercel/auth.json, Windows: %APPDATA%/vercel/auth.json) and project ID from .vercel/project.json. Shows real-time deployment status, build state icons, deployment URL preview, and time elapsed since last deployment. Falls back gracefully to environment variables VERCEL_TOKEN and VERCEL_PROJECT_ID if auto-detection fails. Works across all platforms without any manual setup.

## When to use it
Auto-detecting Vercel deployment monitor with zero configuration required. Automatically discovers your Vercel auth token from CLI config (macOS: ~/Library/Application Support/com.vercel.cli/auth.json, Linux: ~/.config/vercel/auth.json, Windows: %APPDATA%/vercel/auth.json) and project ID from .vercel/project.json. Shows real-time deployment status, build state icons, deployment URL preview, and time elapsed since last deployment. Falls back gracefully to environment variables VERCEL_TOKEN and VERCEL_PROJECT_ID if auto-detection fails. Works across all platforms without any manual setup.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/zero-config-deployment-monitor.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/zero-config-deployment-monitor.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
