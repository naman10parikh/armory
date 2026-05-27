---
name: context-timeline-2
type: hooks
description: >
  context-timeline: Claude Code session visualizer. Modes (called by Claude Code hooks via stdin JSON): --server-start SessionStart hook — launch daemon + open browser --event <NAME> PreToolUse / PostToolUse / Stop hook — notify server --shutdown Kill daemon manually --run-server <PORT> Internal: daemon entry point (do not call directly)
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/context-timeline.py
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
context-timeline: Claude Code session visualizer. Modes (called by Claude Code hooks via stdin JSON): --server-start SessionStart hook — launch daemon + open browser --event <NAME> PreToolUse / PostToolUse / Stop hook — notify server --shutdown Kill daemon manually --run-server <PORT> Internal: daemon entry point (do not call directly)

## When to use it
context-timeline: Claude Code session visualizer. Modes (called by Claude Code hooks via stdin JSON): --server-start SessionStart hook — launch daemon + open browser --event <NAME> PreToolUse / PostToolUse / Stop hook — notify server --shutdown Kill daemon manually --run-server <PORT> Internal: daemon entry point (do not call directly)

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/monitoring/context-timeline.py -o .claude/hooks/context-timeline.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/context-timeline.py) — monitoring category. Type: hooks. Pending verify -> promote.
