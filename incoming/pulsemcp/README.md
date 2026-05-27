# incoming/pulsemcp — MCP server seeds (PulseMCP)

**Provenance:** PulseMCP public registry, via the REST API endpoint
`https://api.pulsemcp.com/v0beta/servers?count_per_page=100` (alphabetical page)
combined with targeted `?query=<term>` searches across canonical agent-harness
categories (browser, memory, payments, database, observability, security, search,
knowledge, reasoning, messaging, git, issue-tracking). Results were merged,
deduped by source URL, and ranked by `github_stars` to surface the most useful /
popular servers. Curated, not exhaustive — quality over volume.

**Date seeded:** 2026-05-26
**Category:** `mcps`
**Count:** 58 stubs

**Status:** pending verify → promote. These are review-queue stubs. Before
promotion to `brain/components/mcps/`, each needs: `source_url` resolves, license
confirmed (PulseMCP metadata does not declare SPDX license, so all are seeded as
`license: unknown`), and install command verified against the source repo's
`mcpServers` config block.

Description text for each engram is taken from the server's own
`short_description` (falling back to the registry's AI-generated description),
so it reflects the WHEN-to-use signal the maintainer wrote.
