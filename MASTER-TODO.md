# Armory — Master TODO (living checklist + swarm queue)

The single, **consumable** work queue for growing Armory toward _"the most of every harness
component, brain-connected — for agents, by agents, of agents."_ The nightly loop
(`.github/workflows/autolab.yml` → `ingest/daily-por.md`) and on-demand agent waves **pull from
and add to this list.** Regimented, evals-driven, constraint-driven: whenever an agent finds
something broken, it files a `[ ]` here immediately; whenever it fixes one, it checks it off.

**State (2026-06-01):** 27,044 components / 12 categories. Nightly cron runs + commits daily
(deterministic crawl). Catalog 25,251 → 27,044 over the past week. Hamel test-gate PASS nightly
(it correctly blocked a 4.6%-drift smithery batch on 06-01). **Track F (the chairman's "why am I
still seeing ngram everywhere") is now COMPLETE** — CLI help, docs, issue template, AND the brain
hub/nav notes are all engram-clean; the 3 nightly-ish workflows are consolidated to 2 (autolab +
ci). Real third-party products literally named "engram" remain as catalog data (correct).
**CI gate now runs the full pyramid** — unit + contract + chaos + integration (crawl→promote→catalog)
+ Hamel functional/behavioral + catalog-freshness + armory-mcp vitest + agentic-user CLI E2E —
**green on every push** (verified via `gh`). **Nightly cron verified from the live Action log:** it
runs daily, `npm i -g @anthropic-ai/claude-code` + invokes `claude -p` headless, and is blocked
ONLY on `Credit balance is too low` (= U1); the deterministic loop still commits and the gate
correctly rejected a 4.6%-drift batch (catalog now sits at 0.21% drift). Live-dogfooding the CLI
found + fixed an "an component" grammar bug (8a6ad38b), now regression-guarded by the E2E gate.

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
- [ ] **U2 — Live site is STALE (still shows "engram"): Vercel Root Directory is still `site`.**
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
Current: `ingest/test-pyramid.test.mjs` (L1 unit + contract + chaos) + `ingest/test-gate.mjs` (Hamel L1+L2) + `armory-mcp` vitest, all gated in `ci.yml` (+ catalog-freshness, folded in from the retired catalog.yml). **Nothing ships until it passes.** Expand toward the full pyramid:
- [x] L1 functional (frontmatter schema/slug/type) + L2 behavioral (anti-drift husk check).
- [x] L1 unit + contract (catalog.json `components[]` shape, counts===length, no legacy `engrams` key) + chaos — `ingest/test-pyramid.test.mjs`, 8/8 green, wired into `ci.yml`.
- [x] Catalog-freshness gate folded into `ci.yml` (catalog.json must equal a fresh rebuild; only structural drift fails).
- [ ] **B1** Unit tests for the remaining `ingest/*.mjs` pure functions (deriveInstall, dedup keys) beyond the ones already covered.
- [x] **B2** (9b157a05) Component/integration: crawl→incoming→promote→catalog round-trip on a tmp fixture — `ingest/integration.test.mjs` (promote lands a catalog-ingestible file, dedup, invalid-rejection, dry-run-default). Never touches the live brain.
- [ ] **B4** E2E: `armory install <name> --cli claude|cursor|codex` fetches + writes the right file (sandbox dir). (search E2E now covered by B6; install-write still open.)
- [x] **B5** (9b157a05) Chaos/monkey: empty / no-frontmatter / 2 MB / binary stubs fed to promote — asserts no throw + nothing promoted (`ingest/integration.test.mjs`).
- [x] **B6** (7939a17e) Agentic "as a user" E2E — `cli/test/agentic-user.test.mjs` drives the real built CLI (search hit, no-match graceful, unknown-command non-zero, help engram-free + grammatical). CI builds the CLI then runs it as the final gate. 6/6 green. (LLM-council pass still open as a future layer.)

## Track C — Website (BLOCKED on U2; queue the work so it ships the moment prod redeploys)
- [~] **C1** Local QA done (Chrome MCP @ :3011): homepage renders **27,044 components**, fully engram-free, on-brand (warm-black + amber + Instrument Serif). NOTE: a text-scrape shows "0 components indexed" — that is the `CountUp` animation START value, NOT a bug (it animates to 27,044; confirmed by screenshot). Detail route `/e/[type]/[slug]` exists locally. Prod re-verify still gated on U2.
- [x] **C2** (c99762f4) Graph "primitive" fixed — punch pass: brighter edges (0.08→0.16) + bigger nodes (r 4.5+deg*1.1) so the TYPE_HUE category colors actually read. Browser-verified: faint monochrome blob → vivid colored clusters (12 categories visible by hue). (A full force-graph-LIB swap needs `npm i`, which the local cat-secrets hook blocks; the zero-dep canvas renderer is solid, so the lib swap is optional, not required.)
- [ ] **C3** **Time-slider** (the chairman's signature ask) — scrub catalog growth over time. PLAN: add a temporal field per graph node in `web/src/lib/graph.ts` (use `verified_at`; fallback = catalog index ≈ ingestion order), thread it to `SynapseGraph`, add `<input type=range>` in `graph-client.tsx`, and in the canvas draw loop reveal only nodes whose date ≤ the slider cutoff (audit-trailable from git + AUTOLAB-LOG). Zero-dep — the canvas is already there.
- [x] **C4** Copy verdict — "NOT AN AGGREGATOR FOR HUMANS" is intentional and immediately explained ("This is not a list for people to skim. It is a brain you can read"). On-brand wedge → KEEP. Homepage is engram-free; no human-alienating copy beyond the deliberate stance.
- [~] **C5** Clicked + verified locally: `/` + `/graph` (search-dim, legend, category colors). Still to sweep: `/browse`, a detail page, install-snippet copy buttons, category filters → file a `[ ]` per break.
- [ ] **C6** Queryability/accessibility pass: keyboard nav, focus states, contrast, mobile.

## Track D — Dogfood / break-it agents (the chairman's "agents that try to USE Armory")
- [ ] **D1** A `dogfood` agent that fresh-installs the `@namanparikh/armory` CLI in a clean dir, runs `search`/`install`/`submit`, and files a `[ ]` for anything that errors or surprises. (This session's manual dogfooding already found + fixed Track F — formalize it as a repeatable agent.)
- [ ] **D2** A `break-it` agent that fuzzes the CLI + the site (bad args, missing files, huge queries) and reports crashes.
- [ ] **D3** A `setup-from-scratch` agent that installs Armory as a plugin into each harness (Claude/Cursor/Codex/OpenCode/Gemini) per PLUGIN.md and verifies the MCP server answers.

## Track E — Enrichment (no new crawl)
- [ ] **E1** Per-component `eval_score` (stars / freshness / usage) — Quartermaster seeded this (commit 130459e5); finish coverage.
- [ ] **E2** `ingest/verify-links.mjs` over every `source_url` → flag dead links.
- [ ] **E3** Denser `related[]` graph for thin categories (feeds C2/C3).
- [ ] **E4** npm publish `@namanparikh/armory` (needs Naman's npm token — minor unblock).

## Track F — "engram" leftovers + cleanup — ✅ COMPLETE (2026-06-01, dogfooding the CLI found these)
- [x] **F1** (c0ee9d38) `cli/src/*.ts` + `cli/test/search.test.ts`: noun engram→component; `armory --help` + `armory search --help` verified engram-clean. (Done via the Edit tool / a scoped `node` script — Bash `npm install` trips the `cat-secrets` hook because it reads `~/.npmrc`; built with local `tsc`.)
- [x] **F2** (c0ee9d38) `cli/package.json`: dropped the legacy `"engram"` bin alias (bin is now just `armory`).
- [x] **F3** (c0ee9d38) `docs/architecture.md` + `docs/parallel-dev.md` + `.github/ISSUE_TEMPLATE/submit-component.md`: renamed engram→component.
- [x] **F4** (5858f5ba) brain hub/nav notes: `brain/MOC - Armory.md` (Engram→Armory project + component noun) + the 8 category hub notes (`<type>/<type>.md`) engram→component. **NOT** the third-party `*engram*.md` products (real catalog data — left intact).
- [x] **F5** (046d396a) Consolidated 3 nightly-ish workflows → 2: removed `crawl.yml` (legacy weekly crawl, superseded by autolab's daily crawl+commit) + `catalog.yml` (its unique fail-if-catalog-stale check folded into `ci.yml`). One self-improve loop (autolab) + one CI gate. Zero capability lost.

## Acceptance (every item)
Surgical diff · passes its gates (Track B) · catalog rebuilt + `validate` PASS where relevant ·
committed + pushed · row checked off `[x] — <commit>`. **No detail removed when consolidating.**
