# Armory — Repo Structure

Four zones. No overlap.

---

## 1. The catalog — details of all 24,658 components (incl. the ~21,253 MCPs)

```
brain/                        ← Obsidian metadata graph (source of truth)
  components/
    mcps/       <slug>.md     ← MCP details (21,253 files)
    skills/     <slug>.md
    hooks/      <slug>.md
    subagents/  <slug>.md
    identity/   <slug>.md
    memory/     <slug>.md
    claudemd-rules/ <slug>.md
    clis-tools/ <slug>.md
    evals/      <slug>.md
    observability/ <slug>.md
    infrastructure/ <slug>.md
    workflows/  <slug>.md
  MOC - Engram.md             ← master index note
catalog.json                  ← generated index (never hand-edited); run `pnpm catalog` to rebuild
```

**Where are the MCP details?** → `brain/components/mcps/<slug>.md`

---

## 2. The gear — actual installable files (~2,546)

```
skills/         <slug>/SKILL.md    ← real component files vendored from upstream repos
subagents/      <slug>.md
workflows/      <slug>.md
hooks/          <slug>.py|json
claudemd-rules/ <slug>.md
mcps/           <slug>.json        ← install configs for all ~21,000 MCPs (generated)
```

Harness-native mirrors (same files, laid out for each CLI):
```
.claude/{skills,agents,commands,hooks,rules}/
.cursor/rules/
```

---

## 3. Armory's own harness — install Armory itself

```
armory-mcp/                   ← the Armory MCP server (search_components / get_component / submit_component)
cli/                          ← the `armory` CLI (armory search / armory install)
armory-skill/                 ← the `armory` skill (teaches agents when to reach into the registry)
.claude-plugin/plugin.json    ← Claude Code plugin manifest
.codex-plugin/plugin.json     ← Codex plugin manifest
.hermes-plugin/plugin.json    ← Hermes plugin manifest
opencode.json                 ← OpenCode config
.gemini/settings.json         ← Gemini CLI config
install.sh / install.ps1      ← auto-detects harness, wires armory-mcp + root type dirs
```

See [HARNESS.md](./HARNESS.md) for the distinction between Armory's own gear and the catalog.
See [PLUGIN.md](./PLUGIN.md) for per-harness install commands.

---

## 4. The machinery — grow + self-improve

```
ingest/
  catalog.mjs                 ← walks brain/components/, writes catalog.json
  validate.mjs                ← validates every engram's frontmatter contract
  vendor.mjs                  ← copies real files from upstream repos into root type dirs
  crawl-*.mjs                 ← per-source crawlers (PulseMCP, Smithery, Glama, …)
  promote.mjs                 ← moves incoming/ → brain/components/ + root type dirs
  verify-links.mjs            ← checks source_url liveness
incoming/                     ← staging area for new engrams before promote
.github/workflows/autolab.yml ← nightly self-improvement pipeline
MASTER-TODO.md                ← tracked work items
AUTOLAB-LOG.md                ← AutoLab run history
```

---

## The one rule

| Prefix / path     | What it is                                      |
|-------------------|-------------------------------------------------|
| `armory-*`        | Armory's own gear (the tool that runs the show) |
| `brain/`          | catalog metadata + detail pages                 |
| `skills/ subagents/ workflows/ hooks/ claudemd-rules/` | actual vendored installable files (repo root) |
| `mcps/`           | generated MCP install configs (~21,000)         |
| `ingest/` + `incoming/` | the machinery that grows the registry     |

No duplicate "components" names. `brain/components/` = catalog pages. Real files live at repo root.
