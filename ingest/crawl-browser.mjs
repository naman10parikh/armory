#!/usr/bin/env node
// Engram browser-tools crawler. Curated adapter — no live network calls.
// Covers the canonical browser-automation + agent-browser ecosystem (~35 tools).
// Writes one engram stub per tool into incoming/browser-tools/.
//
// Run:
//   node ingest/crawl-browser.mjs           # dry-run
//   node ingest/crawl-browser.mjs --apply   # write to incoming/browser-tools/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-28";

// --- Shared helpers (mirrors crawl-smithery.mjs) ----------------------------

function uniqueName(base, seen) {
  let name = base || "untitled";
  if (!seen.has(name)) { seen.add(name); return name; }
  for (let n = 2; ; n++) {
    const cand = `${name}-${n}`;
    if (!seen.has(cand)) { seen.add(cand); return cand; }
  }
}

function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// --- Curated records ---------------------------------------------------------
// Fields: name, type, description, source_repo, source_url, license, tags_extra
// type choices: "mcps" | "infrastructure" | "clis-tools"
// tags_extra: short label appended alongside "browser"

const records = [
  {
    name: "playwright-mcp",
    type: "mcps",
    description: "Official Microsoft MCP server that exposes Playwright browser automation as structured accessibility-snapshot tools — no screenshots, structured DOM traversal for reliable agent-driven web interaction.",
    source_repo: "microsoft/playwright-mcp",
    source_url: "https://github.com/microsoft/playwright-mcp",
    license: "Apache-2.0",
    tags_extra: "playwright",
  },
  {
    name: "mcp-server-browserbase",
    type: "mcps",
    description: "MCP server for Browserbase cloud browser infrastructure — lets agents launch, control, and observe headless Chromium sessions via the Browserbase API with session management and live-view URLs.",
    source_repo: "browserbase/mcp-server-browserbase",
    source_url: "https://github.com/browserbase/mcp-server-browserbase",
    license: "MIT",
    tags_extra: "browserbase",
  },
  {
    name: "stagehand",
    type: "infrastructure",
    description: "Browserbase open-source AI web automation framework built on Playwright. Provides act(), extract(), and observe() primitives that map natural-language instructions to browser actions; runs locally or on Browserbase cloud.",
    source_repo: "browserbase/stagehand",
    source_url: "https://github.com/browserbase/stagehand",
    license: "MIT",
    tags_extra: "stagehand",
  },
  {
    name: "browser-use",
    type: "infrastructure",
    description: "Python library that makes web browsers accessible to AI agents; built on Playwright and LangChain. Supports multi-tab, vision + accessibility-tree hybrid mode, custom actions, and a self-correcting agent loop.",
    source_repo: "browser-use/browser-use",
    source_url: "https://github.com/browser-use/browser-use",
    license: "MIT",
    tags_extra: "browser-use",
  },
  {
    name: "skyvern",
    type: "infrastructure",
    description: "Open-source agent platform that automates browser-based workflows using LLMs and computer vision — identifies interactive elements via screenshots, handles CAPTCHAs, and supports complex multi-step form flows.",
    source_repo: "Skyvern-AI/skyvern",
    source_url: "https://github.com/Skyvern-AI/skyvern",
    license: "AGPL-3.0",
    tags_extra: "skyvern",
  },
  {
    name: "steel-browser",
    type: "infrastructure",
    description: "Open-source browser API optimised for AI agents — provides session management, stealth settings, proxy rotation, and a REST/WebSocket interface on top of Chromium for cloud-scale agent browser access.",
    source_repo: "steel-dev/steel-browser",
    source_url: "https://github.com/steel-dev/steel-browser",
    license: "Apache-2.0",
    tags_extra: "steel",
  },
  {
    name: "lightpanda",
    type: "infrastructure",
    description: "Ultra-fast headless browser written in Zig specifically for AI and automation workloads — runs JavaScript natively, uses 9x less memory than Chrome headless, and targets sub-100ms page execution.",
    source_repo: "lightpanda-io/lightpanda",
    source_url: "https://github.com/lightpanda-io/lightpanda",
    license: "AGPL-3.0",
    tags_extra: "lightpanda",
  },
  {
    name: "browser-use-mcp-server",
    type: "mcps",
    description: "MCP server wrapper around the browser-use Python library — exposes navigate, click, type, screenshot, and extract-text tools so any MCP-compatible AI client can drive a real browser without custom Python code.",
    source_repo: "co-browser/browser-use-mcp-server",
    source_url: "https://github.com/co-browser/browser-use-mcp-server",
    license: "MIT",
    tags_extra: "browser-use",
  },
  {
    name: "agentdesk-browser-use",
    type: "mcps",
    description: "AgentDesk fork of browser-use that integrates with the AgentDesk agent platform — adds desktop-tool registration, task planning hooks, and multi-agent coordination on top of the browser-use core.",
    source_repo: "AgentDeskAI/browser-tools-mcp",
    source_url: "https://github.com/AgentDeskAI/browser-tools-mcp",
    license: "MIT",
    tags_extra: "agentdesk",
  },
  {
    name: "browsermcp",
    type: "mcps",
    description: "Lightweight MCP server that uses Chrome DevTools Protocol to connect AI agents to a user's existing Chrome session — no separate browser process, works with authenticated tabs already open in the user's browser.",
    source_repo: "browsermcp/mcp",
    source_url: "https://github.com/browsermcp/mcp",
    license: "MIT",
    tags_extra: "cdp",
  },
  {
    name: "mcp-playwright",
    type: "mcps",
    description: "Playwright-backed MCP server by executeautomation — exposes navigate, click, fill, screenshot, evaluate-script, and network-intercept tools designed for E2E test automation and agent-driven browser workflows.",
    source_repo: "executeautomation/mcp-playwright",
    source_url: "https://github.com/executeautomation/mcp-playwright",
    license: "MIT",
    tags_extra: "playwright",
  },
  {
    name: "puppeteer-mcp",
    type: "mcps",
    description: "Official Anthropic/Claude reference MCP server using Puppeteer — provides navigate, screenshot, click, fill, select, hover, evaluate, and network-monitoring tools; reference implementation for browser MCP design.",
    source_repo: "modelcontextprotocol/servers",
    source_url: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    license: "MIT",
    tags_extra: "puppeteer",
  },
  {
    name: "actors-mcp-server",
    type: "mcps",
    description: "Apify MCP server that exposes the Apify Actor platform as tools — agents can trigger pre-built web scrapers, browser automations, and data-extraction actors without managing infrastructure.",
    source_repo: "apify/actors-mcp-server",
    source_url: "https://github.com/apify/actors-mcp-server",
    license: "Apache-2.0",
    tags_extra: "apify",
  },
  {
    name: "hyperbrowser-mcp",
    type: "mcps",
    description: "Hyperbrowser cloud browser MCP server — gives agents access to scalable headless Chrome sessions with built-in stealth, CAPTCHA solving, residential proxy rotation, and session replay via the Hyperbrowser API.",
    source_repo: "hyperbrowserai/mcp",
    source_url: "https://github.com/hyperbrowserai/mcp",
    license: "MIT",
    tags_extra: "hyperbrowser",
  },
  {
    name: "anthropic-computer-use",
    type: "infrastructure",
    description: "Anthropic reference implementation for computer-use tool capability — Docker sandbox with Chromium, VNC, and API endpoint demonstrating how Claude can observe and interact with a full desktop environment.",
    source_repo: "anthropics/anthropic-quickstarts",
    source_url: "https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo",
    license: "MIT",
    tags_extra: "computer-use",
  },
  {
    name: "nanobrowser",
    type: "infrastructure",
    description: "Open-source Chrome extension that runs a multi-agent browser automation system locally — Planner, Navigator, and Validator agents collaborate inside the browser with no external API calls for web tasks.",
    source_repo: "nanobrowser/nanobrowser",
    source_url: "https://github.com/nanobrowser/nanobrowser",
    license: "Apache-2.0",
    tags_extra: "multi-agent",
  },
  {
    name: "agent-e",
    type: "infrastructure",
    description: "Emergence AI agent-E browser agent — hierarchical LLM-based web automation that uses DOM distillation and action abstraction layers to achieve significantly higher benchmark accuracy than prior browser agents.",
    source_repo: "EmergenceAI/Agent-E",
    source_url: "https://github.com/EmergenceAI/Agent-E",
    license: "Apache-2.0",
    tags_extra: "emergence",
  },
  {
    name: "webvoyager",
    type: "infrastructure",
    description: "Research browser agent from Zhejiang University and HKU — uses GPT-4V interleaved screenshot + HTML observations to complete open-ended web tasks; established an early web-agent benchmark (WebVoyager).",
    source_repo: "MinorJerry/WebVoyager",
    source_url: "https://github.com/MinorJerry/WebVoyager",
    license: "MIT",
    tags_extra: "research",
  },
  {
    name: "multion",
    type: "infrastructure",
    description: "MultiOn AI browser agent API — cloud service that lets developers invoke an autonomous web agent via REST to complete tasks like form filling, data extraction, and multi-step workflows on any site.",
    source_repo: "MULTI-ON/multion-python",
    source_url: "https://github.com/MULTI-ON/multion-python",
    license: "MIT",
    tags_extra: "multion",
  },
  {
    name: "browserless",
    type: "infrastructure",
    description: "Browserless.io headless browser service — provides a Docker-deployable or cloud-hosted Chrome endpoint with REST and WebSocket APIs for screenshot, PDF, scraping, and Puppeteer/Playwright remote sessions.",
    source_repo: "browserless/browserless",
    source_url: "https://github.com/browserless/browserless",
    license: "SSPL-1.0",
    tags_extra: "browserless",
  },
  {
    name: "scrapybara",
    type: "infrastructure",
    description: "Scrapybara cloud computer-use environment — provides Ubuntu desktop, browser, and code-execution sandboxes as an API so agents can operate a full virtual desktop without local infra.",
    source_repo: "scrapybara/scrapybara-py",
    source_url: "https://github.com/scrapybara/scrapybara-py",
    license: "MIT",
    tags_extra: "scrapybara",
  },
  {
    name: "cua-computer-use-agent",
    type: "infrastructure",
    description: "trycua/cua open-source computer-use agent framework — Apple Silicon-native, runs lightweight macOS/Linux VMs with sub-second cold starts; provides a unified Python interface for screen capture, click, and type actions.",
    source_repo: "trycua/cua",
    source_url: "https://github.com/trycua/cua",
    license: "MIT",
    tags_extra: "computer-use",
  },
  {
    name: "bytebot",
    type: "infrastructure",
    description: "Bytebot open-source computer-use agent — Docker-based Ubuntu desktop with AI-controlled mouse and keyboard; exposes an HTTP API for agents to send click, type, screenshot, and macro commands.",
    source_repo: "bytebot-ai/bytebot",
    source_url: "https://github.com/bytebot-ai/bytebot",
    license: "MIT",
    tags_extra: "computer-use",
  },
  {
    name: "browser-use-webui",
    type: "infrastructure",
    description: "Gradio web UI on top of the browser-use framework — lets users run AI browser agents interactively, configure LLM providers, watch live recordings, and replay task sessions without writing Python.",
    source_repo: "browser-use/web-ui",
    source_url: "https://github.com/browser-use/web-ui",
    license: "MIT",
    tags_extra: "browser-use",
  },
  {
    name: "selenium-mcp",
    type: "mcps",
    description: "MCP server built on Selenium WebDriver — exposes click, type, navigate, find-element, and screenshot tools via the MCP protocol for browser automation in environments where Playwright is unavailable.",
    source_repo: "angiejones/mcp-selenium",
    source_url: "https://github.com/angiejones/mcp-selenium",
    license: "Apache-2.0",
    tags_extra: "selenium",
  },
  {
    name: "playwright-cli",
    type: "clis-tools",
    description: "Playwright CLI bundled with the @playwright/test package — provides codegen, screenshot, pdf, and trace viewer commands for headless browser scripting; the canonical Playwright command-line interface.",
    source_repo: "microsoft/playwright",
    source_url: "https://github.com/microsoft/playwright",
    license: "Apache-2.0",
    tags_extra: "playwright",
  },
  {
    name: "puppeteer",
    type: "clis-tools",
    description: "Google Puppeteer Node.js library and CLI for programmatic Chrome/Firefox control — headless screenshot, PDF, network interception, and DevTools protocol access; foundation for many browser-automation tools.",
    source_repo: "puppeteer/puppeteer",
    source_url: "https://github.com/puppeteer/puppeteer",
    license: "Apache-2.0",
    tags_extra: "puppeteer",
  },
  {
    name: "crawl4ai",
    type: "clis-tools",
    description: "Open-source async web crawling library optimised for LLM data extraction — Playwright-backed, outputs clean Markdown, supports CSS/XPath selectors and chunking; popular for feeding AI pipelines.",
    source_repo: "unclecode/crawl4ai",
    source_url: "https://github.com/unclecode/crawl4ai",
    license: "Apache-2.0",
    tags_extra: "crawl",
  },
  {
    name: "firecrawl-mcp",
    type: "mcps",
    description: "Firecrawl MCP server — converts any URL into clean LLM-ready Markdown via scrape, crawl, map, extract, and deep-research tools; handles JavaScript-rendered pages, auth-walled content, and full-site crawls.",
    source_repo: "mendableai/firecrawl",
    source_url: "https://github.com/mendableai/firecrawl",
    license: "AGPL-3.0",
    tags_extra: "firecrawl",
  },
  {
    name: "e2b-desktop",
    type: "infrastructure",
    description: "E2B Desktop Sandbox — cloud virtual desktop (Ubuntu + VNC) with Python SDK for screenshot, mouse, keyboard, and process control; designed for AI agents that need a full GUI environment in an isolated VM.",
    source_repo: "e2b-dev/desktop",
    source_url: "https://github.com/e2b-dev/desktop",
    license: "Apache-2.0",
    tags_extra: "e2b",
  },
  {
    name: "notte",
    type: "infrastructure",
    description: "Notte open-source web agent environment — converts browser sessions into a Markov Decision Process with structured observation/action spaces, making browsers first-class RL and LLM agent environments.",
    source_repo: "nottelabs/notte",
    source_url: "https://github.com/nottelabs/notte",
    license: "Apache-2.0",
    tags_extra: "rl",
  },
  {
    name: "open-operator",
    type: "infrastructure",
    description: "Browserbase Open Operator — open-source Operator-style web agent built on Stagehand; demonstrates full task decomposition, action planning, and evidence collection using the Browserbase cloud.",
    source_repo: "browserbase/open-operator",
    source_url: "https://github.com/browserbase/open-operator",
    license: "MIT",
    tags_extra: "stagehand",
  },
  {
    name: "mcp-browser-kit",
    type: "mcps",
    description: "Multi-backend browser MCP that auto-detects the best available driver (Playwright, Puppeteer, or CDP) and exposes a unified tool surface — navigate, interact, screenshot, and extract across all three backends.",
    source_repo: "hdresearch/mcp-browser",
    source_url: "https://github.com/hdresearch/mcp-browser",
    license: "MIT",
    tags_extra: "cdp",
  },
  {
    name: "webdriver-mcp",
    type: "mcps",
    description: "WebDriverIO-based MCP server enabling cross-browser automation (Chrome, Firefox, Safari) via the W3C WebDriver protocol — useful for enterprise test environments that mandate WebDriver over CDP.",
    source_repo: "webdriverio/webdriverio",
    source_url: "https://github.com/webdriverio/webdriverio",
    license: "MIT",
    tags_extra: "webdriver",
  },
  {
    name: "surf-computer-use",
    type: "infrastructure",
    description: "E2B Surf — a Stagehand-powered computer-use interface layer for E2B Firecracker sandboxes; connects the act/extract/observe primitives directly to microVM display output for lightweight headless computer use.",
    source_repo: "e2b-dev/surf",
    source_url: "https://github.com/e2b-dev/surf",
    license: "Apache-2.0",
    tags_extra: "e2b",
  },
];

