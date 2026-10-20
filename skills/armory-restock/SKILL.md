---
name: armory-restock
description: Use when you maintain the Armory registry and need to refresh it the way the nightly loop does, add a new source, or find out why a nightly run landed nothing: crawl, gate, promote, rebuild, check and commit. Do not use to add one component by hand (use armory-submit).
---

# Restock the armory

The nightly loop (`.github/workflows/autolab.yml`) restocks Armory on its own. This skill runs the same steps in a
clone, so a person or an agent can refresh one source, test a new crawler, or reproduce a failed night.

## Steps

1. **Crawl a source into staging.** `node ingest/crawl-<source>.mjs --apply` writes candidates to
   `incoming/<source>/` (for example `smithery`, `glama`, `mcpso`). Staging is never committed.
2. **Gate before promoting.** `node ingest/test-gate.mjs incoming/<source>`. Only if it passes:
   `node ingest/promote.mjs --from incoming/<source> --to brain/components --apply`.
3. **Rebuild the index.** `node ingest/catalog.mjs` regenerates `catalog.json` from `brain/`.
4. **Refresh the browse folders.** `node ingest/surface.mjs --apply` rewrites the folder READMEs and the one
   "Last updated" stamp.
5. **Run the hard checks.** `node ingest/validate.mjs`, `node ingest/test-gate.mjs`, `node scripts/lint-catalog.mjs`
   and `node scripts/catalog-size.mjs`. If any fails, stop and fix the source; never commit a failing catalog.
6. **Commit** with `chore(autolab): ...` and append one line to `AUTOLAB-LOG.md` with the new total.

## Expected output

The catalog total before and after, the gate and lint verdicts, the sources that failed (with the reason), and the
commit hash, or a plain "no net-new components" when nothing changed.
