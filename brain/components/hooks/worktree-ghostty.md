---
name: worktree-ghostty
type: hooks
description: >
  Worktree Ghostty Layout. Opens a 3-panel Ghostty layout when creating worktrees: Claude Code (left) | lazygit (top-right) / yazi (bottom-right). Creates worktrees in a sibling directory (../worktrees/<repo>/<name>/) and cleans up on removal. macOS only. Requires: jq, Ghostty terminal, lazygit, yazi. Ghostty keybindings required: super+d = new_split:right, super+shift+d = new_split:down.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/worktree-ghostty.json
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
Worktree Ghostty Layout. Opens a 3-panel Ghostty layout when creating worktrees: Claude Code (left) | lazygit (top-right) / yazi (bottom-right). Creates worktrees in a sibling directory (../worktrees/<repo>/<name>/) and cleans up on removal. macOS only. Requires: jq, Ghostty terminal, lazygit, yazi. Ghostty keybindings required: super+d = new_split:right, super+shift+d = new_split:down.

## When to use it
Worktree Ghostty Layout. Opens a 3-panel Ghostty layout when creating worktrees: Claude Code (left) | lazygit (top-right) / yazi (bottom-right). Creates worktrees in a sibling directory (../worktrees/<repo>/<name>/) and cleans up on removal. macOS only. Requires: jq, Ghostty terminal, lazygit, yazi. Ghostty keybindings required: super+d = new_split:right, super+shift+d = new_split:down.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/development-tools/worktree-ghostty.json -o .claude/hooks/worktree-ghostty.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/worktree-ghostty.json) — development-tools category. Type: hooks. Pending verify -> promote.
