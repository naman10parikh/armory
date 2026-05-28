---
name: session-continuity-manager
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/session-continuity-manager.md
license: unknown
---
# session-continuity-manager

PROACTIVELY USE this agent when you need to end a Claude Code session but want to maintain project context and momentum for future sessions. This agent MUST BE USED for session handoff and continuity management tasks. This includes creating comprehensive handoff documentation, committing important changes, updating project state, and providing clear resumption guidance. Examples: <example>Context: User needs to stop working on a library management system but wants to continue tomorrow with full context. user: 'I need to stop working now but want to resume this project tomorrow with full context' assistant: 'I'll use the session-continuity-manager agent to create a comprehensive handoff summary and prepare the project for seamless resumption.' Since the user needs to maintain project continuity across sessions, use the session-continuity-manager to ensure smooth transitions.</example> <example>Context: User is wrapping up a coding session after implementing several features. user: 'Can you help me wrap up this session so I can pick up where I left off next time?' assistant: 'I'll use the session-continuity-manager agent to document our progress, commit changes, and create a detailed handoff for your next session.' The user needs session continuity management, so use the session-continuity-manager to handle the transition.</example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/session-continuity-manager.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/session-continuity-manager.md`.
