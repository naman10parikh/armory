# Armory MCP over stdio — CP138 T50, recorded 2026-09-26 13:07 UTC

What this checks: a real MCP session with `armory-mcp`: `initialize`, then `tools/list`, then one `tools/call` of
`rank_components` with `{"component": "memory", "limit": 3}`. It was run three ways: the package installed from its
packed tarball and started by its bin (the way `npx` or a harness starts it), the same installed file started by its
real path, and a clone of this repository.

- Source: `main` at `39eeb6f9f`, checked out as a scratch git worktree (`$CLONE`). Node v25.2.1, npm 11.6.2, macOS.
- Production at the time: https://armory-murex.vercel.app, deployment `dpl_GGNZiCj3To4uRSpKH9n1HveGSAkp` (created 05:49 PT
  from `088b55108`; `39eeb6f9f` changes only `scripts/deploy-prod.sh`).
- `$SCRATCH` is a throw-away folder, `$PREFIX` = `$SCRATCH/prefix` the throw-away npm prefix, `$CLONE` =
  `$SCRATCH/armory-evidence` the worktree. Writing those three names in place of the long temp paths is the only edit to
  the output; any other cut is marked `[trimmed: …]`.
- Every run used a temp `HOME`, never a real one. The installed-package runs ran in an empty temp project folder; the
  clone runs ran from the clone's root and wrote only into a temp folder (`--to`).
- Tarball: `armory-mcp-0.1.0.tgz`, sha256 `19fea1d6932c16117474042bc8c8b1998882c21b03578c7eee4c40504cab2180`, 12 files:
  `dist/`, README, LICENSE.
- Client: the Node script at the bottom, newline-delimited JSON-RPC over stdio, protocol version `2025-06-18`. `->` is
  what the client sent, `<-` what the server answered, `[stderr]` the server's log line.

| Run | How the server was started | initialize | tools/list | tools/call `rank_components` |
|---|---|---|---|---|
| A | `armory-mcp`, the installed bin (a symlink) | **no reply**: the process exits 0 at once | not reached | not reached |
| B | `node $PREFIX/lib/node_modules/armory-mcp/dist/index.js` | works: `armory` 0.1.0 | works: 5 tools | **error**: `Cannot find module '$PREFIX/lib/node_modules/lib/rank.mjs'` |
| C | `node armory-mcp/dist/index.js` from a clone | works | works: 5 tools | works: thedotmack-claude-mem 99.9, mempalace 99.8, microsoft-graphrag 99.7; 36 in memory, 65,230 in all |

Why A exits: `armory-mcp/src/index.ts` starts the server only when
`` import.meta.url === `file://${process.argv[1]}` ``. Started through a bin symlink, `process.argv[1]` is the symlink's
path and `import.meta.url` is the file it points to, so the check is false and the process exits without listening.
A four-line check on the same machine shows it: through a symlink, `argv[1]` = `$SCRATCH/symtest/bin/tool` and
`import.meta.url` = `file://$SCRATCH/symtest/real/index.mjs`. `npx -y armory-mcp`, the entry `armory init` writes, starts
the bin the same way, and today stops earlier still, at npm's E404 (see cli.md).

Why B fails the call: `rank_components` and `search_catalog` import `../../lib/rank.mjs`, and `search_components` and
`get_component` read `catalog.json`. Both exist only in a clone.

