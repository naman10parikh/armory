---
name: debug-window
type: hooks
description: >
  Auto Debug Log Viewer. Opens a live-tailing debug log window when Claude Code starts with --debug or -d flag. The window closes automatically on session end. To keep the debug window open after session ends, set DEBUG_WINDOW_AUTO_CLOSE_DISABLE=1 in your settings.json. Tested on Intel Mac. Supports macOS, Linux, and Windows (Git Bash/Cygwin). Contributions from other platform users are welcome.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/debug-window.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [development-tools, hooks]
---
## What it is
Auto Debug Log Viewer. Opens a live-tailing debug log window when Claude Code starts with --debug or -d flag. The window closes automatically on session end. To keep the debug window open after session ends, set DEBUG_WINDOW_AUTO_CLOSE_DISABLE=1 in your settings.json. Tested on Intel Mac. Supports macOS, Linux, and Windows (Git Bash/Cygwin). Contributions from other platform users are welcome.

## When to use it
Auto Debug Log Viewer. Opens a live-tailing debug log window when Claude Code starts with --debug or -d flag. The window closes automatically on session end. To keep the debug window open after session ends, set DEBUG_WINDOW_AUTO_CLOSE_DISABLE=1 in your settings.json. Tested on Intel Mac. Supports macOS, Linux, and Windows (Git Bash/Cygwin). Contributions from other platform users are welcome.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/development-tools/debug-window.json -o .claude/hooks/debug-window.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/debug-window.json) — development-tools category. Type: hooks. Pending verify -> promote.
