---
name: agentpack
type: mcps
description: >
  FROM node:22-alpine RUN npm install -g agentpack-cli WORKDIR /workspace RUN agentpack init ENTRYPOINT ["agentpack", "mcp"]
source_repo: ihorponom/agentpack
source_url: https://github.com/ihorponom/agentpack
license: MIT License
cli_compat: [claude, cursor, codex, opencode, gemini]
maturity: experimental
stars: 17
eval_score: null
verified_at: 2026-05-27
related: []
tags: [glama, mcp]
forks: 1
pushed_at: "2026-08-29T17:33:39Z"
---
## What it is
FROM node:22-alpine RUN npm install -g agentpack-cli WORKDIR /workspace RUN agentpack init ENTRYPOINT ["agentpack", "mcp"]

## When to use it
FROM node:22-alpine RUN npm install -g agentpack-cli WORKDIR /workspace RUN agentpack init ENTRYPOINT ["agentpack", "mcp"]

## How to install / invoke
See [Glama](https://glama.ai/mcp/servers/dd1g2fenxe) for the install config.

## Notes
Discovered via the Glama MCP registry (live API). Pending verify -> promote.