## Runs A and B: the installed package
```
## A. fresh install, the bin on PATH (how npx or a harness launches it)
$ PATH=$PREFIX/bin:$PATH node mcp-probe.mjs armory-mcp
13:07:33.760 -> {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": {
      "name": "cp138-evidence-probe",
      "version": "1.0.0"
    }
  }
}
13:07:34.053 [probe] no initialize result: {"exitedBeforeReply":{"code":0,"signal":null}}
13:07:34.053 [probe] server exit code=0 signal=null

## B. fresh install, same file launched by its real path
$ node mcp-probe.mjs node $PREFIX/lib/node_modules/armory-mcp/dist/index.js
13:07:34.132 -> {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": {
      "name": "cp138-evidence-probe",
      "version": "1.0.0"
    }
  }
}
13:07:34.393 [stderr] armory-mcp: listening on stdio
13:07:34.404 <- {
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "armory",
      "version": "0.1.0"
    }
  },
  "jsonrpc": "2.0",
  "id": 1
}
13:07:34.405 -> {
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
13:07:34.405 -> {
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
13:07:34.416 <- [trimmed: the tools/list reply, byte-identical to run C's below: 5 tools, search_components, get_component, submit_component, rank_components, search_catalog]
13:07:34.417 -> {
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "rank_components",
    "arguments": {
      "component": "memory",
      "limit": 3
    }
  }
}
13:07:34.422 <- {
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Cannot find module '$PREFIX/lib/node_modules/lib/rank.mjs' imported from $PREFIX/lib/node_modules/armory-mcp/dist/index.js"
      }
    ],
    "isError": true
  },
  "jsonrpc": "2.0",
  "id": 3
}
13:07:34.432 [probe] server exit code=0 signal=null
```

