# Armory surface transcripts — CP138 T50, recorded 2026-09-26 12:58–13:08 UTC

What this checks: whether the CLI works for someone who installs the package, not a clone of this repository. It does
not yet. The packed tarball holds `dist/` only, and `search`, `rank` and `install` read `catalog.json` and
`lib/rank.mjs` from the repository root.

- Source: `main` at `39eeb6f9f`, checked out as a scratch git worktree (`$CLONE`). Node v25.2.1, npm 11.6.2, macOS.
- Production at the time: https://armory-murex.vercel.app, deployment `dpl_GGNZiCj3To4uRSpKH9n1HveGSAkp` (created 05:49 PT
  from `088b55108`; `39eeb6f9f` changes only `scripts/deploy-prod.sh`).
- `$SCRATCH` is a throw-away folder, `$PREFIX` = `$SCRATCH/prefix` the throw-away npm prefix, `$CLONE` =
  `$SCRATCH/armory-evidence` the worktree. Writing those three names in place of the long temp paths is the only edit to
  the output; any other cut is marked `[trimmed: …]`.
- Every run used a temp `HOME`, never a real one. The installed-package runs ran in an empty temp project folder; the
  clone runs ran from the clone's root and wrote only into a temp folder (`--to`).
- Tarball: `namanparikh-armory-0.1.0.tgz`, sha256 `7985602f72dc937feca622d65e6a5ef6ba78af698813a6efad6395a1d45cfc91`.

| Step | Command | Result |
|---|---|---|
| Build | `cd cli && npm install --no-audit --no-fund && npm run build` | works |
| Pack | `npm pack --pack-destination $SCRATCH` | works: 24 files, `dist/`, README, LICENSE. No `catalog.json`, no `lib/rank.mjs` |
| Install | `npm install -g --prefix $PREFIX namanparikh-armory-0.1.0.tgz` | works |
| Search | `armory search memory` | **fails**, exit 1: `catalog.json not found` |
| Rank | `armory rank --component memory --limit 5` | **fails**, exit 1: `Cannot find module …/lib/rank.mjs` |
| Install, dry run | `armory install github-mcp --cli claude --dry-run` | **fails**, exit 1: `catalog.json not found` |
| Init | `armory init --claude` | writes `.mcp.json` with `npx -y armory-mcp`; npm answers that with E404 because `armory-mcp` is not published |
| Same, with `ENGRAM_ROOT=$CLONE` | `search`, `install --dry-run` | search still fails on `lib/rank.mjs`; the dry run works |
| The README's path, from a clone | `node cli/dist/index.js …` | all four work |

Why: `cli/src/index.ts` imports `../../lib/rank.mjs`, a file outside the package, and `cli/src/catalog.ts` walks up from
`dist/` looking for `catalog.json`. Both resolve only inside a clone. Two smaller notes: `pnpm install --frozen-lockfile`
stops with `ERR_PNPM_OUTDATED_LOCKFILE` because `pnpm-lock.yaml` lists no specifiers for `armory-mcp`, so the build used
`npm install`, as `ci.yml` does; and the dry run labels a file it would create `[created]`, which reads as done.

## Build (in the worktree)
```
$ cd cli && npm install --no-audit --no-fund && npm run build

added 48 packages in 6s

> @namanparikh/armory@0.1.0 build
> tsc

exit=0

$ cd armory-mcp && npm install --no-audit --no-fund && npm run build

added 138 packages in 4s

> armory-mcp@0.1.0 build
> tsc

exit=0
```

