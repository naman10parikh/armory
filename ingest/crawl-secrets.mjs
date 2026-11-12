#!/usr/bin/env node
// Component secrets-management crawler. Curated list of the credential-storage
// plane: the tools that store, encrypt, rotate, and INJECT the secrets a harness
// or agent needs at runtime — API keys, database URLs, OAuth tokens, signing
// keys, wallet keys. This is the layer every autonomous agent touches the moment
// it has to authenticate to anything, and the harness security rules in this repo
// (solana-wallet-aware, security-devsecops) all insist on it: "never store a raw
// private key in .env", "keep deployment credentials out of source control".
//
// It is DISTINCT from the authorization/identity engines already catalogued in
// crawl-authz (type `identity`): those answer "is this principal ALLOWED to do X"
// (OPA, OpenFGA, SpiceDB, Keycloak, SPIRE). This list answers the prior question —
// "where does the credential itself live, and how does it reach the process safely"
// (Vault, OpenBao, Infisical, SOPS, External Secrets Operator). Secrets management
// was previously absent across all 12 categories (the only near-neighbour is a
// single third-party product, `infisical-agent-vault`, not the core platforms).
//
// Emits one component stub per entry into incoming/secrets/ with type `identity`
// (the credential/trust plane, consistent with crawl-authz which also typed its
// authZ/IAM engines `identity`). identity is one of the thinnest categories, so
// this is a high-novelty Performance-Novelty fill.
//
// Run:
//   node ingest/crawl-secrets.mjs           # dry-run
//   node ingest/crawl-secrets.mjs --apply   # write to incoming/secrets/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-12";
const SOURCE_NAME = "secrets";

// --- Shared helpers (mirrors crawl-rerankers.mjs) ----------------------------

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
// Each record: { title, repo ("owner/repo" or ""), url, description, license, tags }
// All entries are real, actively maintained secrets managers: central secret
// engines, SaaS credential platforms, Kubernetes-native sync operators,
// encrypt-in-git tools, and CLI secret injectors. Titles are chosen so slugs stay
// disjoint from the existing identity list (authz/IAM/persona products) — e.g.
// "Infisical" vs. the existing third-party "infisical-agent-vault".

