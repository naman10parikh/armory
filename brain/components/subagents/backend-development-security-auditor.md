---
name: backend-development-security-auditor
type: subagents
description: >
  Review code and architecture for security vulnerabilities, OWASP Top 10, auth flaws, and compliance issues. Use for security review during feature development.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/backend-development/agents/security-auditor.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, subagents]
---
## What it is
`wshobson/agents` sub-agent `security-auditor` (model: sonnet) from the `backend-development` plugin. Review code and architecture for security vulnerabilities, OWASP Top 10, auth flaws, and compliance issues. Use for security review during feature development.

## When to use it
Review code and architecture for security vulnerabilities, OWASP Top 10, auth flaws, and compliance issues. Use for security review during feature development.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/backend-development/agents/security-auditor.md -o .claude/agents/security-auditor.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/backend-development/agents/security-auditor.md). Plugin: `backend-development`. Pending verify -> promote.
