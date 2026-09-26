# Shelf fit: Sandbox, Tools and Dispatch (proposal)

CP138 T23, 26 September 2026. Status: **built** later the same day (PR E); what was built, and the
numbers after it, are in "Built" at the end. Written first as a proposal: the brief allowed an hour, doing
this properly takes longer (below), so this page recorded the evidence and the smallest honest fix.

## The problem

Each /stack shelf lists the engine's rows for one or two coarse classes (`aggregates` in
`web/src/data/stack.json`). Those classes come from the crawl's folders, which are grab-bags, so three
shelves rank mostly the wrong kind of thing. The scores are right about evidence; the shelves are
wrong about kind.

Measured on the catalog of 26 September 2026 (65,228 rows), with the gate below:

| Shelf | Class it lists | Ranked rows | Top 20 that pass | All that pass | Picks that pass |
|---|---|---|---|---|---|
| Sandbox | `infra` | 31 | 4 | 9 | 3 of 3 |
| Tools | `cli`, `tool` | 132 | 7 | 38 | 2 of 3 (crawl4ai fails) |
| Dispatch | `workflow` | 60 | 6 | 14 | 1 of 2 (pocketflow fails) |

- **Sandbox** holds browser automation (browser-use, browserbase, skyvern, nanobrowser, browserless,
  steel-browser), inference engines (llama.cpp, vLLM, SGLang), a model gateway, a payments kit, a tunnel
  and two computer-use agents. The shelf's top score is a browser library's.
- **Tools** starts with four agents (openclaw, codex, AutoGPT, opencode), then an editor, a database and
  a crawling service among the command-line tools.
- **Dispatch** mixes orchestrators with tutorials and guides (learn-claude-code, the Ralph playbook,
  learn-agentic-ai), 2023 paper code (ReAct, Reflexion), a protocol repository (A2A) and a dump of
  system prompts.

## The smallest honest fix: a purpose-word gate per shelf

A row is ranked on a shelf only when its name and description say it does that shelf's job. Rows that
fail stay in the catalog, in search and on their detail pages; the shelf lists them under its ranked
rows as "Also filed here", so nothing disappears. The gate belongs in `lib/rank.mjs` (a
`fitsShelf(row, shelf)` beside `rankRows`) so the site, `/api/rank`, the CLI and the MCP server agree.

The words used for the measurements above:

| Shelf | Must mention | Must not be |
|---|---|---|
| Sandbox | sandbox, microVM, Firecracker, isolation, container, virtual machine, code execution or interpreter, running untrusted or AI-generated code, dev environment, workspace | — |
| Tools | CLI, command line, terminal, TUI, shell | described as an autonomous or AI coding agent, or a personal AI assistant |
| Dispatch | orchestration, workflow, dispatch, pipeline, scheduler, queue, multi-agent, swarm, state machine, durable execution | a tutorial, guide, course, book, list, paper, or "from scratch" learning repo |

## Why this is more than an hour

1. **Word lists miss real members.** pocketflow ("100-line LLM framework that lets agents build agents")
   and crawl4ai (a crawling library filed under Tools) fail. Each shelf needs a short allow-list, and a
   person should read the first 50 rows of each shelf after the gate runs.
2. **The picks must survive.** `web/src/data/stack.json` pins picks by name and repository; a pick that
   fails the gate needs either an allow-list entry or a decision to move it.
3. **Tests.** The pyramid and test-gate suites need a case per shelf (a known member passes, a known
   stranger fails), and `/api/rank?component=` must return the gated list.
4. **The better fix is re-typing,** not filtering: browser tools want a Browser shelf or the Tools shelf,
   inference engines want a place outside the eleven components. That moves files between type folders
   and is a curation decision for the chairman, not a lane.

Estimate: three to four hours for the gate with allow-lists, tests and a read of each shelf's first 50;
re-typing is a separate, larger job.

## Evidence: the top 20 of each shelf

