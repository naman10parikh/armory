---
name: slack-mcp
type: mcps
description: >
  Use to let an agent participate in Slack — post messages, reply in threads, read channel history, and react — so
  it can report status or take instructions in a team's chat.
source_repo: modelcontextprotocol/servers-archived
source_url: https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack
license: MIT
cli_compat: [claude, codex, cursor]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [github-mcp]
tags: [slack, chat, messaging, notifications, integration]
---

## What it is
An MCP server that exposes Slack operations as agent tools: post a message, reply within a thread, read recent
channel history, add reactions, and look up users. It makes a team's chat a place the agent can both speak and listen.

## When to use it
When an agent should post status updates, surface blockers, or take lightweight instructions through Slack rather
than only through the terminal. The trigger is "tell the team" or "watch this channel."

## How to install / invoke
Add the Slack MCP server to your MCP config with a bot token and the channels it may access. Use the post/reply
tools for output and the history tool to read context.

## Notes
Scope the bot to specific channels. Keep agent posts concise and lead with what matters — a chat channel is a
human-facing surface, so apply the same status-update discipline you'd use for any human report.
