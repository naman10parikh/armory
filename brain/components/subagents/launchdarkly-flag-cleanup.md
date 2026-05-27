---
name: launchdarkly-flag-cleanup
type: subagents
description: >
  A specialized GitHub Copilot agent that uses the LaunchDarkly MCP server to safely automate feature flag cleanup workflows. This agent determines removal readiness, identifies the correct forward value, and creates PRs that preserve production behavior while removing obsolete flags and updating stale defaults.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/development-tools/launchdarkly-flag-cleanup.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [development-tools, subagents]
---
## What it is
A specialized GitHub Copilot agent that uses the LaunchDarkly MCP server to safely automate feature flag cleanup workflows. This agent determines removal readiness, identifies the correct forward value, and creates PRs that preserve production behavior while removing obsolete flags and updating stale defaults.

## When to use it
A specialized GitHub Copilot agent that uses the LaunchDarkly MCP server to safely automate feature flag cleanup workflows. This agent determines removal readiness, identifies the correct forward value, and creates PRs that preserve production behavior while removing obsolete flags and updating stale defaults.

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/development-tools/launchdarkly-flag-cleanup.md -o .claude/agents/launchdarkly-flag-cleanup.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/development-tools/launchdarkly-flag-cleanup.md) — development-tools category. Type: subagents. Pending verify -> promote.