## Pack
```
$ cd cli && npm pack --pack-destination $SCRATCH
npm notice
npm notice 📦  @namanparikh/armory@0.1.0
npm notice Tarball Contents
npm notice 1.1kB LICENSE
npm notice 1.9kB README.md
npm notice 968B dist/catalog.d.ts
npm notice 4.7kB dist/catalog.js
npm notice 4.8kB dist/catalog.js.map
npm notice 1.1kB dist/fetch.d.ts
npm notice 9.9kB dist/fetch.js
npm notice 9.6kB dist/fetch.js.map
npm notice 31B dist/index.d.ts
npm notice 13.2kB dist/index.js
npm notice 14.5kB dist/index.js.map
npm notice 500B dist/init.d.ts
npm notice 1.3kB dist/init.js
npm notice 1.2kB dist/init.js.map
npm notice 846B dist/install.d.ts
npm notice 13.2kB dist/install.js
npm notice 11.8kB dist/install.js.map
npm notice 182B dist/submit.d.ts
npm notice 2.8kB dist/submit.js
npm notice 2.7kB dist/submit.js.map
npm notice 1.1kB dist/targets.d.ts
npm notice 6.5kB dist/targets.js
npm notice 6.3kB dist/targets.js.map
npm notice 970B package.json
npm notice Tarball Details
npm notice name: @namanparikh/armory
npm notice version: 0.1.0
npm notice filename: namanparikh-armory-0.1.0.tgz
npm notice package size: 28.5 kB
npm notice unpacked size: 111.4 kB
npm notice shasum: a129ab0fdd7b6ef657ef5ce63950cdcc01c03f3d
npm notice integrity: sha512-EUsKGeJs82bIf[...]8iUjTOd8DFtcg==
npm notice total files: 24
npm notice
namanparikh-armory-0.1.0.tgz
exit=0

$ cd armory-mcp && npm pack --pack-destination $SCRATCH
npm notice
npm notice 📦  armory-mcp@0.1.0
npm notice Tarball Contents
npm notice 1.1kB LICENSE
npm notice 1.3kB README.md
npm notice 899B dist/catalog.d.ts
npm notice 3.3kB dist/catalog.js
npm notice 3.9kB dist/catalog.js.map
npm notice 140B dist/index.d.ts
npm notice 9.4kB dist/index.js
npm notice 7.7kB dist/index.js.map
npm notice 255B dist/submit.d.ts
npm notice 2.5kB dist/submit.js
npm notice 2.6kB dist/submit.js.map
npm notice 911B package.json
npm notice Tarball Details
npm notice name: armory-mcp
npm notice version: 0.1.0
npm notice filename: armory-mcp-0.1.0.tgz
npm notice package size: 10.1 kB
npm notice unpacked size: 33.9 kB
npm notice shasum: 5fd1a0c1ab1108720e0c1e02bbbed029f94182fc
npm notice integrity: sha512-yHg2Zef1Rly+c[...]WCzwMaJcMXDRg==
npm notice total files: 12
npm notice
armory-mcp-0.1.0.tgz
exit=0
```

## Install into a throw-away prefix
```
$ npm install -g --prefix $PREFIX $SCRATCH/namanparikh-armory-0.1.0.tgz

added 3 packages in 357ms
exit=0

$ npm install -g --prefix $PREFIX $SCRATCH/armory-mcp-0.1.0.tgz

added 95 packages in 1s
exit=0

$ ls $PREFIX/bin
[trimmed: ls -la columns cut to name and link target]
armory -> ../lib/node_modules/@namanparikh/armory/dist/index.js
armory-mcp -> ../lib/node_modules/armory-mcp/dist/index.js
```

## The installed CLI, in an empty project with an empty HOME
```
$ which armory
$PREFIX/bin/armory
exit=0

$ armory --version
0.1.0
exit=0

$ armory search memory
armory: catalog.json not found at $PREFIX/lib/node_modules/@namanparikh/catalog.json — run `pnpm catalog` first.
exit=1

$ armory rank --component memory --limit 5
armory: Cannot find module '$PREFIX/lib/node_modules/@namanparikh/lib/rank.mjs' imported from $PREFIX/lib/node_modules/@namanparikh/armory/dist/index.js
exit=1

$ armory install github-mcp --cli claude --dry-run
install failed: catalog.json not found at $PREFIX/lib/node_modules/@namanparikh/catalog.json — run `pnpm catalog` first.
exit=1

$ armory init --claude
Armory MCP → claude
  ✓ created $SCRATCH/t50/project/.mcp.json
  restart the harness, then ask it to search Armory — e.g. "find a browser MCP"
exit=0

$ find . -type f | sort
./.mcp.json
exit=0

$ cat .mcp.json
{
  "mcpServers": {
    "armory": {
      "command": "npx",
      "args": [
        "-y",
        "armory-mcp"
      ]
    }
  }
}
exit=0

$ ls -A $HOME
exit=0
```

