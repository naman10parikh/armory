---
name: subagent-lifecycle-logger
type: claudemd-rules
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/hooks/subagent-lifecycle-logger.json
license: MIT
---
# subagent-lifecycle-logger

Audit trail for subagent invocations using SubagentStart and SubagentStop lifecycle hooks. Every time Claude spawns or finishes a subagent, a timestamped JSON entry is appended to .claude/agent-log.jsonl — recording the agent name, event type, and ISO timestamp. Provides an offline, zero-dependency log for debugging multi-agent workflows, tracking which agents ran and in what order, and estimating AI usage per session.

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/hooks/subagent-lifecycle-logger.json

> Generated from the Armory catalog. Full metadata lives in `brain/components/claudemd-rules/subagent-lifecycle-logger.md`.
