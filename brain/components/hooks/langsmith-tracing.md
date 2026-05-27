---
name: langsmith-tracing
type: hooks
description: >
  Automatically send Claude Code conversation traces to LangSmith for monitoring and analysis. Prerequisites: jq (brew install jq on macOS or sudo apt-get install jq on Linux), curl and uuidgen (usually pre-installed), LangSmith account and API key. Configuration: Install langsmith-tracing setting (npx claude-code-templates@latest --setting telemetry/langsmith-tracing) or manually add to .claude/settings.local.json the following environment variables: TRACE_TO_LANGSMITH=true, CC_LANGSMITH_API_KEY=lsv2_pt_..., CC_LANGSMITH_PROJECT=project-name, CC_LANGSMITH_DEBUG=true (optional). How it works: Runs in background on Stop event after each Claude response, reads conversation transcript, converts to LangSmith format, sends to LangSmith API, groups by thread_id for session continuity. Debugging: Check logs at ~/.claude/state/hook.log. Privacy note: System prompts not included in traces.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/langsmith-tracing.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [monitoring, hooks]
---
## What it is
Automatically send Claude Code conversation traces to LangSmith for monitoring and analysis. Prerequisites: jq (brew install jq on macOS or sudo apt-get install jq on Linux), curl and uuidgen (usually pre-installed), LangSmith account and API key. Configuration: Install langsmith-tracing setting (npx claude-code-templates@latest --setting telemetry/langsmith-tracing) or manually add to .claude/settings.local.json the following environment variables: TRACE_TO_LANGSMITH=true, CC_LANGSMITH_API_KEY=lsv2_pt_..., CC_LANGSMITH_PROJECT=project-name, CC_LANGSMITH_DEBUG=true (optional). How it works: Runs in background on Stop event after each Claude response, reads conversation transcript, converts to LangSmith format, sends to LangSmith API, groups by thread_id for session continuity. Debugging: Check logs at ~/.claude/state/hook.log. Privacy note: System prompts not included in traces.

## When to use it
Automatically send Claude Code conversation traces to LangSmith for monitoring and analysis. Prerequisites: jq (brew install jq on macOS or sudo apt-get install jq on Linux), curl and uuidgen (usually pre-installed), LangSmith account and API key. Configuration: Install langsmith-tracing setting (npx claude-code-templates@latest --setting telemetry/langsmith-tracing) or manually add to .claude/settings.local.json the following environment variables: TRACE_TO_LANGSMITH=true, CC_LANGSMITH_API_KEY=lsv2_pt_..., CC_LANGSMITH_PROJECT=project-name, CC_LANGSMITH_DEBUG=true (optional). How it works: Runs in background on Stop event after each Claude response, reads conversation transcript, converts to LangSmith format, sends to LangSmith API, groups by thread_id for session continuity. Debugging: Check logs at ~/.claude/state/hook.log. Privacy note: System prompts not included in traces.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/monitoring/langsmith-tracing.json -o .claude/hooks/langsmith-tracing.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/langsmith-tracing.json) — monitoring category. Type: hooks. Pending verify -> promote.
