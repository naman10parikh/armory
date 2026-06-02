# Armory — Master TODO (living checklist + swarm queue)

The single, **consumable** work queue for growing Armory toward _"the most of every harness
component, brain-connected — for agents, by agents, of agents."_ The nightly loop
(`.github/workflows/autolab.yml` → `ingest/daily-por.md`) and on-demand agent waves **pull from
and add to this list.** Regimented, evals-driven, constraint-driven: whenever an agent finds
something broken, it files a `[ ]` here immediately; whenever it fixes one, it checks it off.

**State (2026-06-01):** 27,044 components / 12 categories. Nightly cron runs + commits daily
(deterministic crawl). Catalog 25,251 → 27,044 over the past week. Hamel test-gate PASS nightly
(it correctly blocked a 4.6%-drift smithery batch on 06-01).

---

## 🔴 CHAIRMAN UNBLOCKS (only Naman can clear — everything else is gated on these)

- [ ] **U1 — Claude Code is NOT actually running nightly: `ANTHROPIC_API_KEY` repo secret has NO CREDITS.**
  Verified from the 06-01 Action log: the cron DOES install Claude Code and invoke `claude -p`
  headless with working auth, but it dies instantly on **`Credit balance is too low`**. The
  deterministic crawler keeps the registry growing in the meantime. **Fix:** top up the Anthropic
  account, or set a funded key as the `ANTHROPIC_API_KEY` secret on `naman10parikh/armory`
  (`gh secret set ANTHROPIC_API_KEY -R naman10parikh/armory`). Once funded, the nightly POR
  (`ingest/daily-por.md`) runs real Claude-Code discovery. (Workflow now surfaces this as a clear
  `::error:: CHAIRMAN UNBLOCK` instead of a generic warning.)
- [ ] **U2 — Live site is STALE (still shows "engram" 15×): Vercel Root Directory is still `site`.**
  A prior session renamed `site/ → web/`; Vercel's project Root Directory was never updated, so
  builds fail and `armory-murex.vercel.app` is frozen on the pre-rename build (shows the killed
  "engram" noun; a detail page `/e/mcps/math-mcp` 404s). Local `web/src` is 100% clean. **Fix:**
  Vercel dashboard → `armory` project → Settings → Build & Deployment → **Root Directory: `site` → `web`**
  → Redeploy. (30-second action; unblocks the entire website track below.)

---

