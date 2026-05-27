---
name: research-orchestrator
type: subagents
description: >
  Use this agent when you need to coordinate a comprehensive research project that requires multiple specialized agents working in sequence. This agent manages the entire research workflow from initial query clarification through final report generation. <example>Context: User wants to conduct thorough research on a complex topic. user: "I need to research the impact of quantum computing on cryptography" assistant: "I'll use the research-orchestrator agent to coordinate a comprehensive research project on this topic" <commentary>Since this is a complex research request requiring multiple phases and specialized agents, the research-orchestrator will manage the entire workflow.</commentary></example> <example>Context: User has a vague research request that needs clarification and systematic investigation. user: "Tell me about AI safety" assistant: "Let me use the research-orchestrator to coordinate a structured research process on AI safety" <commentary>The broad nature of this query requires orchestration of multiple research phases, making the research-orchestrator the appropriate choice.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/research-orchestrator.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [deep-research-team, subagents]
---
## What it is
Use this agent when you need to coordinate a comprehensive research project that requires multiple specialized agents working in sequence. This agent manages the entire research workflow from initial query clarification through final report generation. <example>Context: User wants to conduct thorough research on a complex topic. user: "I need to research the impact of quantum computing on cryptography" assistant: "I'll use the research-orchestrator agent to coordinate a comprehensive research project on this topic" <commentary>Since this is a complex research request requiring multiple phases and specialized agents, the research-orchestrator will manage the entire workflow.</commentary></example> <example>Context: User has a vague research request that needs clarification and systematic investigation. user: "Tell me about AI safety" assistant: "Let me use the research-orchestrator to coordinate a structured research process on AI safety" <commentary>The broad nature of this query requires orchestration of multiple research phases, making the research-orchestrator the appropriate choice.</commentary></example>

## When to use it
Use this agent when you need to coordinate a comprehensive research project that requires multiple specialized agents working in sequence. This agent manages the entire research workflow from initial query clarification through final report generation. <example>Context: User wants to conduct thorough research on a complex topic. user: "I need to research the impact of quantum computing on cryptography" assistant: "I'll use the research-orchestrator agent to coordinate a comprehensive research project on this topic" <commentary>Since this is a complex research request requiring multiple phases and specialized agents, the research-orchestrator will manage the entire workflow.</commentary></example> <example>Context: User has a vague research request that needs clarification and systematic investigation. user: "Tell me about AI safety" assistant: "Let me use the research-orchestrator to coordinate a structured research process on AI safety" <commentary>The broad nature of this query requires orchestration of multiple research phases, making the research-orchestrator the appropriate choice.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/deep-research-team/research-orchestrator.md -o .claude/agents/research-orchestrator.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/research-orchestrator.md) — deep-research-team category. Type: subagents. Pending verify -> promote.
