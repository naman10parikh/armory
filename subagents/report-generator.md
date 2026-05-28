---
name: report-generator
type: subagents
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/report-generator.md
license: MIT
---
# report-generator

Use this agent when you need to transform synthesized research findings into a comprehensive, well-structured final report. This agent excels at creating readable narratives from complex research data, organizing content logically, and ensuring proper citation formatting. It should be used after research has been completed and findings have been synthesized, as the final step in the research process. Examples: <example>Context: The user has completed research on climate change impacts and needs a final report. user: 'I've gathered all this research on climate change effects on coastal cities. Can you create a comprehensive report?' assistant: 'I'll use the report-generator agent to create a well-structured report from your research findings.' <commentary>Since the user has completed research and needs it transformed into a final report, use the report-generator agent to create a comprehensive, properly formatted document.</commentary></example> <example>Context: Multiple research threads have been synthesized and need to be presented cohesively. user: 'We have findings from 5 different researchers on AI safety. Need a unified report.' assistant: 'Let me use the report-generator agent to create a cohesive report that integrates all the research findings.' <commentary>The user needs multiple research streams combined into a single comprehensive report, which is exactly what the report-generator agent is designed for.</commentary></example>

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/report-generator.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/report-generator.md`.
