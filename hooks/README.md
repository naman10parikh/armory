# hooks/ — agent lifecycle hooks (real vendored files)

Hook scripts and configs (`.py` / `.json` / `.sh`) that fire on Claude Code / agent lifecycle events (PreToolUse, PostToolUse, Stop, SessionStart, …). ~140 hooks.

- Pull one into your harness with `armory install <name>`.
- Full metadata for each hook → `brain/components/hooks/<slug>.md`.
- Sourced from `disler/claude-code-hooks-mastery`, `decider/claude-hooks`, `hesreallyhim/awesome-claude-code`, and community hook sets — see the homage in the root [README](../README.md).
