#!/usr/bin/env node
// Component authorization / identity-engine crawler. Curated list of the production-grade
// IDENTITY & ACCESS-CONTROL engines that establish WHO an agent is and WHAT it is allowed
// to do — the enforcement substrate behind every tool call, resource access, and delegated
// (on-behalf-of) permission. Two tiers:
//   1. Fine-grained authorization / policy decision engines — the "can this agent perform
//      action X on resource Y, and on whose behalf?" decision point: policy-as-code and
//      Zanzibar-style relationship-based access control (Open Policy Agent, OpenFGA,
//      SpiceDB, Cerbos, Oso, Casbin, Ory Keto, Permify, Topaz, OPAL).
//   2. Identity / credential & IAM platforms — the "who is this agent/workload, and how is
//      its credential issued and verified?" layer: workload identity and full IAM/SSO
//      (SPIRE/SPIFFE, Ory Kratos, Keycloak, Zitadel).
// Fills a real gap in the thinnest-but-one category. The `identity` list already carries
// agent-identity PROTOCOLS (agntcy-identity, agent-identity-discovery, agntcy-oasf),
// agent-auth SDKs (auth0-ai-js, kanoniv-agent-auth, machineauth, vestauth), credential
// vaults (infisical-agent-vault), and persona/character SPECS (soulspec, character-card,
// persona-json) — but NO production fine-grained-authorization or IAM ENGINE: the thing an
// agent harness actually points at to decide "is this tool call allowed" or "who issued
// this agent's credential." As agents gain tool access and act on a user's behalf, this
// authN+authZ substrate is the control plane that keeps them scoped.
// Verified disjoint across all 12 categories AS `identity`: every engine here appears only
// as `mcps` (MCP servers that WRAP it — evansims-openfga, spicedb-mcp-server, authzed,
// warrant-mcp, glasstape-policy-builder) — never as the authorization/IAM engine itself in
// `identity`; identity is type-scoped, so there is no clash, the same precedent as A14
// (google-adk / autogpt) / A17 (instructor / lmql) / A18 (distilabel / label-studio) / A19
// (temporal / airflow) / A20 (weights-and-biases). Distinct from the existing single-project
// `siddhant-k-code-agentic-authz` entry (one specific agentic-authz project) — these are the
// canonical, broadly-adopted engines.
// Deliberately EXCLUDED to keep the set tight and clearly-maintained: Warrant (repo archived
// post-WorkOS acquisition), proprietary SaaS with no clean OSS repo (Descope Agentic
// Identity, WorkOS, Arcade). Zitadel keeps license: unknown rather than a guess (modern IAM
// products have relicensed; not guessed). All emitted slugs verified disjoint vs
// brain/components/identity and from each other.
//
// Run:
//   node ingest/crawl-authz.mjs           # dry-run
//   node ingest/crawl-authz.mjs --apply   # write to incoming/authz/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-05";
const SOURCE_NAME = "authz";

// --- Shared helpers (mirrors crawl-exptrack.mjs) -----------------------------

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

