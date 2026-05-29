# incoming/ — ephemeral crawl staging (gitignored)

This folder is **scratch space**, not catalog data. It is in `.gitignore` on purpose — nothing here is committed.

## What happens here

The AutoLab loop and the `ingest/crawl-*.mjs` adapters write freshly-crawled
component stubs into `incoming/<source>/` (e.g. `incoming/glama/`, `incoming/smithery/`).
They sit here only until they pass the gate and get promoted:

```
crawl-<source>.mjs --apply   →   incoming/<source>/*.md      (staged here)
test-gate.mjs incoming/<source>  →  Hamel L1+L2 gate         (must pass)
promote.mjs --from incoming/<source> --to brain/components --apply
                              →   brain/components/<type>/    (the real catalog)
catalog.mjs                   →   catalog.json                (re-indexed)
```

After `promote`, brand-new stubs are **moved out** into `brain/components/`.
Anything already in the catalog is reported as a **dup** and left behind as
harmless leftover — which is why this folder can look "full" even when there is
no net-new work. It is safe to delete the contents at any time; the crawlers
re-create what they need on the next run.

**If you want to drain it manually:** `node ingest/promote.mjs --all --to brain/components --apply` then `node ingest/catalog.mjs`.
