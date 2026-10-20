// `armory sandbox-run <name>`: vet an untrusted component inside an isolated E2B sandbox, never on the
// machine that holds your keys (SOUL.md boundary). The sandbox clones the component's source repository and
// reports what a careful reviewer looks at first: size, manifests, install-time scripts that would run code,
// and whether it ships tests. Nothing from the component runs on the host.
// Needs E2B_API_KEY and the optional `e2b` package; both are checked before anything is booted.
import type { Component } from "./catalog.js";

export interface SandboxReport {
  component: string;
  repo: string;
  sandboxId: string;
  files: number;
  manifests: string[];
  installScripts: string[];
  hasTests: boolean;
  verdict: "no install-time code found" | "review install-time code before installing";
}

// Runs inside the VM. Prints one JSON line; it only reads the cloned tree.
const INSPECT = String.raw`
set -e
cd /home/user/c
files=$(git ls-files | wc -l | tr -d ' ')
manifests=$(ls package.json pyproject.toml setup.py Cargo.toml go.mod requirements.txt 2>/dev/null | tr '\n' ',' || true)
scripts=""
if [ -f package.json ]; then
  scripts=$(node -e 'const s=(require("./package.json").scripts)||{};console.log(["preinstall","install","postinstall","prepare"].filter(k=>s[k]).join(","))')
fi
tests=$( (ls -d test tests __tests__ spec 2>/dev/null || true) | head -1)
printf '{"files":%s,"manifests":"%s","scripts":"%s","tests":"%s"}\n' "$files" "$manifests" "$scripts" "$tests"
`;

// The slice of the e2b SDK this file uses, typed here so the CLI compiles without the optional package.
interface E2BSandbox {
  sandboxId: string;
  commands: { run(cmd: string, opts?: { timeoutMs?: number }): Promise<{ exitCode: number; stdout: string; stderr: string }> };
  kill(): Promise<unknown>;
}
interface E2BModule {
  Sandbox: { create(opts: { timeoutMs: number }): Promise<E2BSandbox> };
}
const E2B_PACKAGE = "e2b";

function repoUrl(component: Component): string {
  const repo = component.source_repo || "";
  if (/^[\w.-]+\/[\w.-]+$/.test(repo)) return `https://github.com/${repo}`;
  const m = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/.exec(component.source_url || "");
  if (m) return `https://github.com/${m[1].replace(/\.git$/, "")}`;
  throw new Error(`"${component.name}" has no GitHub source repository to vet`);
}

export async function sandboxVet(component: Component): Promise<SandboxReport> {
  if (!process.env.E2B_API_KEY) {
    throw new Error("E2B_API_KEY is not set. Get a key at https://e2b.dev and export it, then run again.");
  }
  const url = repoUrl(component);
  let Sandbox: E2BModule["Sandbox"];
  try {
    ({ Sandbox } = (await import(E2B_PACKAGE)) as E2BModule);
  } catch {
    throw new Error("the optional `e2b` package is missing. Install the CLI from npm (`npm i -g @namanparikh/armory`), which brings it, then run again.");
  }
  const sandbox = await Sandbox.create({ timeoutMs: 180_000 });
  try {
    const clone = await sandbox.commands.run(`git clone --depth 1 ${url} /home/user/c`, { timeoutMs: 120_000 });
    if (clone.exitCode !== 0) throw new Error(`clone failed inside the sandbox: ${clone.stderr.slice(0, 200)}`);
    const out = await sandbox.commands.run(INSPECT, { timeoutMs: 60_000 });
    const raw = JSON.parse(out.stdout.trim().split("\n").pop() || "{}") as {
      files: number; manifests: string; scripts: string; tests: string;
    };
    const installScripts = raw.scripts ? raw.scripts.split(",").filter(Boolean) : [];
    return {
      component: component.name,
      repo: url,
      sandboxId: sandbox.sandboxId,
      files: Number(raw.files) || 0,
      manifests: raw.manifests ? raw.manifests.split(",").filter(Boolean) : [],
      installScripts,
      hasTests: Boolean(raw.tests),
      verdict: installScripts.length ? "review install-time code before installing" : "no install-time code found",
    };
  } finally {
    await sandbox.kill();
  }
}
