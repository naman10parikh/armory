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