### Sandbox
| # | Row | Passes the gate | Description (start) |
|---|---|---|---|
| 1 | browser-use | no | Python library that makes web browsers accessible to AI agents; built  |
| 2 | daytona | yes | Secure and elastic sandboxes for running AI-generated code. The public |
| 3 | ggml-org-llama-cpp | no | LLM inference in C/C++ |
| 4 | vllm-project-vllm | no | A high-throughput and memory-efficient inference and serving engine fo |
| 5 | e2b-sandbox | yes | Use as the default runtime when an agent must execute untrusted code o |
| 6 | diegosouzapw-omniroute | no | Never stop coding. Free MIT AI gateway: one endpoint, 352 providers (1 |
| 7 | sgl-project-sglang | no | SGLang is a high-performance serving framework for large language mode |
| 8 | stripe-agent-toolkit | no | Use as the payments rail when an agent should earn or spend money in c |
| 9 | skyvern | no | Open-source agent platform that automates browser-based workflows usin |
| 10 | browserbase-bb | no | Use when an agent must operate the live web — navigate, act, and extra |
| 11 | browser-use-webui | no | Gradio web UI on top of the browser-use framework — lets users run AI  |
| 12 | cua-computer-use-agent | no | trycua/cua open-source computer-use agent framework — Apple Silicon-na |
| 13 | mcp-tunnels-cloudflared | no | Use to let a hosted agent reach a private-data MCP server behind your  |
| 14 | nanobrowser | no | Open-source Chrome extension that runs a multi-agent browser automatio |
| 15 | browserless | no | Browserless.io headless browser service — provides a Docker-deployable |
| 16 | bytebot | no | Bytebot open-source computer-use agent — Docker-based Ubuntu desktop w |
| 17 | steel-browser | no | Open-source browser API optimised for AI agents — provides session man |
| 18 | microsandbox | yes | Use as the OSS self-hosted sandbox when you need to run agent code on  |
| 19 | claude-managed-agents-selfhost | no | Use for enterprise hosted-control agents — the agent loop runs at the  |
| 20 | sysbox | yes | Next-generation container runtime enabling Docker-in-Docker and VM-lik |

picks: e2b-sandbox=PASS, daytona=PASS, microsandbox=PASS

### Tools
| # | Row | Passes the gate | Description (start) |
|---|---|---|---|
| 1 | openclaw-openclaw | no | Your own personal AI assistant. Any OS. Any Platform. The lobster way. |
| 2 | openai-codex | no | Lightweight coding agent that runs in your terminal |
| 3 | significant-gravitas-autogpt | no | AutoGPT is the vision of accessible AI for everyone, to use and to bui |
| 4 | anomalyco-opencode | no | The open source coding agent. |
| 5 | gh | yes | GitHub’s official command line tool |
| 6 | tmux | yes | Terminal multiplexer — persistent sessions, split panes, detach and re |
| 7 | cli-anything | yes | Generates an agent-native CLI for any piece of software; CLI-Hub colle |
| 8 | duckdb | no | DuckDB is an analytical in-process SQL database management system |
| 9 | zellij | yes | A terminal workspace with batteries included |
| 10 | firecrawl-firecrawl | no | The context API to search, scrape, and interact with the web at scale. |
| 11 | google-gemini-gemini-cli | no | An open-source AI agent that brings the power of Gemini directly into  |
| 12 | cmux | yes | Open source Ghostty-based macOS terminal with vertical tabs and notifi |
| 13 | graphify-labs-graphify | no | Turn any codebase, with its docs, SQL schemas, configs, and PDFs, into |
| 14 | puppeteer | yes | Google Puppeteer Node.js library and CLI for programmatic Chrome/Firef |
| 15 | nexu-io-open-design | no | 🎨 Best DeepSeek Harness Design Plugin. The open-source Claude Design  |
| 16 | zed-industries-zed | no | Code at the speed of thought – Zed is a high-performance, multiplayer  |
| 17 | openhands-openhands | no | 🙌 OpenHands: AI-Driven Development |
| 18 | playwright-cli | yes | Playwright CLI bundled with the @playwright/test package — provides co |
| 19 | crawl4ai | no | Open-source async web crawling library optimised for LLM data extracti |
| 20 | panniantong-agent-reach | no | Give your AI agent eyes to see the entire internet. Read & search Twit |

picks: playwright-cli=PASS, gh=PASS, crawl4ai=FAIL

### Dispatch
| # | Row | Passes the gate | Description (start) |
|---|---|---|---|
| 1 | n8n-io-n8n | yes | Fair-code workflow automation platform with native AI capabilities. Co |
| 2 | karpathy-autoresearch | no | AI agents running research on single-GPU nanochat training automatical |
| 3 | learn-claude-code | no | An analysis of how coding agents like Claude Code are designed, which  |
| 4 | openai-symphony | no | Symphony turns project work into isolated, autonomous implementation r |
| 5 | a2a-protocol-github-repository | no | Google's official repository for A2A protocol |
| 6 | anthropic-quickstarts | yes | Offers comprehensive development guides for three distinct AI-powered  |
| 7 | claude-code-system-prompts | no | All parts of Claude Code's system prompt, including builtin tool descr |
| 8 | pocketflow | no | Pocket Flow: 100-line LLM framework that lets agents build agents |
| 9 | claude-code-infrastructure-showcase | no | An approach to working with Skills that uses hooks to make Claude sele |
| 10 | harness | no | A meta-skill that designs domain-specific agent teams, defines special |
| 11 | claude-code-tips | yes | 35+ short Claude Code tips covering voice input, system prompt patchin |
| 12 | ralph-for-claude-code | no | An autonomous AI development framework that enables Claude Code to wor |
| 13 | claude-code-pm | yes | A project-management workflow for Claude Code with specialised agents, |
| 14 | claude-code-ultimate-guide | no | A guide to Claude Code from beginner to power user, with templates for |
| 15 | learn-agentic-ai | no | Learn Agentic AI using Dapr Agentic Cloud Ascent (DACA) Design Pattern |
| 16 | ysymyth-react | no | [ICLR 2023] ReAct: Synergizing Reasoning and Acting in Language Models |
| 17 | noahshinn-reflexion | no | [NeurIPS 2023] Reflexion: Language Agents with Verbal Reinforcement Le |
| 18 | ralph-orchestrator | yes | Ralph Orchestrator implements the simple but effective "Ralph Wiggum"  |
| 19 | claude-codepro | yes | A development environment for Claude Code with a spec-driven workflow, |
| 20 | the-ralph-playbook | no | A detailed guide to the Ralph Wiggum technique for autonomous coding l |

picks: pocketflow=FAIL, n8n-io-n8n=PASS

The tables above used the proposal's words over the first 160 characters of each description. `node
scripts/shelf-fit.mjs` now reports the gate as built (a report; it changes nothing).

## Built (PR E, 26 September 2026)

`lib/rank.mjs` holds the gate: `SHELF_FIT` (a purpose, the words, an allow-list and a deny-list for each
of `infra`, `cli`, `tool` and `workflow`) and `fitsShelf()` beside `rankRows`. `computeRows` sets `fits`
on every row from its name and full description. `rankRows` lists only the rows that fit when one of those
components is asked for and returns `fit: {purpose, filed, left_out}`; the component facet counts what the
filter lists. The shelves, /c, /stack, /pipeline, the leaderboard, the detail pages, `/api/rank`,
`/api/stack`, the CLI and the MCP server all read that one flag. Measured on the catalog after the
26 September Sentinel sync (65,229 rows):

| Shelf | Rows | Ranked rows | Picks, rank on the shelf before and after |
|---|---|---|---|
| Sandbox | 55 to 23 | 31 to 11 | daytona 2 to 1 · e2b-sandbox 5 to 2 · microsandbox 18 to 4 |
| Tools | 147 to 51 | 134 to 48 | gh 5 to 1 · playwright-cli 18 to 9 · crawl4ai 19 to 10 |
| Dispatch | 719 to 50 | 60 to 9 | n8n-io-n8n 1 to 1 · pocketflow 8 to 3 |

With the moves below (PR E, second push), on the catalog of 65,238 rows after the next two Sentinel syncs,
the same shelves list:

| Shelf | Rows listed, of those filed | Ranked rows | Picks, rank on the shelf |
|---|---|---|---|
| Sandbox | 26 of 58 | 14 | daytona 1 · e2b-sandbox 2 · microsandbox 5 (container-use is 3) |
| Tools | 57 of 150 | 54 | gh 1 · playwright-cli 9 · crawl4ai 10 |
| Dispatch | 58 of 727 | 18 | n8n-io-n8n 1 · pocketflow 9 (LangGraph, ruflo, AutoGen, Orca, CrewAI, the OpenAI Agents SDK and Symphony are 2 to 8) |

What changed from the proposal's words, after reading each shelf's first 50 rows:

- **Sandbox** also accepts "VMs", the short form of "virtual machines", which brings in cua, morph-cloud
  and unikraft.
- **Tools** also accepts "command prompt", tmux and SSH. Besides whole agents, it turns away AI pair
  programming, web builders, editor and IDE extensions, Emacs and Neovim; "for your AI agent" names an
  audience, so it does not count as an agent.
- **Dispatch** no longer accepts "workflow" or "pipeline" on their own: they matched guides and
  development processes. It accepts delegation, cron, schedulers, scheduled runs and loops (not
  "human-in-the-loop"), and turns away tips, mirrors, directories, collections, cheatsheets, handbooks,
  exercises and walkthroughs as well as tutorials and guides.

The allow-list holds rows the words miss: claude-managed-agents-selfhost (Sandbox); crawl4ai, Firecrawl
(crawl4ai's reason names it), claudectx and vibe-log (Tools); pocketflow and Symphony (Dispatch). The
deny-list holds two rows the words let in by accident: setup-monorepo ("build orchestration") and
system-dynamics-modeler ("feedback loops").

A row that does not fit keeps its component, score and detail page, and stays in search, Browse and the
unfiltered leaderboard. Each gated shelf says in one line that it lists only rows made for its job and
how many of the rest are in Browse, which it links; /pipeline counts the rest, so its numbers still add up to the catalog. On
the detail page of such a row, Alternatives come from every row filed beside it and name no shelf.

`ingest/test-gate.mjs` now also fails, in CI and in the nightly run, when a /stack pick is not listed on
its shelf or sits below the shelf's top row without a `reason`, and, since the second push, when a pick at
the top still has one: no page shows a reason there, so it goes stale unseen (superpowers and promptfoo
each had one).

Re-typing, done as moves (PR E, second push). Orchestration frameworks filed under `clis-tools` (ruflo,
CrewAI, AutoGen, LangGraph, the OpenAI Agents SDK) belong on Dispatch, and container-use belongs on Sandbox;
the gate had left them on no shelf. `SHELF_MOVES` in `lib/rank.mjs` lists a row, keyed `type/name`, on the
shelf of the job it does. Only its component changes: its `type`, and so its address `/e/<type>/<name>`,
stays, and so do the links Sentinel's notes and other sites hold. A moved row fits its new shelf by
decision. Moving the files instead would change those addresses, and `ingest/catalog.mjs` keeps only the
frontmatter fields it names, so a new `shelf:` field would need the catalog rebuilt and every sync to
carry it.

| Row, filed under | Listed on | Why (from its description and repository) |
|---|---|---|
| ruflo, `clis-tools` | Dispatch | deploys and coordinates multi-agent swarms |
| crewaiinc-crewai, `clis-tools` | Dispatch | "framework for orchestrating role-playing, autonomous AI agents" |
| microsoft-autogen, `clis-tools` | Dispatch | a framework for multi-agent applications (now in maintenance mode) |
| langchain-ai-langgraph, `clis-tools` | Dispatch | a low-level orchestration framework for agents |
| openai-openai-agents-python, `clis-tools` | Dispatch | a framework for multi-agent workflows |
| sudocode, `clis-tools` | Dispatch | a lightweight agent orchestration system |
| stablyai-orca, `clis-tools` | Dispatch | runs a fleet of coding agents side by side, each in its own worktree |
| praisonai, `mcps` | Dispatch | a multi-agent framework |
| bernstein, `mcps` | Dispatch | agent orchestration with a deterministic scheduler |
| container-use, `clis-tools` | Sandbox | gives each coding agent a fresh container on its own git branch |
| runno, `mcps` | Sandbox | runs code in a WebAssembly sandbox |
| babelcloud-gru-sandbox, `mcps` | Sandbox | GBOX: self-hostable environments where agents run code and operate desktop and mobile devices |
| ccoutputstyles, `workflows` | Tools | a command-line tool for Claude Code output styles |
| snyk-cli, `mcps` | Tools | the Snyk command-line tool |
| cocoindex-code, `mcps` | Tools | a code search command-line tool |

The six `mcps` rows came from MCP registry listings. Each project is first the thing its new shelf lists, and
its MCP server is one way in: Runno's is one of four packages, cocoindex-code recommends its CLI over its
server, PraisonAI and Bernstein are frameworks that also serve MCP, and the Snyk CLI's README never mentions
MCP.

agnix and claude-task-master were already Tools rows and are command-line tools whose descriptions never
say so; they join the allow-list. So does AgentShield, a command-line scanner that arrived with the next
sync: its description begins "AI agent security scanner", which the words read as a whole agent. The
Dispatch deny-list gains `crewai`, a sample agent filed under `workflows` that is not CrewAI.

Left where they are, after reading each repository: crystal (deprecated in February 2026 for a successor
app), grafbase (the platform was sunset after an acquisition), agno (a framework and runtime for agent
platforms, closer to a runtime than to routing), cc-tools (now a status line and hooks kit, so Hooks or
Observability, not Tools), MCP servers that only reach a sandbox or an orchestrator run elsewhere (they are
MCP servers), mcps/container-use (a directory listing of the same project, which is on Sandbox under
`clis-tools`), and the browser tools (browser-use, Stagehand, Steel, Browserless). Whether browser tools go
on Tools or on a shelf of their own is a curation call: browser-use would top Tools and reopen its pick.

`--component` and the MCP tools' `component` now also take a shelf name: `SHELVES` in `lib/rank.mjs` maps
each /stack slug to its components (a test keeps it equal to `stack.json`), so `armory rank -c tools`,
`rank_components {component: "dispatch"}` and `/api/rank?component=sandbox` list those shelves. `tools`
returned 0 rows before, because it named the empty `tool` component. A component name still lists only its
own rows, so a leaderboard chip's count holds. Search takes the same names.
