---
name: vercel-auto-deploy
type: hooks
description: >
  Automatically trigger Vercel deployments when code changes are committed, with environment-specific deployment strategies and rollback on failure. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get your token from vercel.com/account/tokens and project ID from your Vercel dashboard). Hook triggers on PostToolUse for Write, Edit, and MultiEdit operations affecting source code files.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/vercel-auto-deploy.json
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
Automatically trigger Vercel deployments when code changes are committed, with environment-specific deployment strategies and rollback on failure. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get your token from vercel.com/account/tokens and project ID from your Vercel dashboard). Hook triggers on PostToolUse for Write, Edit, and MultiEdit operations affecting source code files.

## When to use it
Automatically trigger Vercel deployments when code changes are committed, with environment-specific deployment strategies and rollback on failure. Setup: Export environment variables 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get your token from vercel.com/account/tokens and project ID from your Vercel dashboard). Hook triggers on PostToolUse for Write, Edit, and MultiEdit operations affecting source code files.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/vercel-auto-deploy.json -o .claude/hooks/vercel-auto-deploy.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/vercel-auto-deploy.json) — automation category. Type: hooks. Pending verify -> promote.
