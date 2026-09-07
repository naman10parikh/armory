# MEMORY.md — Armiger's Bootstrap Memory

> Armory's OWN long-term memory (bootstrap ≤ 2k tokens — critical facts only). Persona →
> [SOUL.md](./SOUL.md) · brand → [BRAND.md](./BRAND.md) · operations → [AGENTS.md](./AGENTS.md).
> Not a cataloged `memory/` component — this is the file the agent that keeps the registry
> actually boots from. Recall anything deeper with `armory search "<query>"` over the catalogue; a memory-search
> command over THIS file set is written but not yet wired (branch `staged/cli-memory-runlog`).

## What this repo is

Armory — the agent-native registry of every harness component (MCPs, skills, hooks, sub-agents,
rules, CLIs, evals, observability, infrastructure, memory, identity, workflows). 12 categories,
~30,000 components and growing nightly. _Where agents gear up. For agents, by agents, of agents._
Live: `armory-murex.vercel.app` · CLI: `@namanparikh/armory` · keeper persona: **Armiger**.

## The ONE rule (prevents 90% of mistakes)

Two different things live here — never confuse them:

- **Own harness (editable code):** `armory-mcp/ armory-skill/ cli/ scripts/ .claude-plugin/` + root
  identity files (`SOUL.md BRAND.md MEMORY.md CLAUDE.md …`). Exactly one of each, prefixed `armory-*`.
- **The catalog (aggregated data):** the 12 category folders + `brain/` + `catalog.json` + harness
  dot-folder drops (`.claude/skills/<non-armory>`, `.claude/hooks/…`). Thousands of components —
  data, not our code.

## Decisions that stuck (the "why" log)

- **Name:** Engram → Pantheon → **Armory** (CP106, 2026-05). Chosen because it says what it does:
  agents walk in, gear up, walk out armed. Keeper = Armiger (the arms-bearer).
- **`catalog.json` is generated, never hand-edited** — `brain/` (Obsidian graph) is the source of
  truth; `pnpm catalog` produces the index. Hard rule #1, now enforced by a PreToolUse hook
  (`scripts/hooks/protect-catalog.sh`).
- **Hamel test-gate before entry** (`ingest/test-gate.mjs`) — functional + behavioral; a failing
  candidate is skipped and logged, never landed.
- **Self-restocking** — `.github/workflows/autolab.yml` nightly: discover (Darwin DSIP
  Performance-Novelty) → crawl → gate → dedup → validate → commit. Receipt: `AUTOLAB-LOG.md`.
- **No single source is special** — every upstream catalog is just another supplier; dedupe and
  attribute (`source_repo`, `license`, `stars`, `verified_at`, `related:`).
- **Untrusted catalog code never runs on the host** — behavioral vetting happens inside an E2B
  sandbox: `armory sandbox-run <name>` (`cli/src/sandbox.ts`). SOUL.md boundary.
- **Every state-mutating CLI run is audited** — `install` / `submit` / `sandbox-run` append to
  `logs/runs.jsonl` (`cli/src/runlog.ts`, pattern ported from Helios). Inspect: `armory runs`.
- **Two search planes:** `armory search` = the catalog (BM25 over `catalog.json`, "what gear
  exists"); `armory memory-search` = this repo's own knowledge corpus (BM25 over MEMORY/SOUL/
  BRAND/CLAUDE/AGENTS/docs/memory/, "what do WE know / what did we decide").

## Commands (muscle memory)

```bash
pnpm catalog && pnpm validate      # regenerate + check the index (never hand-edit catalog.json)
node ingest/test-gate.mjs          # the gate a candidate must pass
armory search "<need>"             # find gear          armory install <name>   # wire it in
armory memory-search "<q>"         # recall own memory  armory runs             # audit trail
armory sandbox-run <name>          # vet untrusted component inside E2B (needs E2B_API_KEY)
```

## Current state (update when it changes)

- Catalog ≈ 30,400 components (see `AUTOLAB-LOG.md` tail for the live count; gate: PASS).
- Own skills: `armory-skill/` (use the registry) + `.claude/skills/armory-restock|armory-vet-component|armory-memory-recall`.
- Hooks live: SessionStart inventory brief + PreToolUse catalog guard (`.claude/settings.json`).
- Workspaces: `cli/` (tests: `pnpm --filter @namanparikh/armory test`), `armory-mcp/`, `web/`.

---

*Armiger boots from this file · powered by Energy · deeper recall: `armory memory-search`.*
