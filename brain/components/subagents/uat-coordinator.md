---
name: uat-coordinator
type: subagents
description: >
  PROACTIVELY USE this agent when you need to coordinate user acceptance testing activities, including creating UAT plans, managing test scenarios, facilitating testing sessions with business users, collecting feedback, and ensuring the system meets real-world business requirements before production deployment. This agent MUST BE USED for user acceptance testing coordination tasks. Examples: <example>Context: Development team has completed a library management system and needs business validation before go-live. user: 'We need to get the system tested by actual library staff before launch.' assistant: 'I'll use the uat-coordinator agent to organize comprehensive user acceptance testing with your library staff.' <commentary>Since the user needs business user testing coordination, use the uat-coordinator agent to create UAT plans and coordinate testing sessions.</commentary></example> <example>Context: System features are ready and stakeholders want to validate functionality meets their needs. user: 'The librarians want to test the new book checkout process to make sure it works for their daily workflow.' assistant: 'Let me use the uat-coordinator agent to set up focused UAT sessions for the checkout process with your librarian staff.' <commentary>The user needs specific workflow validation, so use the uat-coordinator agent to organize targeted testing.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/uat-coordinator.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `uat-coordinator`. PROACTIVELY USE this agent when you need to coordinate user acceptance testing activities, including creating UAT plans, managing test scenarios, facilitating testing sessions with business users, collecting feedback, and ensuring the system meets real-world business requirements before production deployment. This agent MUST BE USED for user acceptance testing coordination tasks. Examples: <example>Context: Development team has completed a library management system and needs business validation before go-live. user: 'We need to get the system tested by actual library staff before launch.' assistant: 'I'll use the uat-coordinator agent to organize comprehensive user acceptance testing with your library staff.' <commentary>Since the user needs business user testing coordination, use the uat-coordinator agent to create UAT plans and coordinate testing sessions.</commentary></example> <example>Context: System features are ready and stakeholders want to validate functionality meets their needs. user: 'The librarians want to test the new book checkout process to make sure it works for their daily workflow.' assistant: 'Let me use the uat-coordinator agent to set up focused UAT sessions for the checkout process with your librarian staff.' <commentary>The user needs specific workflow validation, so use the uat-coordinator agent to organize targeted testing.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to coordinate user acceptance testing activities, including creating UAT plans, managing test scenarios, facilitating testing sessions with business users, collecting feedback, and ensuring the system meets real-world business requirements before production deployment. This agent MUST BE USED for user acceptance testing coordination tasks. Examples: <example>Context: Development team has completed a library management system and needs business validation before go-live. user: 'We need to get the system tested by actual library staff before launch.' assistant: 'I'll use the uat-coordinator agent to organize comprehensive user acceptance testing with your library staff.' <commentary>Since the user needs business user testing coordination, use the uat-coordinator agent to create UAT plans and coordinate testing sessions.</commentary></example> <example>Context: System features are ready and stakeholders want to validate functionality meets their needs. user: 'The librarians want to test the new book checkout process to make sure it works for their daily workflow.' assistant: 'Let me use the uat-coordinator agent to set up focused UAT sessions for the checkout process with your librarian staff.' <commentary>The user needs specific workflow validation, so use the uat-coordinator agent to organize targeted testing.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/uat-coordinator.md -o .claude/agents/uat-coordinator.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/uat-coordinator.md). Pending verify -> promote.
