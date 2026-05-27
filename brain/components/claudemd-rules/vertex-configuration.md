---
name: vertex-configuration
type: claudemd-rules
description: >
  Connect Claude Code with Google Vertex AI to access Anthropic's Claude models through Google Cloud Platform. Automatically configures all available Claude models (Sonnet, Haiku, Opus) with enterprise-grade infrastructure, billing, and security. Requires: GCP project with Vertex AI API enabled, authenticated gcloud CLI, and model access approval in Model Garden.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/api/vertex-configuration.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [api, claudemd-rules]
---
## What it is
Connect Claude Code with Google Vertex AI to access Anthropic's Claude models through Google Cloud Platform. Automatically configures all available Claude models (Sonnet, Haiku, Opus) with enterprise-grade infrastructure, billing, and security. Requires: GCP project with Vertex AI API enabled, authenticated gcloud CLI, and model access approval in Model Garden.

## When to use it
Connect Claude Code with Google Vertex AI to access Anthropic's Claude models through Google Cloud Platform. Automatically configures all available Claude models (Sonnet, Haiku, Opus) with enterprise-grade infrastructure, billing, and security. Requires: GCP project with Vertex AI API enabled, authenticated gcloud CLI, and model access approval in Model Garden.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/api/vertex-configuration.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/api/vertex-configuration.json) — api category. Type: claudemd-rules. Pending verify -> promote.
