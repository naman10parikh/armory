---
name: neon-database-context
type: claudemd-rules
description: >
  Neon database context statusline showing project name, active branch, compute state, and autoscaling CU range. Uses only Neon REST API (no SQL connections needed). Helps avoid mistakes like running migrations on the wrong branch. Setup: Export NEON_API_KEY and NEON_PROJECT_ID as environment variables, or add them to your project's .env file. Get your API key from console.neon.tech and project ID from your Neon dashboard.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/neon-database-context.json
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
Neon database context statusline showing project name, active branch, compute state, and autoscaling CU range. Uses only Neon REST API (no SQL connections needed). Helps avoid mistakes like running migrations on the wrong branch. Setup: Export NEON_API_KEY and NEON_PROJECT_ID as environment variables, or add them to your project's .env file. Get your API key from console.neon.tech and project ID from your Neon dashboard.

## When to use it
Neon database context statusline showing project name, active branch, compute state, and autoscaling CU range. Uses only Neon REST API (no SQL connections needed). Helps avoid mistakes like running migrations on the wrong branch. Setup: Export NEON_API_KEY and NEON_PROJECT_ID as environment variables, or add them to your project's .env file. Get your API key from console.neon.tech and project ID from your Neon dashboard.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/statusline/neon-database-context.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/statusline/neon-database-context.json) — statusline category. Type: claudemd-rules. Pending verify -> promote.
