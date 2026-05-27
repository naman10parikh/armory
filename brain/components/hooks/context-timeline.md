---
name: context-timeline
type: hooks
description: >
  Real-time browser visualization of Claude Code's context window and subagent/tool execution as a git-graph timeline. Opens http://localhost:7878 on SessionStart with a vertical timeline (most recent on top), one column per agent (main + subagents branching from their Task tool call). Tool calls are color-coded by type (Read=green, Edit/Write=orange, Bash=red, Grep/Glob=cyan, Task=purple, Web=yellow, MCP=gray). Right sidebar shows context-window usage (tokens/200K) with cache_read/cache_creation/input/output breakdown plus per-subagent mini-context. Reads ~/.claude/projects/<encoded-cwd>/<session_id>.jsonl directly — no data replication, no network calls. Pure stdlib Python, zero pip dependencies. Persistent daemon HTTP server on port 7878 (auto-fallback 7879-7888 if busy; override with CONTEXT_TIMELINE_PORT env var). Watchdog auto-shutdown after 1h of inactivity. Disable browser auto-open with CONTEXT_TIMELINE_NO_BROWSER=1. Manual shutdown: python3 .claude/hooks/context-timeline.py --shutdown
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/context-timeline.json
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
Real-time browser visualization of Claude Code's context window and subagent/tool execution as a git-graph timeline. Opens http://localhost:7878 on SessionStart with a vertical timeline (most recent on top), one column per agent (main + subagents branching from their Task tool call). Tool calls are color-coded by type (Read=green, Edit/Write=orange, Bash=red, Grep/Glob=cyan, Task=purple, Web=yellow, MCP=gray). Right sidebar shows context-window usage (tokens/200K) with cache_read/cache_creation/input/output breakdown plus per-subagent mini-context. Reads ~/.claude/projects/<encoded-cwd>/<session_id>.jsonl directly — no data replication, no network calls. Pure stdlib Python, zero pip dependencies. Persistent daemon HTTP server on port 7878 (auto-fallback 7879-7888 if busy; override with CONTEXT_TIMELINE_PORT env var). Watchdog auto-shutdown after 1h of inactivity. Disable browser auto-open with CONTEXT_TIMELINE_NO_BROWSER=1. Manual shutdown: python3 .claude/hooks/context-timeline.py --shutdown

## When to use it
Real-time browser visualization of Claude Code's context window and subagent/tool execution as a git-graph timeline. Opens http://localhost:7878 on SessionStart with a vertical timeline (most recent on top), one column per agent (main + subagents branching from their Task tool call). Tool calls are color-coded by type (Read=green, Edit/Write=orange, Bash=red, Grep/Glob=cyan, Task=purple, Web=yellow, MCP=gray). Right sidebar shows context-window usage (tokens/200K) with cache_read/cache_creation/input/output breakdown plus per-subagent mini-context. Reads ~/.claude/projects/<encoded-cwd>/<session_id>.jsonl directly — no data replication, no network calls. Pure stdlib Python, zero pip dependencies. Persistent daemon HTTP server on port 7878 (auto-fallback 7879-7888 if busy; override with CONTEXT_TIMELINE_PORT env var). Watchdog auto-shutdown after 1h of inactivity. Disable browser auto-open with CONTEXT_TIMELINE_NO_BROWSER=1. Manual shutdown: python3 .claude/hooks/context-timeline.py --shutdown

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/monitoring/context-timeline.json -o .claude/hooks/context-timeline.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/context-timeline.json) — monitoring category. Type: hooks. Pending verify -> promote.