## Diagnostics: the override, the MCP entry `init` writes, and the README's path from a clone
```
## (1) fresh install + ENGRAM_ROOT pointed at a clone
$ ENGRAM_ROOT=$CLONE armory search memory
armory: Cannot find module '$PREFIX/lib/node_modules/@namanparikh/lib/rank.mjs' imported from $PREFIX/lib/node_modules/@namanparikh/armory/dist/index.js
exit=1

$ ENGRAM_ROOT=$CLONE armory install github-mcp --cli claude --dry-run

[dry-run] would install github-mcp [mcps] → claude
  source: https://github.com/github/github-mcp-server

  ✓ mcp   github-mcp → $SCRATCH/t50/project/.mcp.json (docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server)

Next steps:
  - Restart Claude Code to load the MCP server.
exit=0

## (2) the MCP entry armory init writes, for a new user (empty HOME, nothing installed)
$ perl -e 'alarm 60; exec @ARGV' npx -y armory-mcp < /dev/null
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/armory-mcp - Not found
npm error 404
npm error 404  The requested resource 'armory-mcp@*' could not be found or you do not have permission to access it.
npm error 404
npm error 404 Note that you can also install from a
npm error 404 tarball, folder, http url, or git url.
npm notice
npm notice New minor version of npm available! 11.6.2 -> 11.20.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.20.0
npm notice To update run: npm install -g npm@11.20.0
npm notice
npm error A complete log of this run can be found in: $SCRATCH/t50/home2/.npm/_logs/2026-09-26T13_07_02_498Z-debug-0.log
exit=1

## (3) the README's documented path: from a clone, after cd cli && npm install && npm run build
$ node cli/dist/index.js search memory --limit 5

Top 5 for "memory"  ·  2326 matches

  1  98.5  doobidoo-mcp-memory-service [mcp] search stars 1,920
      Universal memory service providing semantic search, persistent storage, and autonomous memory co
      https://github.com/doobidoo/mcp-memory-service
  2    98  claudiodrews-memory-os [memory] ai-agents stars 1,355
      Use when you want layered memory — structured facts, recall and an auto-curated wiki — running l
      https://github.com/ClaudioDrews/memory-os
  3  95.2  varun29ankus-shodh-memory [mcp] ai-agents stars 275
      Cognitive memory for AI agents with Hebbian learning, 3-tier architecture, and knowledge graphs.
      https://github.com/varun29ankuS/shodh-memory
  4  92.1  jean-technologies-jean-memory [memory] observability stars 170
      Use when you want mem0-style and graph-style memory combined behind one interface.
      https://github.com/jean-technologies/jean-memory
  5  83.2  ai-memory [mcp] database stars 48
      Production-ready semantic memory management server that stores, retrieves, and manages contextua
      https://github.com/scanadi/mcp-ai-memory

exit=0

$ node cli/dist/index.js rank --component memory --limit 5

Top 5 in memory  ·  36 of 65,230 · by universal desc

  1  99.9  thedotmack-claude-mem [memory] ai-agents ★92,936 ♦6
      Persistent Context Across Sessions for Every Agent – Captures everything your agent does during 
      https://github.com/thedotmack/claude-mem
  2  99.8  mempalace [memory] ai-agents ★58,897 ♦2
      Use when you want an agent memory system whose recall quality has actually been benchmarked rath
      https://github.com/MemPalace/mempalace
  3  99.7  microsoft-graphrag [memory] search ★35,783 ♦3
      A modular graph-based Retrieval-Augmented Generation (RAG) system
      https://github.com/microsoft/graphrag
  4  99.7  garrytan-gbrain [memory] ai-agents ★29,460 ♦16
      Garry's Opinionated OpenClaw/Hermes Agent Brain
      https://github.com/garrytan/gbrain
  5  99.7  volcengine-openviking [memory] ai-agents ★35,893 ♦2
      Use when an agent's memory, retrieved knowledge and learned skills should live in one store that
      https://github.com/volcengine/OpenViking

exit=0

$ node cli/dist/index.js install github-mcp --cli claude --dry-run --to $SCRATCH/t50/project3

[dry-run] would install github-mcp [mcps] → claude
  source: https://github.com/github/github-mcp-server

  ✓ mcp   github-mcp → $SCRATCH/t50/project3/.mcp.json (docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server) [created]

Next steps:
  - Restart Claude Code to load the MCP server.
exit=0

$ node cli/dist/index.js init --claude --to $SCRATCH/t50/project3
Armory MCP → claude
  ✓ created $SCRATCH/t50/project3/.mcp.json
  restart the harness, then ask it to search Armory — e.g. "find a browser MCP"
exit=0

$ cat $SCRATCH/t50/project3/.mcp.json
{
  "mcpServers": {
    "armory": {
      "command": "npx",
      "args": [
        "-y",
        "armory-mcp"
      ]
    }
  }
}
exit=0
```

