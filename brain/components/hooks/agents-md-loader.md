---
name: agents-md-loader
type: hooks
description: >
  Automatically loads AGENTS.md configuration file content at session start to ensure Claude Code follows project-specific agent behavior. Only loads if AGENTS.md exists, otherwise passes empty context. Supports the universal AGENTS.md standard for cross-platform AI assistant compatibility.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/agents-md-loader.json
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
Automatically loads AGENTS.md configuration file content at session start to ensure Claude Code follows project-specific agent behavior. Only loads if AGENTS.md exists, otherwise passes empty context. Supports the universal AGENTS.md standard for cross-platform AI assistant compatibility.

## When to use it
Automatically loads AGENTS.md configuration file content at session start to ensure Claude Code follows project-specific agent behavior. Only loads if AGENTS.md exists, otherwise passes empty context. Supports the universal AGENTS.md standard for cross-platform AI assistant compatibility.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/agents-md-loader.json -o .claude/hooks/agents-md-loader.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/agents-md-loader.json) — automation category. Type: hooks. Pending verify -> promote.
