#!/usr/bin/env node
// Engram infrastructure crawler. Curated list of canonical agent-runtime,
// sandbox, and deploy infra tools. Emits one engram stub per record into
// incoming/infra-tools/. Zero network calls — records are embedded.
//
// Run:
//   node ingest/crawl-infra.mjs           # dry-run
//   node ingest/crawl-infra.mjs --apply   # write to incoming/infra-tools/
import {
  mkdirSync, writeFileSync, existsSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";

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
// Fields: title, url, repo (optional), description, license, shortTag
// shortTag becomes the second tag entry alongside "infrastructure".

const RECORDS = [
  {
    title: "E2B",
    url: "https://e2b.dev",
    repo: "e2b-dev/E2B",
    description: "Open-source secure cloud sandboxes (Firecracker microVMs) for running AI-generated code. ~150ms cold start.",
    license: "Apache-2.0",
    shortTag: "sandbox",
  },
  {
    title: "Daytona",
    url: "https://daytona.io",
    repo: "daytonaio/daytona",
    description: "Open-source development environment manager for spinning up standardized, reproducible workspaces at scale.",
    license: "Apache-2.0",
    shortTag: "dev-environments",
  },
  {
    title: "microsandbox",
    url: "https://github.com/microsandbox/microsandbox",
    repo: "microsandbox/microsandbox",
    description: "Lightweight VM-based sandbox built on libkrun for secure ephemeral code execution with minimal overhead.",
    license: "Apache-2.0",
    shortTag: "sandbox",
  },
  {
    title: "Modal",
    url: "https://modal.com",
    repo: "modal-labs/modal-client",
    description: "Serverless cloud platform for running Python functions, containers, and AI workloads with zero infra management.",
    license: "Apache-2.0",
    shortTag: "serverless",
  },
  {
    title: "Fly.io",
    url: "https://fly.io",
    repo: "superfly/flyctl",
    description: "Deploy full-stack apps and long-running agent processes globally via Firecracker microVMs close to users.",
    license: "Apache-2.0",
    shortTag: "deploy",
  },
  {
    title: "Cloudflare Workers",
    url: "https://workers.cloudflare.com",
    repo: "cloudflare/workers-sdk",
    description: "Serverless edge-compute platform for deploying agent functions and MCP servers at the network edge.",
    license: "Apache-2.0",
    shortTag: "edge-compute",
  },
  {
    title: "Cloudflare Sandboxes",
    url: "https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/",
    repo: "cloudflare/workers-sdk",
    description: "Isolated V8 sandbox environments for multi-tenant agent workloads on top of Cloudflare Workers.",
    license: "Apache-2.0",
    shortTag: "sandbox",
  },
  {
    title: "Vercel",
    url: "https://vercel.com",
    repo: "vercel/vercel",
    description: "Frontend cloud platform with serverless functions and AI SDK integrations for deploying agent-facing UIs.",
    license: "Apache-2.0",
    shortTag: "deploy",
  },
  {
    title: "Northflank",
    url: "https://northflank.com",
    repo: "northflank/northflank-examples",
    description: "Developer platform for containerized microservices, cron jobs, and persistent agent workloads with GitOps support.",
    license: "unknown",
    shortTag: "containers",
  },
  {
    title: "Railway",
    url: "https://railway.app",
    repo: "railwayapp/cli",
    description: "Zero-config cloud platform for deploying agent backends, databases, and services from a Git push.",
    license: "MIT",
    shortTag: "deploy",
  },
  {
    title: "Firecracker",
    url: "https://firecracker-microvm.github.io",
    repo: "firecracker-microvm/firecracker",
    description: "AWS-open-sourced microVM technology powering secure, fast (<125ms) isolation for serverless and container workloads.",
    license: "Apache-2.0",
    shortTag: "microvm",
  },
  {
    title: "Kata Containers",
    url: "https://katacontainers.io",
    repo: "kata-containers/kata-containers",
    description: "Lightweight VMs that combine container speed with VM-level security isolation for agent runtime workloads.",
    license: "Apache-2.0",
    shortTag: "microvm",
  },
  {
    title: "gVisor",
    url: "https://gvisor.dev",
    repo: "google/gvisor",
    description: "Google-open-sourced application kernel providing a sandboxed container runtime for untrusted agent code.",
    license: "Apache-2.0",
    shortTag: "sandbox",
  },
  {
    title: "Runloop",
    url: "https://runloop.ai",
    repo: "",
    description: "Managed cloud infrastructure purpose-built for AI agents requiring persistent, low-latency compute environments.",
    license: "unknown",
    shortTag: "agent-compute",
  },
  {
    title: "Morph Cloud",
    url: "https://morph.so",
    repo: "",
    description: "Hypervisor-level snapshotting cloud for agent inference — fork and snapshot VM state for fast agent branching.",
    license: "unknown",
    shortTag: "agent-compute",
  },
  {
    title: "Blaxel",
    url: "https://blaxel.ai",
    repo: "blaxel-ai/blaxel",
    description: "Cloud runtime and control plane for deploying, scaling, and observing production AI agent workloads.",
    license: "unknown",
    shortTag: "agent-compute",
  },
  {
    title: "Coder",
    url: "https://coder.com",
    repo: "coder/coder",
    description: "Self-hosted remote development environment platform for provisioning agent dev workspaces on any cloud.",
    license: "AGPL-3.0",
    shortTag: "dev-environments",
  },
  {
    title: "RunPod",
    url: "https://runpod.io",
    repo: "runpod-workers/worker-template",
    description: "GPU cloud for AI inference and training. Provides serverless endpoints for running heavy agent models.",
    license: "unknown",
    shortTag: "gpu-cloud",
  },
  {
    title: "Replicate",
    url: "https://replicate.com",
    repo: "replicate/replicate-python",
    description: "API platform for running ML models in the cloud. Useful for deploying custom model components in agent pipelines.",
    license: "Apache-2.0",
    shortTag: "ml-inference",
  },
  {
    title: "Beta9",
    url: "https://docs.beam.cloud",
    repo: "beam-cloud/beta9",
    description: "Open-source serverless GPU container runtime for running AI workloads with fast cold-starts on bare-metal.",
    license: "MIT",
    shortTag: "gpu-serverless",
  },
  {
    title: "Val Town",
    url: "https://val.town",
    repo: "val-town/val-town-docs",
    description: "Social serverless platform for writing, running, and scheduling JavaScript/TypeScript functions in the browser.",
    license: "unknown",
    shortTag: "serverless",
  },
  {
    title: "Deno Deploy",
    url: "https://deno.com/deploy",
    repo: "denoland/deno",
    description: "Edge serverless runtime for deploying TypeScript agent workers globally with zero config and V8 isolation.",
    license: "MIT",
    shortTag: "edge-compute",
  },
  {
    title: "Render",
    url: "https://render.com",
    repo: "render-examples/starters",
    description: "Unified cloud for deploying web services, background workers, cron jobs, and databases for agent backends.",
    license: "unknown",
    shortTag: "deploy",
  },
  {
    title: "Fermyon Spin",
    url: "https://developer.fermyon.com/spin",
    repo: "fermyon/spin",
    description: "WebAssembly serverless framework for building and deploying fast, portable agent microservices.",
    license: "Apache-2.0",
    shortTag: "wasm-serverless",
  },
  {
    title: "Unikraft",
    url: "https://unikraft.org",
    repo: "unikraft/unikraft",
    description: "Open-source unikernel framework for building minimal, single-purpose VM images for ultra-fast agent boot times.",
    license: "BSD-3-Clause",
    shortTag: "unikernel",
  },
  {
    title: "Sysbox",
    url: "https://github.com/nestybox/sysbox",
    repo: "nestybox/sysbox",
    description: "Next-generation container runtime enabling Docker-in-Docker and VM-like isolation without privileged containers.",
    license: "Apache-2.0",
    shortTag: "containers",
  },
  {
    title: "Kubernetes",
    url: "https://kubernetes.io",
    repo: "kubernetes/kubernetes",
    description: "Industry-standard container orchestration system for deploying, scaling, and managing agent workload fleets.",
    license: "Apache-2.0",
    shortTag: "orchestration",
  },
  {
    title: "AWS Lambda",
    url: "https://aws.amazon.com/lambda",
    repo: "aws/aws-lambda-developer-guide",
    description: "Serverless function-as-a-service platform for event-driven agent compute without provisioning servers.",
    license: "unknown",
    shortTag: "serverless",
  },
];

// --- Adapter -----------------------------------------------------------------

function infraAdapter() {
  const adapterName = "infra-tools";
  const type = "infrastructure";
  const seen = new Set();

  return {
    name: adapterName,
    type,

    async fetch() {
      return RECORDS;
    },

    toEngram(rec) {
      const base = slugify(rec.title);
      const uname = uniqueName(base, seen);

      const desc = scrub(rec.description).slice(0, 300) || `${rec.title} infrastructure tool.`;
      const sourceUrl = rec.url || "";
      const sourceRepo = rec.repo || "";

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: rec.license || "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["infrastructure", rec.shortTag],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee [${rec.title}](${sourceUrl}) for setup and docs.\n\n` +
          `## Notes\nDiscovered via the Engram infra-tools curated list. Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-smithery.mjs) ------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub against the catalog parser before writing.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: ${fm.name} != ${frontmatter.name}`);
    }
    if (!dryRun) writeFileSync(file, md);
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// --- CLI ---------------------------------------------------------------------

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  try {
    const adapter = infraAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[infra-tools] No stubs produced.");
      process.exit(1);
    }
    // Spot-check: print 3 sample slugs.
    const samples = written.slice(0, 3).map(w => w.frontmatter.name);
    console.log(`[infra-tools] samples: ${samples.join(", ")}`);
  } catch (err) {
    console.error(`[infra-tools] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
