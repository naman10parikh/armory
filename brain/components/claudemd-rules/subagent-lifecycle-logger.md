---
name: subagent-lifecycle-logger
type: claudemd-rules
description: >
  Audit trail for subagent invocations using SubagentStart and SubagentStop lifecycle hooks. Every time Claude spawns or finishes a subagent, a timestamped JSON entry is appended to .claude/agent-log.jsonl — recording the agent name, event type, and ISO timestamp. Provides an offline, zero-dependency log for debugging multi-agent workflows, tracking which agents ran and in what order, and estimating AI usage per session.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/hooks/subagent-lifecycle-logger.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [hooks, claudemd-rules]
---
## What it is
Audit trail for subagent invocations using SubagentStart and SubagentStop lifecycle hooks. Every time Claude spawns or finishes a subagent, a timestamped JSON entry is appended to .claude/agent-log.jsonl — recording the agent name, event type, and ISO timestamp. Provides an offline, zero-dependency log for debugging multi-agent workflows, tracking which agents ran and in what order, and estimating AI usage per session.

## When to use it
Audit trail for subagent invocations using SubagentStart and SubagentStop lifecycle hooks. Every time Claude spawns or finishes a subagent, a timestamped JSON entry is appended to .claude/agent-log.jsonl — recording the agent name, event type, and ISO timestamp. Provides an offline, zero-dependency log for debugging multi-agent workflows, tracking which agents ran and in what order, and estimating AI usage per session.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/hooks/subagent-lifecycle-logger.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/hooks/subagent-lifecycle-logger.json) — hooks category. Type: claudemd-rules. Pending verify -> promote.