## How to consume this queue (protocol)
1. **Claim** a `[ ]` → mark `[~] IN PROGRESS — <who> <date>`.
2. **Do it** surgically (THE FOUR THINGS: minimum diff, touch only what's required).
3. **Gate it** — must pass the relevant gates (see Testing track) before it ships.
4. **Check it off** `[x] — <commit>`; append a line to `AUTOLAB-LOG.md` if it changed the catalog.
5. **Waves:** ≤5 agents in parallel, disjoint files, conserve model when budget is tight.

---

## Track A — Nightly self-improvement loop (the cron → Claude Code → gated ship)
- [x] Cron runs nightly (07:00 UTC), deterministic crawl → dedup-promote → catalog → validate → commit.
- [x] `claude -p` headless wired + auth working (blocked only on U1 credits).
- [x] Workflow surfaces the REAL failure (credit/auth) instead of a generic warning; `claude --version` verified post-install.
- [x] Daily POR routine externalized → `ingest/daily-por.md` (catch up on key files → discovery → gate-aware, never commits).
- [ ] **A1** When U1 clears: confirm a real `claude -p` run produces a new `ingest/crawl-<name>.mjs` + `incoming/<name>/` stubs that pass the gate.
- [ ] **A2** Add a weekly "deep POR" (broader research: read repos/status.json staleness, propose enrichment, not just new sources).
- [ ] **A3** Upload `/tmp/discovery.log` as a workflow artifact so every nightly Claude-Code run is inspectable.

## Track B — Testing pyramid + gates (HMLC + agentic + LLM-council), wired into CI
Current: `ingest/test-gate.mjs` (Hamel L1 functional + L2 behavioral) + `armory-mcp` vitest. Expand toward the full pyramid as CI gates; **nothing ships until it passes.**
- [x] L1 functional (frontmatter schema/slug/type) + L2 behavioral (anti-drift husk check).
- [ ] **B1** Unit tests for every `ingest/*.mjs` pure function (parseFrontmatter, deriveInstall, dedup keys, gradeComponent).
- [ ] **B2** Component/integration: crawl-`<src>` → incoming → promote → catalog round-trip on a fixture.
- [ ] **B3** Contract test: `catalog.json` shape (the `components[]` contract armory-mcp + web depend on) — fail if a field is dropped/renamed.
- [ ] **B4** E2E: `armory search` + `armory install <name> --cli claude|cursor|codex` fetches + writes the right file (sandbox dir).
- [ ] **B5** Chaos/monkey: feed malformed/huge/empty stubs to the gate; assert it rejects without crashing.
- [ ] **B6** Agentic evals — assertion / behavior / trajectory / **user** (an agent actually runs `armory ...` end-to-end) + LLM-council pass.
- [ ] **B7** Wire B1–B6 into a `ci.yml` (PR + push) AND as a pre-promote gate in `autolab.yml`. Red = no ship.

## Track C — Website (BLOCKED on U2; queue the work so it ships the moment prod redeploys)
- [ ] **C1** Re-verify after U2 redeploy: 0 "engram" on prod; detail pages 200 (not 404); homepage count = live catalog (27,044+).
- [ ] **C2** The graph is primitive — rebuild it: evaluate `react-force-graph` / `cosmograph` / `sigma.js`; pick one; render the real `related[]` knowledge graph with category coloring, zoom, node-click → detail.
- [ ] **C3** **Time-slider** on the graph: scrub through catalog growth over time (audit-trailable from git history + `AUTOLAB-LOG.md` + per-component `verified_at`), watch the registry grow night by night.
- [ ] **C4** Copy review (chairman flagged): "Not an aggregator for humans" — keep as on-brand positioning, but reason per-section; ensure no copy alienates a first-time human visitor.
- [ ] **C5** Click EVERY button/route as a real user (Chrome MCP / playwright): search, category filter, harness-tab install snippets + copy, related-link nav, graph interactions. File a `[ ]` per break.
- [ ] **C6** Queryability/accessibility pass: keyboard nav, focus states, contrast, mobile.

## Track D — Dogfood / break-it agents (the chairman's "agents that try to USE Armory")
- [ ] **D1** A `dogfood` agent that fresh-installs the `@namanparikh/armory` CLI in a clean dir, runs `search`/`install`/`submit`, and files a `[ ]` for anything that errors or surprises.
- [ ] **D2** A `break-it` agent that fuzzes the CLI + the site (bad args, missing files, huge queries) and reports crashes.
- [ ] **D3** A `setup-from-scratch` agent that installs Armory as a plugin into each harness (Claude/Cursor/Codex/OpenCode/Gemini) per PLUGIN.md and verifies the MCP server answers.

## Track E — Enrichment (no new crawl)
- [ ] **E1** Per-component `eval_score` (stars / freshness / usage) — Quartermaster seeded this (commit 130459e5); finish coverage.
- [ ] **E2** `ingest/verify-links.mjs` over every `source_url` → flag dead links.
- [ ] **E3** Denser `related[]` graph for thin categories (feeds C2/C3).
- [ ] **E4** npm publish `@namanparikh/armory` (needs Naman's npm token — minor unblock).

## Track F — "engram" leftovers + cleanup (found 2026-06-01 by dogfooding the CLI)
Last session's engram→component rename swept `ingest/ armory-mcp/src web/src` but MISSED these — the CLI `--help` literally still says "engrams", answering the chairman's "Is Ngram a real thing?" = yes, here:
- [ ] **F1** `cli/src/*.ts` (index/install/submit/catalog) + `cli/test/search.test.ts`: rename the noun engram→component (the `armory --help` text, `search`/`get`/`submit`/`list` descriptions all say "engram"). Use the Edit tool (a Bash `node -e fs` rename trips the `cat-secrets` hook). Then `cd cli && npm i && npm run build` and confirm `node dist/index.js --help` has zero "engram".
- [ ] **F2** `cli/package.json`: drop the legacy `"engram": "dist/index.js"` bin alias (keep only `armory`); clean any "engram" in description/keywords.
- [ ] **F3** `docs/architecture.md` + `docs/parallel-dev.md` + `.github/ISSUE_TEMPLATE/submit-component.md`: rename engram→component.
- [ ] **F4** brain hub-note text leftovers (`brain/MOC - Armory.md`, `brain/components/<type>/<type>.md`): "engram" in generated/nav text — regenerate or sweep (NOT the third-party `mcps/*engram*.json` components, which are real catalog data — leave those).
- [ ] **F5** Consolidate stale workflows: there are 3 nightly-ish workflows (`autolab.yml` [current], `crawl.yml`, `catalog.yml`). Confirm `crawl.yml`/`catalog.yml` are superseded by `autolab.yml` and remove the duplicate cron(s) so there's one self-improve loop, not three. (Cruft removal, not detail removal.)

## Acceptance (every item)
Surgical diff · passes its gates (Track B) · catalog rebuilt + `validate` PASS where relevant ·
committed + pushed · row checked off `[x] — <commit>`. **No detail removed when consolidating.**
