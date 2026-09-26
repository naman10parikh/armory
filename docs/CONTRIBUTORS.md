# Contributors

Armory also learns from **contributors**: products or projects that watch which tools practitioners
actually use and report them. A contributor never writes to the catalog. It sends one JSON file per run
(a *feed*), and the feed goes through the same gated intake as every other submission: validate, test
gate, promote, pull request. The pull request merges itself only when those gates pass.

## Who contributes today

| Contributor | What it watches | What it has added (2026-09-26) | How a row shows it |
| --- | --- | --- | --- |
| **Sentinel** | Practitioner notes from X bookmarks, Instagram saved reels, TikTok and the web; each note's `**Tools:**` line | 100 rows, and mention counts on 129 rows | The tag `sentinel-feed`, shown on the site as "Contributed by Sentinel" |

## The feed format

One JSON file with three lists of mentions, plus an optional list of trial results. A tool is one object in
exactly one of the three mention lists.

```json
{
  "generated_at": "2026-09-26T01:19:51",
  "source": "what the contributor read, in words",
  "existing":   [{ "name": "Codex", "urls": ["https://github.com/openai/codex"], "mentions": 273, "stars": 120759, "notes": ["…"] }],
  "new":        [{ "name": "Agent-Reach", "urls": ["https://github.com/Panniantong/Agent-Reach"], "mentions": 4, "stars": 85496, "notes": ["…"] }],
  "unresolved": [{ "name": "ChatGPT", "urls": [], "mentions": 196, "stars": null, "notes": ["…"] }],
  "tested":     [{ "tool": "LangGraph", "repo": "https://github.com/langchain-ai/langgraph", "outcome": "ran", "eval_score": 1, "one_line": "…", "date": "2026-09-26", "agent_component": true }]
}
```

- **`existing`**: the tool already has a row. Its `mentions` becomes that row's practitioner signal, and it
  only ever goes up.
- **`new`**: a tool with a link and no row yet. It gets a row only if the link is a GitHub repository with
  **100 or more stars** and **3 or more notes** name it. A passing hands-on trial in `tested` stands in for
  the 3 notes when the contributor's model check calls the tool an agent component; the stars still apply.
- **`unresolved`**: a name with no link. It is reported and nothing more. The contributor's own resolver
  can find the repository later.
- **`mentions`** counts independent notes, not how many times one note repeats a name.
- **A mention reaches a row only through a link**: one cited in the note, or a name-to-repository match
  that a model has checked. Matching on a name alone once put "Claude Code" ×419 on a docs page row, and
  36% of automatic same-name matches turned out to be different projects (Sentinel, 2026-09-26).
- **`tested`**: one entry per hands-on trial. `eval_score` is 1 when the tool installed and its documented
  first run did what the docs say, 0 when the install or that run failed, and null when it was not run far
  enough to say. It becomes the row's Tested signal on the row with the same GitHub repository, the latest
  trial winning, and `verified_at` moves to the trial's date. It never creates a row on its own, and a null
  never clears a score (`ingest/tested.mjs`). `agent_component` is the contributor's model check: true when the
  tool is a part of an agent (an MCP server, skill, tool, eval, sandbox and so on), false for general software,
  an end-user application or a model. Only `true` lets a passing trial stand in for the 3 notes.

## Plugging in a new contributor

1. Write the feed above, one file per run.
2. Dry run: `node scripts/ingest-sentinel-feed.mjs --source <name> --feed <file>`
3. Apply, then the same steps Sentinel's sync runs (`sentinel/scripts/armory-sync-pr.sh` is the worked
   example): `--apply`, `node scripts/persist-signals-to-brain.mjs --apply`, `node ingest/catalog.mjs`,
   `node ingest/validate.mjs`, `node ingest/test-gate.mjs incoming/<name>`,
   `node ingest/promote.mjs --from incoming/<name> --to brain/components --apply`, then a pull request.
4. New rows carry the tag `<name>-feed`, and the site shows "Contributed by &lt;Name&gt;".

Attribution names the product or project, never a person, and never an internal employee.
