---
name: hermes-tweet
type: skills
description: >
  Use when a Hermes Agent needs X/Twitter research, account reads, draft planning, or approval-gated X actions through the Hermes Tweet plugin.
source_repo: Xquik-dev/hermes-tweet
source_url: https://github.com/Xquik-dev/hermes-tweet/blob/master/skills/hermes-tweet/SKILL.md
license: MIT
cli_compat: [hermes]
maturity: stable
stars: 28
eval_score: null
verified_at: 2026-08-19
related: [x-api]
tags: [hermes, x-twitter, social-media, skill, plugin]
---
## What it is
Hermes Tweet is a native Hermes Agent plugin with a bundled skill for X/Twitter workflows. It provides local endpoint discovery, authenticated read helpers, and action tooling that stays disabled until the runtime explicitly opts in.

## When to use it
Use it when a Hermes Agent needs X/Twitter research, social listening, account or timeline data, post planning, or a controlled action with explicit approval.

## How to install / invoke
```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

Configure `XQUIK_API_KEY` on the Hermes runtime host for authenticated reads. Keep `HERMES_TWEET_ENABLE_ACTIONS=false` unless the session intentionally needs an approved write-like or private operation.

## Notes
Version 0.1.12 separates capabilities by risk. `tweet_explore` discovers catalog-listed routes locally. `tweet_read` requires `XQUIK_API_KEY`. `tweet_action` also requires `HERMES_TWEET_ENABLE_ACTIONS=true` and approval for the exact endpoint, payload, account, and side effects.