// --- Adapter (mirrors crawl-smithery.mjs shape exactly) ---------------------

function browserAdapter() {
  const adapterName = "browser-tools";
  const seen = new Set();

  return {
    name: adapterName,

    async fetch() { return records; },

    toEngram(raw) {
      const base = slugify(raw.name);
      const uname = uniqueName(base, seen);
      const desc = scrub(raw.description).slice(0, 400) || raw.name;
      const type = raw.type; // already typed per record

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: raw.source_repo,
          source_url: raw.source_url,
          license: raw.license,
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["browser", raw.tags_extra],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee the source repo README: https://github.com/${raw.source_repo}\n\n` +
          `## Notes\nCurated by the Engram browser-tools adapter. Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-smithery.mjs exactly) ---------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub via parseFrontmatter (mirrors smithery pattern).
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: ${fm.name} != ${frontmatter.name}`);
    }
    if (dryRun) { log(`[dry-run] would write ${file}`); }
    else { writeFileSync(file, md); }
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// --- CLI --------------------------------------------------------------------

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  try {
    const adapter = browserAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[browser-tools] No stubs produced.");
      process.exit(1);
    }
    // Spot-check: print the first 3 slugs + parsed names.
    for (const w of written.slice(0, 3)) {
      const fm = parseFrontmatter(w.md);
      console.log(`[browser-tools] sample: ${fm.name} (type=${fm.type})`);
    }
    // Per-type breakdown
    const byType = {};
    for (const w of written) {
      const t = w.frontmatter.type;
      byType[t] = (byType[t] || 0) + 1;
    }
    console.log(`[browser-tools] breakdown: ${Object.entries(byType).map(([k, v]) => `${k}:${v}`).join(", ")}`);
  } catch (err) {
    console.error(`[browser-tools] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