function scrub(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// --- Curated records ---------------------------------------------------------
// Each record: { title, repo ("owner/repo"), url, description, license, tier,
// tags }. All entries are real, broadly-adopted authorization / IAM engines.
// Titles slugify disjoint from the existing identity list and from each other.
// Where a name also appears under another type (mcps) it is type-scoped, so there
// is no clash in `identity`.

const records = [
  // --- Tier 1: fine-grained authorization / policy decision engines ----------
  {
    title: "Open Policy Agent",
    repo: "open-policy-agent/opa",
    url: "https://github.com/open-policy-agent/opa",
    description: "A general-purpose policy engine that decouples authorization decisions from application code: policies written in the Rego language are evaluated against a JSON input to return an allow/deny decision, letting an agent harness gate tool calls and resource access through one policy decision point.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["policy-engine", "policy-as-code", "rego", "authorization"],
  },
  {
    title: "OpenFGA",
    repo: "openfga/openfga",
    url: "https://github.com/openfga/openfga",
    description: "A Zanzibar-inspired, relationship-based access-control (ReBAC) engine: model who-can-do-what as relationship tuples and run high-throughput 'check' queries to decide whether an agent (or a user it acts for) may access a specific object, with list-objects for enumeration.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["rebac", "zanzibar", "fine-grained-authorization", "relationship-based"],
  },
  {
    title: "SpiceDB",
    repo: "authzed/spicedb",
    url: "https://github.com/authzed/spicedb",
    description: "A Zanzibar-style fine-grained authorization database: store permission relationships as a consistent graph and answer low-latency permission checks and reverse lookups, giving agent tools a single source of truth for who may access which resource.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["zanzibar", "fine-grained-authorization", "permissions-database", "rebac"],
  },
  {
    title: "Cerbos",
    repo: "cerbos/cerbos",
    url: "https://github.com/cerbos/cerbos",
    description: "A decoupled, stateless authorization layer with a policy decision point: define context-aware RBAC/ABAC policies as YAML and call the Cerbos API from application or agent code to get an allow/deny decision per action and resource, without embedding rules in the app.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["authorization", "rbac", "abac", "policy-decision-point"],
  },
  {
    title: "Oso",
    repo: "osohq/oso",
    url: "https://github.com/osohq/oso",
    description: "A policy-as-code authorization library using the Polar declarative language to express who can do what: embed fine-grained RBAC, ReBAC, and ABAC rules in-process so an agent or service can enforce access decisions close to the code that uses them.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["authorization", "policy-as-code", "polar", "rbac"],
  },
  {
    title: "Casbin",
    repo: "casbin/casbin",
    url: "https://github.com/casbin/casbin",
    description: "A multi-language authorization library that supports ACL, RBAC, ABAC, and more through a configurable policy model and matcher: load a model plus policy and ask enforce(subject, object, action) to decide whether an agent may perform an operation.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["authorization", "access-control", "rbac", "abac"],
  },
  {
    title: "Ory Keto",
    repo: "ory/keto",
    url: "https://github.com/ory/keto",
    description: "An open-source Zanzibar-inspired permission server: model permissions as relation tuples and run check and expand queries over them, providing a scalable, API-driven source of truth for fine-grained authorization decisions.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["zanzibar", "permission-server", "rebac", "fine-grained-authorization"],
  },
  {
    title: "Permify",
    repo: "Permify/permify",
    url: "https://github.com/Permify/permify",
    description: "An open-source, Zanzibar-inspired authorization service: centralize permissions as a schema and relationships, then run consistent check, lookup, and subject-permission queries so agents and services share one fine-grained access-control engine.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["zanzibar", "authorization-service", "rebac", "fine-grained-authorization"],
  },
  {
    title: "Topaz",
    repo: "aserto-dev/topaz",
    url: "https://github.com/aserto-dev/topaz",
    description: "An open-source authorizer that combines Open Policy Agent policy evaluation with a Zanzibar-style relationship directory, running at the edge next to the application so authorization decisions over an agent's actions are fast and local.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["authorization", "opa", "zanzibar", "edge-authorizer"],
  },
  {
    title: "OPAL",
    repo: "permitio/opal",
    url: "https://github.com/permitio/opal",
    description: "Open Policy Administration Layer: keeps policy engines like Open Policy Agent in sync with live policy and data by streaming updates in real time, so an agent platform's authorization decisions always reflect the current rules and relationships.",
    license: "Apache-2.0",
    tier: "authz",
    tags: ["policy-administration", "opa", "real-time", "authorization"],
  },

  // --- Tier 2: identity / credential & IAM platforms -------------------------
  {
    title: "SPIRE",
    repo: "spiffe/spire",
    url: "https://github.com/spiffe/spire",
    description: "The SPIFFE Runtime Environment: issues and rotates cryptographic workload identities (SVIDs) to services and agents based on attestation, so machine-to-machine and agent-to-service calls can authenticate with short-lived, verifiable identities instead of static secrets.",
    license: "Apache-2.0",
    tier: "identity",
    tags: ["workload-identity", "spiffe", "machine-identity", "mutual-tls"],
  },
  {
    title: "Ory Kratos",
    repo: "ory/kratos",
    url: "https://github.com/ory/kratos",
    description: "An API-first identity and user-management server handling registration, login, multi-factor authentication, account recovery, and profile management, providing the authentication and identity layer that an agent platform can delegate user sign-in and session verification to.",
    license: "Apache-2.0",
    tier: "identity",
    tags: ["identity-management", "authentication", "user-management", "mfa"],
  },
  {
    title: "Keycloak",
    repo: "keycloak/keycloak",
    url: "https://github.com/keycloak/keycloak",
    description: "An open-source identity and access-management server providing single sign-on, user federation, and standards-based authentication over OpenID Connect, OAuth 2.0, and SAML, so agents and services can obtain and verify tokens against a central identity provider.",
    license: "Apache-2.0",
    tier: "identity",
    tags: ["iam", "sso", "oidc", "oauth2"],
  },
  {
    title: "Zitadel",
    repo: "zitadel/zitadel",
    url: "https://github.com/zitadel/zitadel",
    description: "A cloud-native identity and access-management platform offering OpenID Connect, OAuth 2.0, and SAML, plus multi-tenancy, machine (service) accounts, and personal access tokens, giving agents first-class service identities and tokens to authenticate with.",
    license: "unknown",
    tier: "identity",
    tags: ["iam", "oidc", "service-accounts", "multi-tenancy"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  authz: "a fine-grained authorization / policy decision engine — it answers 'can this agent perform action X on resource Y, and on whose behalf?', letting the harness gate every tool call and resource access through one external, auditable policy point instead of ad-hoc in-code checks",
  identity: "an identity / credential & IAM platform — it establishes WHO an agent, workload, or user is and issues/verifies the credentials and tokens they authenticate with, so agent-to-service and on-behalf-of calls carry a verifiable identity",
};

// --- Adapter ------------------------------------------------------------------

function authzAdapter() {
  const seen = new Set();

  return {
    name: SOURCE_NAME,
    type: "identity",

    async fetch() {
      return records;
    },

    toComponent(item) {
      const base = slugify(item.title);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description).slice(0, 300);
      const tierBlurb = TIER_BLURB[item.tier] || "an identity / access-control component";

      const ghMatch = (item.repo || "").match(/^([^/]+\/[^/]+)$/);
      const sourceRepo = ghMatch ? ghMatch[1] : "";
      const sourceUrl = item.url || (sourceRepo ? `https://github.com/${sourceRepo}` : "");

      return {
        frontmatter: {
          name: uname,
          type: "identity",
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: item.license || "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "stable",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["identity", "authorization", "access-control", "agent-security", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to control WHO an agent is and WHAT it may do: it is ${tierBlurb}. It sits at the access-control substrate of an agent system — establish identity -> authenticate the credential -> authorize the action -> allow the tool call / resource access.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's identity & access-control list — the production authorization / IAM engines that establish an agent's identity and gate its actions. Distinct from the agent-identity protocols and persona specs in this category, this is the enforcement engine the harness points at to decide access. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-exptrack.mjs) -------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
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
    const adapter = authzAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[authz] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[authz] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[authz] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
