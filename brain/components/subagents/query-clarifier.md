---
name: query-clarifier
type: subagents
description: >
  Use this agent when you need to analyze research queries for clarity and determine if user clarification is needed before proceeding with research. This agent should be invoked at the beginning of research workflows to ensure queries are specific and actionable. Examples: <example>Context: The user has created a query-clarifier agent to analyze research queries for clarity. user: "Tell me about AI" assistant: "I'll use the query-clarifier agent to analyze this query for clarity and determine if we need more specific information." <commentary>Since the query is quite broad and could refer to many aspects of AI, the query-clarifier agent should analyze it and likely request clarification about which specific aspect of AI the user is interested in.</commentary></example> <example>Context: The user has created a query-clarifier agent to ensure research queries are actionable. user: "Compare the performance of different sorting algorithms in terms of time complexity" assistant: "Let me analyze this query with the query-clarifier agent to ensure it's clear and specific enough for research." <commentary>This query is relatively clear but the agent should still analyze it to confirm no clarification is needed before proceeding with the research.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/query-clarifier.md
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
Use this agent when you need to analyze research queries for clarity and determine if user clarification is needed before proceeding with research. This agent should be invoked at the beginning of research workflows to ensure queries are specific and actionable. Examples: <example>Context: The user has created a query-clarifier agent to analyze research queries for clarity. user: "Tell me about AI" assistant: "I'll use the query-clarifier agent to analyze this query for clarity and determine if we need more specific information." <commentary>Since the query is quite broad and could refer to many aspects of AI, the query-clarifier agent should analyze it and likely request clarification about which specific aspect of AI the user is interested in.</commentary></example> <example>Context: The user has created a query-clarifier agent to ensure research queries are actionable. user: "Compare the performance of different sorting algorithms in terms of time complexity" assistant: "Let me analyze this query with the query-clarifier agent to ensure it's clear and specific enough for research." <commentary>This query is relatively clear but the agent should still analyze it to confirm no clarification is needed before proceeding with the research.</commentary></example>

## When to use it
Use this agent when you need to analyze research queries for clarity and determine if user clarification is needed before proceeding with research. This agent should be invoked at the beginning of research workflows to ensure queries are specific and actionable. Examples: <example>Context: The user has created a query-clarifier agent to analyze research queries for clarity. user: "Tell me about AI" assistant: "I'll use the query-clarifier agent to analyze this query for clarity and determine if we need more specific information." <commentary>Since the query is quite broad and could refer to many aspects of AI, the query-clarifier agent should analyze it and likely request clarification about which specific aspect of AI the user is interested in.</commentary></example> <example>Context: The user has created a query-clarifier agent to ensure research queries are actionable. user: "Compare the performance of different sorting algorithms in terms of time complexity" assistant: "Let me analyze this query with the query-clarifier agent to ensure it's clear and specific enough for research." <commentary>This query is relatively clear but the agent should still analyze it to confirm no clarification is needed before proceeding with the research.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/deep-research-team/query-clarifier.md -o .claude/agents/query-clarifier.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/query-clarifier.md) — deep-research-team category. Type: subagents. Pending verify -> promote.
