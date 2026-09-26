---
name: getzep-zep
type: memory
description: >
  Examples, framework integrations and tools for Zep Cloud, Zep's hosted agent memory service; the
  repository says it is not the product itself. The open-source knowledge-graph engine behind Zep is
  Graphiti (getzep-graphiti).
source_repo: getzep/zep
source_url: https://github.com/getzep/zep
license: Apache-2.0
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: experimental
stars: 4882
eval_score: null
mentions: 7
verified_at: 2026-09-02
related: []
tags: [sentinel-feed, memory]
forks: 651
pushed_at: "2026-09-01T22:18:14Z"
---
## What it is
Example code, framework integrations and tools for building agent memory with Zep Cloud, Zep's hosted
memory service. Its README says the repository is not Zep's product or service. The old self-hosted
server, Zep Community Edition, sits in its `legacy/` folder and is no longer supported. The engine
is a separate repository, Graphiti (getzep-graphiti): an open-source temporal knowledge graph.

## When to use it
When an agent keeps its memory in Zep Cloud and you want a worked example or an integration for your
framework. To run the memory engine yourself, use getzep-graphiti instead.

## How to install / invoke
Zep Cloud needs an account at https://www.getzep.com. The official SDKs are `pip install zep-cloud`
(Python), `npm install @getzep/zep-cloud` (TypeScript) and `go get github.com/getzep/zep-go/v3` (Go);
the examples are in the repository: https://github.com/getzep/zep

## Notes
Surfaced by the Sentinel→Armory feed (practitioner mentions), 2026-09-02. Pending verify → promote.
Checked 2026-09-26: the repository used to be Zep Community Edition, the self-hosted server, and
now holds examples and integrations for Zep Cloud. Its stars, forks and last commit are this repository's own; its mentions are
practitioners naming Zep, the service it serves. Nothing here is taken from getzep-graphiti.
