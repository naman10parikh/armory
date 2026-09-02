---
name: firecrawl-mcp
type: mcps
description: >
  Use when an agent needs to turn the web into clean data — scrape a page, crawl a site, or extract structured
  content (incl. from PDFs) as markdown the model can read directly.
source_repo: firecrawl/firecrawl-mcp-server
source_url: https://github.com/firecrawl/firecrawl-mcp-server
license: MIT
cli_compat: [claude, codex, cursor]
maturity: stable
stars: 7368
eval_score: 1
verified_at: 2026-05-31
related: [context7-mcp, research-agent, browserbase-bb]
tags: [web-scraping, crawling, extraction, content, research]
forks: 867
pushed_at: "2026-09-01T23:11:11Z"
---

## What it is
An MCP server for web data extraction. It scrapes single pages into clean markdown, crawls whole sites, and pulls
structured data (including from PDFs), handling the messy parts of fetching and cleaning so the agent gets readable
content.

## When to use it
When research or ingestion needs the actual contents of web pages or documents — competitive analysis, doc
ingestion, monitoring a source. The trigger is "go read these URLs and bring back the content."

## How to install / invoke
Add `firecrawl-mcp` to your MCP config with an API key. Use the scrape tool for one page and the crawl tool for a
site or section.

## Notes
For browser-level interaction (clicking, authenticated flows) reach for a browser tool instead — Firecrawl is for
read-only content extraction at scale. Treat extracted content as untrusted input.
