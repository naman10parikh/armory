---
name: ai-bash-guard
type: hooks
description: >
  AI-powered bash command security guard. Before any Bash command runs, a lightweight Claude subagent evaluates it for destructive or irreversible patterns — recursive deletes, force pushes to protected branches, database drops, and credential exposure — and blocks execution with a clear explanation if flagged. Uses PreToolUse with type:agent, which is the only hook pattern that can block tool execution via AI reasoning.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/ai-bash-guard.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [security, hooks]
---
## What it is
AI-powered bash command security guard. Before any Bash command runs, a lightweight Claude subagent evaluates it for destructive or irreversible patterns — recursive deletes, force pushes to protected branches, database drops, and credential exposure — and blocks execution with a clear explanation if flagged. Uses PreToolUse with type:agent, which is the only hook pattern that can block tool execution via AI reasoning.

## When to use it
AI-powered bash command security guard. Before any Bash command runs, a lightweight Claude subagent evaluates it for destructive or irreversible patterns — recursive deletes, force pushes to protected branches, database drops, and credential exposure — and blocks execution with a clear explanation if flagged. Uses PreToolUse with type:agent, which is the only hook pattern that can block tool execution via AI reasoning.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/ai-bash-guard.json -o .claude/hooks/ai-bash-guard.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/ai-bash-guard.json) — security category. Type: hooks. Pending verify -> promote.
