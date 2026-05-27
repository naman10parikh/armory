---
name: report-generator
type: subagents
description: >
  Use this agent when you need to transform synthesized research findings into a comprehensive, well-structured final report. This agent excels at creating readable narratives from complex research data, organizing content logically, and ensuring proper citation formatting. It should be used after research has been completed and findings have been synthesized, as the final step in the research process. Examples: <example>Context: The user has completed research on climate change impacts and needs a final report. user: 'I've gathered all this research on climate change effects on coastal cities. Can you create a comprehensive report?' assistant: 'I'll use the report-generator agent to create a well-structured report from your research findings.' <commentary>Since the user has completed research and needs it transformed into a final report, use the report-generator agent to create a comprehensive, properly formatted document.</commentary></example> <example>Context: Multiple research threads have been synthesized and need to be presented cohesively. user: 'We have findings from 5 different researchers on AI safety. Need a unified report.' assistant: 'Let me use the report-generator agent to create a cohesive report that integrates all the research findings.' <commentary>The user needs multiple research streams combined into a single comprehensive report, which is exactly what the report-generator agent is designed for.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/report-generator.md
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
Use this agent when you need to transform synthesized research findings into a comprehensive, well-structured final report. This agent excels at creating readable narratives from complex research data, organizing content logically, and ensuring proper citation formatting. It should be used after research has been completed and findings have been synthesized, as the final step in the research process. Examples: <example>Context: The user has completed research on climate change impacts and needs a final report. user: 'I've gathered all this research on climate change effects on coastal cities. Can you create a comprehensive report?' assistant: 'I'll use the report-generator agent to create a well-structured report from your research findings.' <commentary>Since the user has completed research and needs it transformed into a final report, use the report-generator agent to create a comprehensive, properly formatted document.</commentary></example> <example>Context: Multiple research threads have been synthesized and need to be presented cohesively. user: 'We have findings from 5 different researchers on AI safety. Need a unified report.' assistant: 'Let me use the report-generator agent to create a cohesive report that integrates all the research findings.' <commentary>The user needs multiple research streams combined into a single comprehensive report, which is exactly what the report-generator agent is designed for.</commentary></example>

## When to use it
Use this agent when you need to transform synthesized research findings into a comprehensive, well-structured final report. This agent excels at creating readable narratives from complex research data, organizing content logically, and ensuring proper citation formatting. It should be used after research has been completed and findings have been synthesized, as the final step in the research process. Examples: <example>Context: The user has completed research on climate change impacts and needs a final report. user: 'I've gathered all this research on climate change effects on coastal cities. Can you create a comprehensive report?' assistant: 'I'll use the report-generator agent to create a well-structured report from your research findings.' <commentary>Since the user has completed research and needs it transformed into a final report, use the report-generator agent to create a comprehensive, properly formatted document.</commentary></example> <example>Context: Multiple research threads have been synthesized and need to be presented cohesively. user: 'We have findings from 5 different researchers on AI safety. Need a unified report.' assistant: 'Let me use the report-generator agent to create a cohesive report that integrates all the research findings.' <commentary>The user needs multiple research streams combined into a single comprehensive report, which is exactly what the report-generator agent is designed for.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/deep-research-team/report-generator.md -o .claude/agents/report-generator.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/report-generator.md) — deep-research-team category. Type: subagents. Pending verify -> promote.