const records = [
  {
    title: "HashiCorp Vault",
    repo: "hashicorp/vault",
    url: "https://github.com/hashicorp/vault",
    description: "The reference central secrets manager: identity-based access to static and dynamic secrets, on-demand database/cloud credentials, encryption-as-a-service, leasing and automatic revocation, and a pluggable audit log behind one API.",
    license: "BUSL-1.1",
    tags: ["engine", "dynamic-secrets", "encryption-as-a-service", "self-host"],
  },
  {
    title: "OpenBao",
    repo: "openbao/openbao",
    url: "https://github.com/openbao/openbao",
    description: "The Linux Foundation community fork of Vault, kept under an open MPL-2.0 licence — a drop-in central secret store and encryption service with the same auth methods, secret engines, and HTTP API for teams that need a non-BUSL Vault.",
    license: "MPL-2.0",
    tags: ["engine", "open-source", "vault-fork", "self-host"],
  },
  {
    title: "Infisical",
    repo: "Infisical/infisical",
    url: "https://github.com/Infisical/infisical",
    description: "An open-source secrets platform with a web dashboard, CLI, SDKs, and K8s operator for syncing environment secrets across environments, plus secret scanning and automatic credential rotation, aimed at replacing scattered .env files.",
    license: "MIT",
    tags: ["platform", "dashboard", "cli", "self-host"],
  },
  {
    title: "Doppler",
    repo: "DopplerHQ/cli",
    url: "https://www.doppler.com/",
    description: "A hosted SecretOps platform that centralises every app's secrets and syncs them to local dev, CI, and 100+ deploy targets via its CLI and integrations, so nothing lives in a committed .env and rotation happens in one place.",
    license: "proprietary",
    tags: ["saas", "secretops", "cli", "sync"],
  },
  {
    title: "SOPS",
    repo: "getsops/sops",
    url: "https://github.com/getsops/sops",
    description: "Secrets OPerationS: encrypts the values (not keys) of YAML/JSON/ENV/binary files with age, PGP, or a cloud KMS so secrets can live safely in Git, decrypting transparently at deploy time — the standard GitOps secret format.",
    license: "MPL-2.0",
    tags: ["encrypt-in-git", "gitops", "kms", "cli"],
  },
  {
    title: "Sealed Secrets",
    repo: "bitnami-labs/sealed-secrets",
    url: "https://github.com/bitnami-labs/sealed-secrets",
    description: "A Kubernetes controller and kubeseal CLI that one-way encrypts a Secret into a SealedSecret custom resource only the in-cluster controller can decrypt, letting you commit encrypted secrets to Git for a safe GitOps workflow.",
    license: "Apache-2.0",
    tags: ["kubernetes", "gitops", "controller", "encrypt-in-git"],
  },
  {
    title: "External Secrets Operator",
    repo: "external-secrets/external-secrets",
    url: "https://github.com/external-secrets/external-secrets",
    description: "A Kubernetes operator that reads secrets from external stores (Vault, AWS/GCP/Azure, Doppler, 1Password and dozens more) and materialises them as native K8s Secrets, keeping the cluster in sync with your central source of truth.",
    license: "Apache-2.0",
    tags: ["kubernetes", "operator", "sync", "multi-backend"],
  },
  {
    title: "Akeyless",
    repo: "",
    url: "https://www.akeyless.io/",
    description: "A SaaS secrets-management and secure-remote-access platform using Distributed Fragments Cryptography so no single party (including Akeyless) holds a full key, offering dynamic secrets, certificates, and KMS without self-hosting a vault.",
    license: "proprietary",
    tags: ["saas", "dynamic-secrets", "kms", "zero-knowledge"],
  },
  {
    title: "CyberArk Conjur",
    repo: "cyberark/conjur",
    url: "https://github.com/cyberark/conjur",
    description: "An open-source secrets manager and machine-identity engine for cloud-native and CI/CD workloads: policy-as-code RBAC over secrets, host authentication, and integrations that remove hard-coded credentials from apps and pipelines.",
    license: "Apache-2.0",
    tags: ["engine", "machine-identity", "policy-as-code", "self-host"],
  },
  {
    title: "1Password Secrets Automation",
    repo: "1Password/connect",
    url: "https://developer.1password.com/docs/secrets-automation/",
    description: "1Password's programmatic secrets layer — Connect server, service accounts, SDKs, and the op CLI with secret references — that injects vault items into apps, CI, and infrastructure at runtime instead of pasting keys into config.",
    license: "proprietary",
    tags: ["saas", "cli", "sdk", "injection"],
  },
  {
    title: "Bitwarden Secrets Manager",
    repo: "bitwarden/sdk-sm",
    url: "https://bitwarden.com/products/secrets-manager/",
    description: "Bitwarden's end-to-end encrypted secrets manager for developers and machines, with per-project access, machine accounts, a bws CLI, and SDKs to pull secrets into applications and CI/CD without exposing them in the environment.",
    license: "GPL-3.0",
    tags: ["platform", "end-to-end-encrypted", "cli", "sdk"],
  },
  {
    title: "AWS Secrets Manager",
    repo: "",
    url: "https://aws.amazon.com/secrets-manager/",
    description: "AWS's managed service to store, retrieve, and automatically rotate secrets such as database credentials and API keys, with fine-grained IAM access, KMS encryption, and SDK/CLI retrieval so nothing is embedded in application code.",
    license: "proprietary",
    tags: ["cloud", "managed", "rotation", "aws"],
  },
  {
    title: "Google Secret Manager",
    repo: "",
    url: "https://cloud.google.com/secret-manager",
    description: "Google Cloud's managed secret store with versioned secrets, IAM-scoped access, CMEK encryption, audit logging, and client libraries, giving GCP workloads and agents a central place to fetch credentials at runtime.",
    license: "proprietary",
    tags: ["cloud", "managed", "versioned", "gcp"],
  },
  {
    title: "Azure Key Vault",
    repo: "",
    url: "https://azure.microsoft.com/en-us/products/key-vault",
    description: "Microsoft Azure's managed vault for secrets, keys, and certificates, backed by HSMs, with managed-identity access, soft-delete, and rotation policies so Azure apps retrieve credentials without hard-coding them.",
    license: "proprietary",
    tags: ["cloud", "managed", "hsm", "azure"],
  },
  {
    title: "Pulumi ESC",
    repo: "pulumi/esc",
    url: "https://github.com/pulumi/esc",
    description: "Environments, Secrets, and Configuration: a service and CLI that composes secrets and config from many backends into hierarchical, versioned environments, injecting them as env vars or files for any app, IaC run, or agent.",
    license: "Apache-2.0",
    tags: ["config", "environments", "cli", "multi-backend"],
  },
  {
    title: "Teller",
    repo: "tellerops/teller",
    url: "https://github.com/tellerops/teller",
    description: "A universal secrets CLI that pulls from Vault, AWS/GCP/Azure, Doppler, 1Password and more, injects them into any process's environment, scans code for leaked secrets, and redacts logs — a backend-agnostic developer front end.",
    license: "Apache-2.0",
    tags: ["cli", "injection", "multi-backend", "scanning"],
  },
  {
    title: "Chamber",
    repo: "segmentio/chamber",
    url: "https://github.com/segmentio/chamber",
    description: "Segment's CLI for managing secrets in AWS SSM Parameter Store (and Secrets Manager): write versioned secrets per service and exec any command with them exported as environment variables, keeping them out of task definitions.",
    license: "MIT",
    tags: ["cli", "aws", "parameter-store", "injection"],
  },
  {
    title: "Keywhiz",
    repo: "square/keywhiz",
    url: "https://github.com/square/keywhiz",
    description: "Square's system for distributing and managing secrets, exposing them to services through a memory-only FUSE filesystem (KeywhizFs) and a mutual-TLS API so credentials never touch disk on the consuming host.",
    license: "Apache-2.0",
    tags: ["engine", "mutual-tls", "self-host", "fuse"],
  },
  {
    title: "Pinterest Knox",
    repo: "pinterest/knox",
    url: "https://github.com/pinterest/knox",
    description: "Pinterest's service for storing and rotating secrets, keys, and passwords, with a daemon that caches secrets on each host and automatic key-version rotation, designed for large fleets that need confidential credential distribution.",
    license: "Apache-2.0",
    tags: ["engine", "rotation", "self-host", "fleet"],
  },
  {
    title: "Confidant",
    repo: "lyft/confidant",
    url: "https://github.com/lyft/confidant",
    description: "Lyft's open-source secrets management service that uses AWS KMS and an authenticated token scheme to store and serve secrets at rest, with a web UI for managing which services may read which credentials.",
    license: "Apache-2.0",
    tags: ["service", "aws-kms", "self-host", "web-ui"],
  },
  {
    title: "vals",
    repo: "helmfile/vals",
    url: "https://github.com/helmfile/vals",
    description: "A tool and Go library for inlining secret references (ref+vault://, ref+awssecrets://, ref+sops:// …) inside any YAML/JSON or template, resolving them from the real backend at render time — the secret layer behind Helmfile.",
    license: "MIT",
    tags: ["library", "cli", "templating", "multi-backend"],
  },
  {
    title: "Berglas",
    repo: "GoogleCloudPlatform/berglas",
    url: "https://github.com/GoogleCloudPlatform/berglas",
    description: "A CLI and library for managing secrets on Google Cloud, storing them encrypted in Cloud Storage or Secret Manager and automatically resolving berglas:// references into environment variables for Cloud Run, Functions, and GKE.",
    license: "Apache-2.0",
    tags: ["cli", "library", "gcp", "injection"],
  },
  {
    title: "git-crypt",
    repo: "AGWA/git-crypt",
    url: "https://github.com/AGWA/git-crypt",
    description: "Transparent file encryption in Git: mark paths in .gitattributes and git-crypt encrypts them on commit and decrypts on checkout for authorised GPG keys, so a repo can safely contain secret files while staying clonable by anyone.",
    license: "GPL-3.0",
    tags: ["encrypt-in-git", "gpg", "cli", "transparent"],
  },
  {
    title: "Vault Secrets Operator",
    repo: "hashicorp/vault-secrets-operator",
    url: "https://github.com/hashicorp/vault-secrets-operator",
    description: "HashiCorp's Kubernetes operator that syncs Vault (and HCP Vault Secrets) into native K8s Secrets via custom resources, handling dynamic-secret leases and rotation so pods consume Vault-managed credentials without a sidecar.",
    license: "MPL-2.0",
    tags: ["kubernetes", "operator", "vault", "sync"],
  },
];

// --- Adapter ------------------------------------------------------------------

function secretsAdapter() {
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
          tags: ["secrets-management", "secrets", "credentials", "identity", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} as the credential-storage plane of a harness — the place an agent stores and retrieves the API keys, tokens, database URLs, and signing/wallet keys it needs, instead of a committed .env file. It keeps secrets encrypted at rest, injects them into the process at runtime, and (where supported) rotates and audits them, satisfying the "never commit a raw key" rule every secure agent deployment follows.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's secrets-management list — the credential-storage layer that sits beside the authorization/identity engines (OPA, OpenFGA, SPIRE) but answers the prior question of where the secret itself lives and how it reaches the workload. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-rerankers.mjs) -----------------------------

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
    const adapter = secretsAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[secrets] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[secrets] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[secrets] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