---

# Armory surface transcripts — CP138 T21, recorded 2026-09-07T07:23:18Z

Prod was 402 DEPLOYMENT_DISABLED account-wide (C-07), so these exercise the CLI and MCP
surfaces locally against the same catalogue the site serves.

## `armory search "agent memory"`
```

Top 10 for "agent memory"  ·  6872 matches

  1     —  agent-memory-systems [skill] database 
      Memory is the cornerstone of intelligent agents. Without it, every interaction starts from zero.
      https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/agent-memory-systems/SKILL.md
  2     —  agent-memory-mcp [skill] ai-agents 
      A hybrid memory system that provides persistent, searchable knowledge management for AI agents (
      https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/ai-research/agent-memory-mcp/SKILL.md
  3  60.4  g1itchbot8888-del-agent-memory [mcp] ai-agents stars 7
      Three-layer memory system for agents (identity/active/archive) with semantic search, graph relat
      https://github.com/g1itchbot8888-del/agent-memory
```

## `armory rank --component memory --limit 5`
```

Top 5 in memory  ·  17 of 64,849 · by universal desc

  1    99  letta-ai-letta [memory] ai-agents ★24,552 ♦18
      Platform for stateful agents: AI with advanced memory that can learn and self-improve over time.
      https://github.com/letta-ai/letta
  2  98.9  garrytan-gbrain [memory] ai-agents ★29,460 ♦16
      Garry's Opinionated OpenClaw/Hermes Agent Brain
      https://github.com/garrytan/gbrain
  3  96.1  plastic-labs-honcho [memory] ai-agents ★6,980 ♦6
      Memory library for building stateful agents
      https://github.com/plastic-labs/honcho
```

## `armory get letta-ai-letta`
```
---
name: letta-ai-letta
type: memory
description: >
  Platform for stateful agents: AI with advanced memory that can learn and self-improve over time.
source_repo: letta-ai/letta
source_url: https://github.com/letta-ai/letta
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: experimental
stars: 24552
eval_score: null
mentions: 18
verified_at: 2026-09-02
```

## MCP over stdio (`armory-mcp`)

```
initialize → {"name": "armory", "version": "0.1.0"}
tools/list → search_components, get_component, submit_component, rank_components, search_catalog
tools/call rank_components{component:memory,limit:3} →
{
  "items": [
    {
      "name": "letta-ai-letta",
      "type": "memory",
      "component": "memory",
      "domain": "ai-agents",
      "vertical": null,
      "url": "https://github.com/letta-ai/letta",
      "license": "unknown",
      "kind": "github-root",
      "universal": 99,
      "evidence": 3,
      "primary": {
        "key": "stars",
        "value": 24552,
        "pct": 99.6,
        "label": "stars"
      },
      "verified": false,
      "signals": {
        "stars": 24552,
        "usage": null,
        "tested": null,
        "mentions": 18,
        "forks": 2609
      }
```

## `armory init --claude` (fresh directory)
```
Armory MCP → claude
  ✓ created /private/var/folders/18/n4yddnhj19q7h0kz0g1nd78m0000gn/T/tmp.2QhTbbQ1Wp/.mcp.json
  restart the harness, then ask it to search Armory — e.g. "find a browser MCP"
exit=0
--- files written ---
./.mcp.json
```
