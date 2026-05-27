---
name: maxim-saplin-safe-local-python-executor
type: mcps
description: >
  Wraps LocalPythonExecutor from HuggingFace's smolagents framework. The runtime combines the ease of setup (compared to docker, VM, cloud runtimes) while providing safeguards and limiting operations/imports that are allowed inside the runtime.
source_repo: maxim-saplin/mcp_safe_local_python_executor
source_url: https://github.com/maxim-saplin/mcp_safe_local_python_executor
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 44
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Safe Local Python Executor`, catalogued on PulseMCP. Wraps LocalPythonExecutor from HuggingFace's smolagents framework. The runtime combines the ease of setup (compared to docker, VM, cloud runtimes) while providing safeguards and limiting operations/imports that are allowed inside the runtime.

## When to use it
Wraps LocalPythonExecutor from HuggingFace's smolagents framework. The runtime combines the ease of setup (compared to docker, VM, cloud runtimes) while providing safeguards and limiting operations/imports that are allowed inside the runtime.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/maxim-saplin/mcp_safe_local_python_executor

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/maxim-saplin-safe-local-python-executor). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