## Run C: from a clone
```
## C. from a clone (the worktree), after cd armory-mcp && npm install && npm run build
$ node mcp-probe.mjs node armory-mcp/dist/index.js     # run from the clone root
13:07:34.510 -> {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": {
      "name": "cp138-evidence-probe",
      "version": "1.0.0"
    }
  }
}
13:07:34.805 [stderr] armory-mcp: listening on stdio
13:07:34.822 <- {
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "armory",
      "version": "0.1.0"
    }
  },
  "jsonrpc": "2.0",
  "id": 1
}
13:07:34.823 -> {
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
13:07:34.823 -> {
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
13:07:34.835 <- {
  "result": {
    "tools": [
      {
        "name": "search_components",
        "title": "Search components",
        "description": "Keyword-rank agent-harness components (components) by name, description, and tags. Use to find the right MCP, skill, hook, sub-agent, or rule for a task.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "minLength": 1,
              "description": "search terms"
            },
            "type": {
              "type": "string",
              "description": "optional: filter to one of the 12 component types"
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 50,
              "default": 10
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "get_component",
        "title": "Get component",
        "description": "Fetch the full markdown of a single component by exact name (frontmatter + body, including its install/invoke block).",
        "inputSchema": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "minLength": 1,
              "description": "exact component name (kebab-case)"
            }
          },
          "required": [
            "name"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "submit_component",
        "title": "Submit component",
        "description": "Validate an component's frontmatter against the contract and drop it into incoming/ for verify + promotion.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "markdown": {
              "type": "string",
              "minLength": 1,
              "description": "the full component markdown (YAML frontmatter + body)"
            }
          },
          "required": [
            "markdown"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "rank_components",
        "title": "Rank components",
        "description": "Rank open-source building blocks by a Universal score (or another axis), sliceable by component type and domain. Use to find the BEST or TRENDING tool in a space — e.g. the top MCP for browser automation, or the leading front-end CLI. Returns ranked JSON with a 0-100 Universal score, GitHub stars, measured test score, and community mentions. The Universal score normalizes each signal within its own kind so a docs page ranks fairly against a 40k-star repo.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "component": {
              "type": "string",
              "description": "filter to one component type: mcp|cli|skill|plugin|hook|subagent|rules|tool|memory|eval|..."
            },
            "domain": {
              "type": "string",
              "description": "filter to one domain: front-end|back-end|browser|payments|ai-agents|database|auth|search|devops|comms|..."
            },
            "sort": {
              "type": "string",
              "enum": [
                "universal",
                "popular",
                "tested",
                "practitioner",
                "stars",
                "name"
              ],
              "default": "universal",
              "description": "ranking axis: universal (default) | popular (stars) | tested | practitioner (mentions) | stars | name"
            },
            "ascending": {
              "type": "boolean",
              "default": false,
              "description": "ascending instead of descending"
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 100,
              "default": 20
            }
          },
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      },
      {
        "name": "search_catalog",
        "title": "Search catalog",
        "description": "Keyword-search the catalog by name + description + tags and return ranked JSON, each hit enriched with its normalized component type, domain, 0-100 Universal score, and primary signal. Optional component and domain filters. Use to find the building blocks that match a task phrase — e.g. 'browser automation' MCPs, or 'oauth' skills. Deterministic keyword relevance, no LLM. Complements rank_components: search finds by words, rank orders a whole slice by score.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "minLength": 1,
              "description": "search terms"
            },
            "component": {
              "type": "string",
              "description": "filter to one component type: mcp|cli|skill|plugin|hook|subagent|rules|tool|memory|eval|..."
            },
            "domain": {
              "type": "string",
              "description": "filter to one domain: front-end|back-end|browser|payments|ai-agents|database|auth|search|devops|comms|..."
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 100,
              "default": 20
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false,
          "$schema": "http://json-schema.org/draft-07/schema#"
        },
        "execution": {
          "taskSupport": "forbidden"
        }
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 2
}
13:07:34.836 -> {
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "rank_components",
    "arguments": {
      "component": "memory",
      "limit": 3
    }
  }
}
13:07:38.035 <- {
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"items\": [\n    {\n      \"name\": \"thedotmack-claude-mem\",\n      \"type\": \"memory\",\n      \"component\": \"memory\",\n      \"domain\": \"ai-agents\",\n      \"vertical\": null,\n      \"url\": \"https://github.com/thedotmack/claude-mem\",\n      \"license\": \"unknown\",\n      \"kind\": \"github-root\",\n      \"contributor\": \"Sentinel\",\n      \"universal\": 99.9,\n      \"exact\": 99.8892,\n      \"evidence\": 3,\n      \"primary\": {\n        \"key\": \"stars\",\n        \"value\": 92936,\n        \"pct\": 99.9,\n        \"label\": \"stars\"\n      },\n      \"verified\": false,\n      \"signals\": {\n        \"stars\": 92936,\n        \"usage\": null,\n        \"tested\": null,\n        \"mentions\": 6,\n        \"forks\": 8174\n      },\n      \"stars\": 92936,\n      \"usage\": null,\n      \"tested\": null,\n      \"mentions\": 6,\n      \"forks\": 8174,\n      \"pushed_at\": \"2026-09-02T03:06:35Z\",\n      \"stale\": false,\n      \"desc\": \"Persistent Context Across Sessions for Every Agent – Captures everything your agent does during sessions, compresses it with AI, and injects relevant context ba\"\n    },\n    {\n      \"name\": \"mempalace\",\n      \"type\": \"memory\",\n      \"component\": \"memory\",\n      \"domain\": \"ai-agents\",\n      \"vertical\": null,\n      \"url\": \"https://github.com/MemPalace/mempalace\",\n      \"license\": \"MIT\",\n      \"kind\": \"github-root\",\n      \"contributor\": null,\n      \"universal\": 99.8,\n      \"exact\": 99.8136,\n      \"evidence\": 3,\n      \"primary\": {\n        \"key\": \"stars\",\n        \"value\": 58897,\n        \"pct\": 99.8,\n        \"label\": \"stars\"\n      },\n      \"verified\": false,\n      \"signals\": {\n        \"stars\": 58897,\n        \"usage\": null,\n        \"tested\": null,\n        \"mentions\": 2,\n        \"forks\": 7548\n      },\n      \"stars\": 58897,\n      \"usage\": null,\n      \"tested\": null,\n      \"mentions\": 2,\n      \"forks\": 7548,\n      \"pushed_at\": \"2026-09-05T19:40:56Z\",\n      \"stale\": false,\n      \"desc\": \"Use when you want an agent memory system whose recall quality has actually been benchmarked rather than asserted.\"\n    },\n    {\n      \"name\": \"microsoft-graphrag\",\n      \"type\": \"memory\",\n      \"component\": \"memory\",\n      \"domain\": \"search\",\n      \"vertical\": \"ai-infra\",\n      \"url\": \"https://github.com/microsoft/graphrag\",\n      \"license\": \"unknown\",\n      \"kind\": \"github-root\",\n      \"contributor\": \"Sentinel\",\n      \"universal\": 99.7,\n      \"exact\": 99.6992,\n      \"evidence\": 3,\n      \"primary\": {\n        \"key\": \"stars\",\n        \"value\": 35783,\n        \"pct\": 99.7,\n        \"label\": \"stars\"\n      },\n      \"verified\": false,\n      \"signals\": {\n        \"stars\": 35783,\n        \"usage\": null,\n        \"tested\": null,\n        \"mentions\": 3,\n        \"forks\": 3754\n      },\n      \"stars\": 35783,\n      \"usage\": null,\n      \"tested\": null,\n      \"mentions\": 3,\n      \"forks\": 3754,\n      \"pushed_at\": \"2026-09-02T01:41:10Z\",\n      \"stale\": false,\n      \"desc\": \"A modular graph-based Retrieval-Augmented Generation (RAG) system\"\n    }\n  ],\n  \"total\": 36,\n  \"sort\": \"universal\",\n  \"dir\": \"desc\",\n  \"component\": \"memory\",\n  \"domain\": null,\n  \"vertical\": null,\n  \"facets\": {\n    \"components\": [\n      {\n        \"key\": \"mcp\",\n        \"count\": 61713\n      },\n      {\n        \"key\": \"skill\",\n        \"count\": 1131\n      },\n      {\n        \"key\": \"subagent\",\n        \"count\": 724\n      },\n      {\n        \"key\": \"workflow\",\n        \"count\": 719\n      },\n      {\n        \"key\": \"rules\",\n        \"count\": 461\n      },\n      {\n        \"key\": \"cli\",\n        \"count\": 146\n      },\n      {\n        \"key\": \"hook\",\n        \"count\": 134\n      },\n      {\n        \"key\": \"infra\",\n        \"count\": 56\n      },\n      {\n        \"key\": \"eval\",\n        \"count\": 38\n      },\n      {\n        \"key\": \"identity\",\n        \"count\": 38\n      },\n      {\n        \"key\": \"memory\",\n        \"count\": 36\n      },\n      {\n        \"key\": \"observability\",\n        \"count\": 34\n      }\n    ],\n    \"domains\": [\n      {\n        \"key\": \"back-end\",\n        \"count\": 25816\n      },\n      {\n        \"key\": \"ai-agents\",\n        \"count\": 12246\n      },\n      {\n        \"key\": \"other\",\n        \"count\": 6534\n      },\n      {\n        \"key\": \"search\",\n        \"count\": 4883\n      },\n      {\n        \"key\": \"database\",\n        \"count\": 2792\n      },\n      {\n        \"key\": \"front-end\",\n        \"count\": 2776\n      },\n      {\n        \"key\": \"observability\",\n        \"count\": 2419\n      },\n      {\n        \"key\": \"auth\",\n        \"count\": 2391\n      },\n      {\n        \"key\": \"devops\",\n        \"count\": 1331\n      },\n      {\n        \"key\": \"browser\",\n        \"count\": 1171\n      },\n      {\n        \"key\": \"comms\",\n        \"count\": 1078\n      },\n      {\n        \"key\": \"github-vcs\",\n        \"count\": 1021\n      },\n      {\n        \"key\": \"payments\",\n        \"count\": 772\n      }\n    ],\n    \"verticals\": [\n      {\n        \"key\": \"finance\",\n        \"count\": 4778\n      },\n      {\n        \"key\": \"ai-infra\",\n        \"count\": 3607\n      },\n      {\n        \"key\": \"security\",\n        \"count\": 3312\n      },\n      {\n        \"key\": \"productivity\",\n        \"count\": 2193\n      },\n      {\n        \"key\": \"marketing\",\n        \"count\": 1397\n      },\n      {\n        \"key\": \"data-analytics\",\n        \"count\": 1206\n      },\n      {\n        \"key\": \"legal\",\n        \"count\": 1129\n      },\n      {\n        \"key\": \"devtools\",\n        \"count\": 1008\n      },\n      {\n        \"key\": \"education\",\n        \"count\": 574\n      },\n      {\n        \"key\": \"healthcare\",\n        \"count\": 489\n      },\n      {\n        \"key\": \"e-commerce\",\n        \"count\": 468\n      },\n      {\n        \"key\": \"gaming\",\n        \"count\": 396\n      }\n    ],\n    \"kinds\": [\n      {\n        \"key\": \"github-root\",\n        \"count\": 57316\n      },\n      {\n        \"key\": \"github-file\",\n        \"count\": 3552\n      },\n      {\n        \"key\": \"registry\",\n        \"count\": 3126\n      },\n      {\n        \"key\": \"website\",\n        \"count\": 1233\n      },\n      {\n        \"key\": \"package\",\n        \"count\": 3\n      }\n    ],\n    \"stale\": 8,\n    \"total\": 65230\n  }\n}"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 3
}
13:07:38.069 [probe] server exit code=0 signal=null
```

