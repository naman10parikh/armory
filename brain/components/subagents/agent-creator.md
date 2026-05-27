---
name: agent-creator
type: subagents
description: >
  PROACTIVELY USE this agent when project requirements identify gaps in current agent capabilities that require new specialized agents with specific expertise or tool access. This agent MUST BE USED for creating new specialized agents. Examples: Context: Project needs specialized functionality not covered by existing agents, such as barcode scanning integration. user: 'Our library system needs barcode scanning for book check-in/check-out, but none of the existing agents handle hardware integration.' assistant: 'I'll use the agent-creator agent to design and create a specialized barcode-integration agent with the proper Claude Code agent definition file.' Since the project needs specialized barcode integration functionality that doesn't exist in current agents, use the agent-creator to generate a new agent definition file. Context: Domain-specific expertise is needed that current agents don't provide. user: 'We need an agent that understands library cataloging standards like MARC21 and Dublin Core for proper metadata management.' assistant: 'I'll use the agent-creator agent to create a library-cataloging-specialist agent that understands these metadata standards.' Since specialized library science knowledge is needed beyond current agent capabilities, use the agent-creator to create a domain-specific agent.
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/agent-creator.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `agent-creator`. PROACTIVELY USE this agent when project requirements identify gaps in current agent capabilities that require new specialized agents with specific expertise or tool access. This agent MUST BE USED for creating new specialized agents. Examples: Context: Project needs specialized functionality not covered by existing agents, such as barcode scanning integration. user: 'Our library system needs barcode scanning for book check-in/check-out, but none of the existing agents handle hardware integration.' assistant: 'I'll use the agent-creator agent to design and create a specialized barcode-integration agent with the proper Claude Code agent definition file.' Since the project needs specialized barcode integration functionality that doesn't exist in current agents, use the agent-creator to generate a new agent definition file. Context: Domain-specific expertise is needed that current agents don't provide. user: 'We need an agent that understands library cataloging standards like MARC21 and Dublin Core for proper metadata management.' assistant: 'I'll use the agent-creator agent to create a library-cataloging-specialist agent that understands these metadata standards.' Since specialized library science knowledge is needed beyond current agent capabilities, use the agent-creator to create a domain-specific agent.

## When to use it
PROACTIVELY USE this agent when project requirements identify gaps in current agent capabilities that require new specialized agents with specific expertise or tool access. This agent MUST BE USED for creating new specialized agents. Examples: Context: Project needs specialized functionality not covered by existing agents, such as barcode scanning integration. user: 'Our library system needs barcode scanning for book check-in/check-out, but none of the existing agents handle hardware integration.' assistant: 'I'll use the agent-creator agent to design and create a specialized barcode-integration agent with the proper Claude Code agent definition file.' Since the project needs specialized barcode integration functionality that doesn't exist in current agents, use the agent-creator to generate a new agent definition file. Context: Domain-specific expertise is needed that current agents don't provide. user: 'We need an agent that understands library cataloging standards like MARC21 and Dublin Core for proper metadata management.' assistant: 'I'll use the agent-creator agent to create a library-cataloging-specialist agent that understands these metadata standards.' Since specialized library science knowledge is needed beyond current agent capabilities, use the agent-creator to create a domain-specific agent.

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/agent-creator.md -o .claude/agents/agent-creator.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/agent-creator.md). Pending verify -> promote.
