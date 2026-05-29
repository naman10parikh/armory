# repos/ — the source-repo watchlist (the loop keeps tabs)

Armory is built **from** other people's open-source work. This folder is how the
self-improving loop keeps tabs on those upstream sources — so when one of them
ships new gear, Armory knows to go re-crawl it, and when one goes quiet (or gets
archived) it shows up as stale.

| File | What it is |
|---|---|
| `watchlist.json` | hand-curated list of the upstream GitHub repos we crawl, each tagged with the crawler that feeds from it. **Add a repo here and the loop watches it.** |
| `status.json` | **generated** by `ingest/crawl-repos.mjs` — each repo's latest push, star count, and a `stale` flag (stale after `stale_after_days`, default 120). Refreshed nightly by AutoLab. |

```bash
node ingest/crawl-repos.mjs            # refresh status.json from the GitHub API
node ingest/crawl-repos.mjs --offline  # re-summarize the existing status.json, no network
```

The live API registries we also pull from (PulseMCP, Glama, mcp.so, Smithery) are
listed under `api_registries` in `watchlist.json` — they're services, not single repos.

These are the same repos honored in the root README's **"Standing on the shoulders of"** section.
