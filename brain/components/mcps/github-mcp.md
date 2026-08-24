---
name: github-mcp
type: mcps
description: >
  Use when an agent needs to operate GitHub natively — create issues and PRs, read and search repositories, and
  inspect commits — instead of shelling out to ad-hoc git commands.
source_repo: github/github-mcp-server
source_url: https://github.com/github/github-mcp-server
license: MIT
cli_compat: [claude, codex, cursor, gemini]
maturity: stable
stars: 32462
eval_score: 1
verified_at: 2026-05-26
related: [slack-mcp, context7-mcp]
tags: [github, vcs, issues, pull-requests, integration]
---

## What it is
An MCP server that exposes GitHub operations as agent tools: open and comment on issues, create branches and pull
requests, read file contents, search code and repos, and list commits. It turns "do something on GitHub" into a
direct tool call.

## When to use it
When an agent's task involves the GitHub API — filing an issue from a CI failure, opening a PR, searching for a
pattern across a repo. Prefer it over scripted `gh`/`git` when you want structured tool calls.

## How to install / invoke
Add to your MCP config (e.g. `.mcp.json`) pointing at the GitHub MCP server, with a token in the environment. The
canonical maintained server is `github/github-mcp-server`.

## Notes
Scope the token to what the agent actually needs. A `gh` CLI remains a fine fallback for scripted flows where you
don't want a server in context.
