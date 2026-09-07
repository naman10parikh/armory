---
name: cloudflare-web-bot-auth
type: identity
description: >
  Use when a website has to be able to tell that a request really came from your agent and not from someone impersonating it.
source_repo: cloudflare/web-bot-auth
source_url: https://github.com/cloudflare/web-bot-auth
license: Apache-2.0
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: experimental
stars: 157
eval_score: null
mentions: null
verified_at: 2026-09-07
related: []
tags: [cp138-seed, identity]
forks: 40
pushed_at: "2026-09-05T19:43:10Z"
---
## What it is
Use when a website has to be able to tell that a request really came from your agent and not from someone impersonating it.

## When to use it
Signed HTTP requests (RFC 9421) are how an agent proves its identity to the open web — the outermost 'how it is reached'.

## How to install / invoke
See the source README: https://github.com/cloudflare/web-bot-auth

## Notes
Seeded 2026-09-07 by CP138 T18 to give the identity shelf enough depth to rank. Verified live on GitHub at seed time; not already in the catalogue.
