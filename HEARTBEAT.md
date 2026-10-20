# HEARTBEAT.md — Armiger

What Armiger, the agent that keeps Armory, does on its own, how often, and what happens when something fails.
The schedule lives in `.github/workflows/`; the receipts are in `AUTOLAB-LOG.md`.

## Schedule

| Check | Frequency | Where | Action on anomaly |
| --- | --- | --- | --- |
| Restock: crawl live registries, gate, promote, rebuild, validate, lint, commit | Daily, 07:00 UTC | `autolab.yml` | A failing gate or lint commits nothing; the catalog stays at its last good state |
| Discovery: `claude -p` finds new sources and writes new crawlers | Nightly, when the `ANTHROPIC_API_KEY` repository secret is funded | `autolab.yml`, step 0 | A credit error raises a visible error; the deterministic restock still runs |
| Stars and renames: backfill missing stars, re-ask a seventh of repositories, fold renamed repositories | Nightly | `autolab.yml`, steps 3a | Continues on error; the next night retries |
| Tests, schema, gate, lint, catalog freshness and size, CLI and MCP builds, fresh install from tarballs | Every push and pull request | `ci.yml` | Red means no ship |
| Review-gated feed: discoveries opened as a pull request instead of a commit | On demand | `crawl-feed.yml` | A person approves before anything lands |

## Health indicators

- **Healthy:** `AUTOLAB-LOG.md` gained a line in the last 26 hours with `gate: PASS`, and CI is green on `main`.
- **Warning:** a source was skipped (a `::warning::crawl-<source> failed` line in the run), or discovery was blocked.
- **Critical:** no new log line for 48 hours, or the gate fails two nights running. Nothing lands until it is fixed.

## Recovery

1. Open the failed run (`gh run list -w autolab-nightly`) and read the first failing step.
2. Reproduce it in a clone with the `armory-restock` skill.
3. Check `LEARNINGS.md` for a known fix; if it is new, fix it, add the rule there, and let the next night verify it.
