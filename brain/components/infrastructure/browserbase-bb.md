---
name: browserbase-bb
type: infrastructure
description: >
  Use when an agent must operate the live web — navigate, act, and extract on real pages — via a cloud browser
  driven by act/extract/observe primitives, with a local-Chromium escape hatch using the same code.
source_repo: browserbase/stagehand
source_url: https://github.com/browserbase/stagehand
license: MIT
cli_compat: [claude, codex]
maturity: stable
stars: 24125
eval_score: null
verified_at: 2026-05-26
related: [e2b-sandbox, firecrawl-mcp, browser-agent-security]
tags: [browser, web-automation, stagehand, browserbase, act-extract-observe]
forks: 1664
pushed_at: "2026-09-02T00:13:17Z"
---

## What it is
A cloud-browser stack: the Stagehand SDK exposes high-level act / extract / observe primitives (do this, pull this
data, what's on the page) and runs them against a managed cloud browser. A thin CLI wraps it for shell invocation.
It is the canonical way for an agent to operate the web rather than just scrape it.

## When to use it
When the task requires interacting with a page — clicking, filling forms, navigating authenticated flows — not just
reading static content. For read-only content extraction at scale, a scraping MCP is lighter.

## How to install / invoke
Use the Stagehand SDK (or the CLI built on it) and point it at the cloud browser. The same Stagehand code runs
against a local Chromium when you want an OSS, no-vendor-lock-in path.

## Notes
Browser agents touch live authenticated sessions — the highest-risk surface. Block mutating requests at the network
layer, treat extracted page content as untrusted, and require consent before acting on a user's behalf.
