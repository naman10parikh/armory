---
name: context-manager
type: subagents
description: >
  PROACTIVELY USE this agent when Claude Code session context is becoming unwieldy, approaching token limits, or when you need to preserve essential information for session continuity. This agent MUST BE USED for context management and session optimization tasks. Examples: <example>Context: Long development session approaching context limits. user: 'We've been working on this complex system for hours and the conversation is getting very long' assistant: 'I'll use the context-manager agent to analyze our session state and prepare for a clean handoff to a new session.' <commentary>Since the session is approaching context limits, use the context-manager to preserve essential information and prepare for session continuity.</commentary></example> <example>Context: User notices conversation becoming difficult to follow. user: 'This conversation has gotten really complex with all the different components we've discussed' assistant: 'Let me use the context-manager agent to organize our session information and create a clear summary of our progress.' <commentary>The conversation complexity indicates need for context organization and management.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/context-manager.md
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [dlezo, subagents]
---
## What it is
`dl-ezo/claude-code-sub-agents` sub-agent `context-manager`. PROACTIVELY USE this agent when Claude Code session context is becoming unwieldy, approaching token limits, or when you need to preserve essential information for session continuity. This agent MUST BE USED for context management and session optimization tasks. Examples: <example>Context: Long development session approaching context limits. user: 'We've been working on this complex system for hours and the conversation is getting very long' assistant: 'I'll use the context-manager agent to analyze our session state and prepare for a clean handoff to a new session.' <commentary>Since the session is approaching context limits, use the context-manager to preserve essential information and prepare for session continuity.</commentary></example> <example>Context: User notices conversation becoming difficult to follow. user: 'This conversation has gotten really complex with all the different components we've discussed' assistant: 'Let me use the context-manager agent to organize our session information and create a clear summary of our progress.' <commentary>The conversation complexity indicates need for context organization and management.</commentary></example>

## When to use it
PROACTIVELY USE this agent when Claude Code session context is becoming unwieldy, approaching token limits, or when you need to preserve essential information for session continuity. This agent MUST BE USED for context management and session optimization tasks. Examples: <example>Context: Long development session approaching context limits. user: 'We've been working on this complex system for hours and the conversation is getting very long' assistant: 'I'll use the context-manager agent to analyze our session state and prepare for a clean handoff to a new session.' <commentary>Since the session is approaching context limits, use the context-manager to preserve essential information and prepare for session continuity.</commentary></example> <example>Context: User notices conversation becoming difficult to follow. user: 'This conversation has gotten really complex with all the different components we've discussed' assistant: 'Let me use the context-manager agent to organize our session information and create a clear summary of our progress.' <commentary>The conversation complexity indicates need for context organization and management.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/context-manager.md -o .claude/agents/context-manager.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/context-manager.md). Pending verify -> promote.
