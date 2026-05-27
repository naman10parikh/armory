---
name: permission-request
type: hooks
description: >
  Run when a permission dialog is shown, to audit, auto-approve, or deny tool permissions.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/permission_request.py
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [notification, post-tool-use]
tags: [hook, disler]
---
## What it is
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/permission_request.py). Run when a permission dialog is shown, to audit, auto-approve, or deny tool permissions.

## When to use it
Run when a permission dialog is shown, to audit, auto-approve, or deny tool permissions.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/permission_request.py -o .claude/hooks/permission-request.py
```

## Notes
Extracted from `.claude/hooks/permission_request.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: PermissionRequest Hook ====================== Triggered when the user is shown a permission dialog. This hook can: - Log all permission requests for auditing - Auto-allow specific patterns (e.g., read-only operations) - Deny permission requests based on security policies - Modify tool inputs before allowing Input JSON includes: - session_id, transcript_path, cwd, permission_mode - hook_event_name: "PermissionRequest" - tool_name, tool_input, tool_use_id Output JSON for decision control: { "hookSpecificOutput": { "hookEventName": "PermissionRequest", "decision": { "behavior": "allow" | "deny", "updatedInput": {...}, // optional for allow "message": "...", // optional for deny "interrupt": false // optional for deny } } } Pending verify -> promote.
