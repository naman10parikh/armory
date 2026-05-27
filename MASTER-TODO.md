# Armory — Master Crawl & Enrichment Backlog

The central, **consumable** work queue for growing Armory toward _"the most of every
harness component, brain-connected."_ Both the nightly self-improve loop
(`.github/workflows/crawl.yml`) and on-demand agent waves **pull from this list** —
this is the "distributed master to-do list" the agents contribute to and consume from.

**Current: 24,356 components across 12 categories** (2026-05-27, waves 1–3 — +5,921 this session; evals/observability/infra grew 5–10×; mcps 17,138→21,027). High-value crawl queue **drained**.

## How to consume this queue (the protocol)

1. **Claim** the top `QUEUED` row → set it `IN PROGRESS — <who> <date>`.
2. **Write** a deterministic adapter `ingest/crawl-<name>.mjs` following the
   `ingest/crawl-collections.mjs` pattern: `fetch()` → `toEngram()`, `scrub()` all
   text (no `/Users/` paths, no personal names), self-validate each stub via
   `parseFrontmatter`. Emit to a **disjoint** `incoming/<name>/` (zero clobber).
3. **Promote** (coordinator): `node ingest/promote.mjs --from incoming/<name> --to brain/components --apply`
   (dedup, provenance-ranked) → `node ingest/catalog.mjs` → `node ingest/validate.mjs` (must PASS).
4. **Record**: mark the row `DONE — +N (commit)`, append one line to `.claude/cp106/IMPLEMENTATION-GUIDE.md`.
5. **Waves**: ≤5 agents in parallel, disjoint sources, conserve model when weekly budget is high.

## Crawl queue — sources

| Source | Category | Status | Adapter |
| --- | --- | --- | --- |
| PulseMCP (~16K) | mcps | ✅ DONE | `crawl-pulsemcp` |
| awesome-mcp-servers | mcps | ✅ DONE | `migrate-awesome` |
| official `modelcontextprotocol/servers` | mcps | ✅ DONE | `crawl-anthropic` |
| ECC (affaan-m/ecc) | skills/subagents | ✅ DONE | `crawl-ecc` |
| PatrickJS/awesome-cursorrules | rules | ✅ DONE | `crawl-collections` |
| VoltAgent/awesome-claude-code-subagents | subagents | ✅ DONE | `crawl-collections` |
| disler + decider hooks | hooks | ✅ DONE | `crawl-collections` |
| Smithery (registry API) | mcps | ✅ DONE +471 | `crawl-smithery` |
| davila7/claude-code-templates | multi | ✅ DONE +1643 | `crawl-cctemplates` |
| wshobson/agents + commands | subagents/workflows | ✅ DONE +272 | `crawl-wshobson` |
| hesreallyhim/awesome-claude-code | multi | ✅ DONE +14 | `crawl-awesome-cc` |
| Glama (glama.ai API) | mcps | ✅ DONE +1978 | `crawl-glama` |
| anthropics/skills + obra/superpowers | skills | ✅ DONE | `crawl-skillpacks` |
| evals frameworks (promptfoo/deepeval/ragas/inspect/…35) | evals | ✅ DONE +34 | `crawl-evals` |
| observability (OTel/Langfuse/Helicone/Phoenix/…29) | observability | ✅ DONE +29 | `crawl-observability` |
| infrastructure (E2B/Daytona/Modal/Fly/…28) | infrastructure | ✅ DONE +27 | `crawl-infra` |
| mcp.so registry (sitemap) | mcps | ✅ DONE +1382 | `crawl-mcpso` |
| community subagent/skill/rule collections (dl-ezo/vijay/hrh/cookbook) | multi | ✅ DONE +67 | `crawl-more-subagents` + `crawl-more-skills` |
| PulseMCP delta refresh | mcps | ⏸ DEFERRED (≈0 net-new — already have full index; nightly re-run) | `crawl-pulsemcp` |
| more hook collections | hooks | ⏸ DEFERRED (no high-volume net-new repo found) | — |

## Enrichment queue (no new crawl)

| Task | Status |
| --- | --- |
| Per-component `eval_score` (rank by stars / usage / freshness) | ⏳ QUEUED |
| Link verification — `ingest/verify-links.mjs` over every `source_url` | ⏳ QUEUED |
| Denser `related[]` graph for thin categories (`enrichRelated`) | ⏳ QUEUED |
| Per-type landing pages + counts on the site | ⏳ QUEUED |
| npm-publish `@namanparikh/armory` | 🔒 BLOCKED — needs Naman's npm Automation token |

## Acceptance (every item)

adapter committed in `ingest/` · stubs promoted (dedup, **0 invalid**) · catalog
rebuilt · `validate` **PASS** · committed + pushed · row marked `DONE — +N (commit)`.

## CP108 — actual components + multi-harness plugin (2026-05-27)
- ✅ Vendored 2,546 ACTUAL component files → `components/{skills,agents,commands,hooks,rules}/` + harness-native `.claude/ .cursor/` (ingest/vendor.mjs, idempotent).
- ✅ Armory's OWN harness separated from the catalog: `armory-mcp/` (was mcp/) + `cli/` + `armory-skill/` + root plugin manifests; documented in HARNESS.md. No more "two mcp folders" ambiguity.
- ✅ One-install plugin for EVERY harness (Claude Code/Codex/OpenCode/Gemini/Hermes): `.claude-plugin/` (+marketplace.json) `.codex-plugin/` `.hermes-plugin/` `opencode.json` `.gemini/settings.json` + `install.sh`/`.ps1` + PLUGIN.md. Edge vs ECC: live MCP gateway, not a fixed set.
- ✅ README: removed Energy hyperlink; stripped featured "ECC" mentions (one source among many).