## The client
```js
// Minimal MCP stdio client: initialize -> notifications/initialized -> tools/list -> tools/call.
// Prints every JSON-RPC message sent (->) and received (<-), stderr lines, and the exit code.
// Usage: node mcp-probe.mjs <cmd> [args...]   (env passes through)
import { spawn } from "node:child_process";

const [cmd, ...args] = process.argv.slice(2);
const KILL_AFTER_MS = 90_000;
const STEP_WAIT_MS = 60_000;

const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], env: process.env });
const pending = new Map();
let buf = "";
let exited = null;

const stamp = () => new Date().toISOString().slice(11, 23);
const show = (dir, msg) => console.log(`${stamp()} ${dir} ${JSON.stringify(msg, null, 2)}`);

child.stdout.on("data", (chunk) => {
  buf += chunk.toString("utf8");
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { console.log(`${stamp()} <- (non-JSON stdout) ${line}`); continue; }
    show("<-", msg);
    if (msg.id !== undefined && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  }
});
child.stderr.on("data", (chunk) => {
  for (const l of chunk.toString("utf8").split("\n")) if (l.trim()) console.log(`${stamp()} [stderr] ${l}`);
});
const exitP = new Promise((res) => child.on("exit", (code, signal) => { exited = { code, signal }; res(exited); }));
child.on("error", (err) => console.log(`${stamp()} [spawn error] ${err.message}`));
const killer = setTimeout(() => { console.log(`${stamp()} [probe] kill after ${KILL_AFTER_MS} ms`); child.kill("SIGTERM"); }, KILL_AFTER_MS);

function send(msg) {
  show("->", msg);
  if (exited) return;
  child.stdin.write(JSON.stringify(msg) + "\n");
}
function request(id, method, params) {
  const p = new Promise((res) => pending.set(id, res));
  send(params === undefined ? { jsonrpc: "2.0", id, method } : { jsonrpc: "2.0", id, method, params });
  const timeout = new Promise((res) => setTimeout(() => res({ timeout: true }), STEP_WAIT_MS).unref());
  return Promise.race([p, exitP.then((e) => ({ exitedBeforeReply: e })), timeout]);
}

const init = await request(1, "initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "cp138-evidence-probe", version: "1.0.0" },
});
if (init.result) {
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  const list = await request(2, "tools/list");
  if (list.result) {
    await request(3, "tools/call", { name: "rank_components", arguments: { component: "memory", limit: 3 } });
  } else console.log(`${stamp()} [probe] no tools/list result: ${JSON.stringify(list)}`);
} else console.log(`${stamp()} [probe] no initialize result: ${JSON.stringify(init)}`);

child.stdin.end();
const done = await Promise.race([exitP, new Promise((r) => setTimeout(() => r(null), 5000).unref())]);
if (!done) { child.kill("SIGTERM"); await exitP; }
clearTimeout(killer);
console.log(`${stamp()} [probe] server exit code=${exited?.code} signal=${exited?.signal}`);
```

---

## Armory MCP over stdio — CP138 T21

```
```

The CP138 T21 MCP record (2026-09-07) is in cli.md, under "MCP over stdio (`armory-mcp`)".
