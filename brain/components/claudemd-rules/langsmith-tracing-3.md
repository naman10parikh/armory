---
name: langsmith-tracing-3
type: claudemd-rules
description: >
  Configure LangSmith tracing environment variables for Claude Code observability. Sends conversation traces to LangSmith for monitoring and analysis. Requires: LangSmith account and API key from https://smith.langchain.com/settings/apikeys. After installation, replace YOUR_API_KEY_HERE with your actual API key (starts with lsv2_pt_). Set TRACE_TO_LANGSMITH to false to disable tracing.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/telemetry/langsmith-tracing.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [telemetry, claudemd-rules]
---
## What it is
Configure LangSmith tracing environment variables for Claude Code observability. Sends conversation traces to LangSmith for monitoring and analysis. Requires: LangSmith account and API key from https://smith.langchain.com/settings/apikeys. After installation, replace YOUR_API_KEY_HERE with your actual API key (starts with lsv2_pt_). Set TRACE_TO_LANGSMITH to false to disable tracing.

## When to use it
Configure LangSmith tracing environment variables for Claude Code observability. Sends conversation traces to LangSmith for monitoring and analysis. Requires: LangSmith account and API key from https://smith.langchain.com/settings/apikeys. After installation, replace YOUR_API_KEY_HERE with your actual API key (starts with lsv2_pt_). Set TRACE_TO_LANGSMITH to false to disable tracing.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/telemetry/langsmith-tracing.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/telemetry/langsmith-tracing.json) — telemetry category. Type: claudemd-rules. Pending verify -> promote.
