---
name: agent-installer
type: subagents
description: >
  Use this agent when the user wants to discover, browse, or install Claude Code agents from the awesome-claude-code-subagents repository. Specifically:\\n\\n<example>\\nContext: User is new to Claude Code and wants to explore available agents for their project.\\nuser: \"Show me what agents are available for Python development\"\\nassistant: \"I'll use the agent-installer to browse the Python-related agents in the awesome-claude-code-subagents repository.\"\\n<commentary>\\nWhen users need to discover agents that match their tech stack or use case, invoke the agent-installer to search and display matching agents from the community collection.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User has identified an agent they want to add to their local Claude Code setup.\\nuser: \"I want to install the javascript-pro agent to my .claude/agents directory\"\\nassistant: \"I'll use the agent-installer to download and install javascript-pro.md to your local agents folder.\"\\n<commentary>\\nWhen users explicitly request installing a specific agent, use the agent-installer to handle the download and installation workflow, asking about global vs local installation.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User is searching for agents matching a specific capability or domain.\\nuser: \"What agents do you have for security testing?\"\\nassistant: \"Let me use the agent-installer to search the repository for security and testing-related agents.\"\\n<commentary>\\nUse the agent-installer when users search by capability, domain, or keyword to discover relevant agents from the curated collection.\\n</commentary>\\n</example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/agent-installer.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [expert-advisors, subagents]
---
## What it is
Use this agent when the user wants to discover, browse, or install Claude Code agents from the awesome-claude-code-subagents repository. Specifically:\\n\\n<example>\\nContext: User is new to Claude Code and wants to explore available agents for their project.\\nuser: \"Show me what agents are available for Python development\"\\nassistant: \"I'll use the agent-installer to browse the Python-related agents in the awesome-claude-code-subagents repository.\"\\n<commentary>\\nWhen users need to discover agents that match their tech stack or use case, invoke the agent-installer to search and display matching agents from the community collection.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User has identified an agent they want to add to their local Claude Code setup.\\nuser: \"I want to install the javascript-pro agent to my .claude/agents directory\"\\nassistant: \"I'll use the agent-installer to download and install javascript-pro.md to your local agents folder.\"\\n<commentary>\\nWhen users explicitly request installing a specific agent, use the agent-installer to handle the download and installation workflow, asking about global vs local installation.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User is searching for agents matching a specific capability or domain.\\nuser: \"What agents do you have for security testing?\"\\nassistant: \"Let me use the agent-installer to search the repository for security and testing-related agents.\"\\n<commentary>\\nUse the agent-installer when users search by capability, domain, or keyword to discover relevant agents from the curated collection.\\n</commentary>\\n</example>

## When to use it
Use this agent when the user wants to discover, browse, or install Claude Code agents from the awesome-claude-code-subagents repository. Specifically:\\n\\n<example>\\nContext: User is new to Claude Code and wants to explore available agents for their project.\\nuser: \"Show me what agents are available for Python development\"\\nassistant: \"I'll use the agent-installer to browse the Python-related agents in the awesome-claude-code-subagents repository.\"\\n<commentary>\\nWhen users need to discover agents that match their tech stack or use case, invoke the agent-installer to search and display matching agents from the community collection.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User has identified an agent they want to add to their local Claude Code setup.\\nuser: \"I want to install the javascript-pro agent to my .claude/agents directory\"\\nassistant: \"I'll use the agent-installer to download and install javascript-pro.md to your local agents folder.\"\\n<commentary>\\nWhen users explicitly request installing a specific agent, use the agent-installer to handle the download and installation workflow, asking about global vs local installation.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User is searching for agents matching a specific capability or domain.\\nuser: \"What agents do you have for security testing?\"\\nassistant: \"Let me use the agent-installer to search the repository for security and testing-related agents.\"\\n<commentary>\\nUse the agent-installer when users search by capability, domain, or keyword to discover relevant agents from the curated collection.\\n</commentary>\\n</example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/expert-advisors/agent-installer.md -o .claude/agents/agent-installer.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/agent-installer.md) — expert-advisors category. Type: subagents. Pending verify -> promote.
