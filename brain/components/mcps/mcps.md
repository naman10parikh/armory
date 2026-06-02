---
type: moc
title: MCP Servers — category hub
created: 2026-05-26
tags: [moc, mcps]
---

# mcps

Model Context Protocol servers — the standardized way to give an agent native tool access to an external system
(GitHub, docs, memory stores, vaults, web scraping, payments, chat) without hand-rolling an integration per provider.
A server exposes tools the agent calls; the client (the CLI) brokers the connection. These components cover the servers
wired into a production harness, each with its install command and the situation it answers.

## Components

- [[github-mcp]] — issues, PRs, repo read/search
- [[context7-mcp]] — current library/framework documentation
- [[server-memory]] — persistent entity-graph memory
- [[obsidian-mcpvault]] — read/write an Obsidian vault
- [[firecrawl-mcp]] — web scraping and content extraction
- [[stripe-mcp]] — payments and the agent-earns-its-compute rail
- [[slack-mcp]] — post and read in Slack channels
- [[mem0-mcp]] — cross-session long-term memory
