// GitHub fetch helpers for `armory install`. Components live in public GitHub
// repos; we resolve a component's source_url/source_repo into concrete file
// content. Preferred path is the authed `gh` CLI (higher rate limits, private
// repos); the fallback is an unauthenticated curl against raw.githubusercontent.
import { execFileSync } from "node:child_process";

export interface RepoRef {
  owner: string;
  repo: string;
  ref: string; // branch or tag; defaults to the repo default when unknown
  // Path to a file (blob) or directory (tree) within the repo, "" for root.
  path: string;
  // True when the URL pointed at a specific file (…/blob/…), not a repo root.
  isFile: boolean;
}

// Parse a GitHub URL into owner/repo/ref/path. Handles the two shapes the
// catalog uses: repo-root URLs (github.com/owner/repo) and blob/tree URLs
// (github.com/owner/repo/blob/<ref>/<path>). `repoFallback` (the catalog's
// source_repo "owner/repo") backstops malformed URLs.
export function parseGitHubUrl(sourceUrl: string, repoFallback: string): RepoRef | null {
  let owner = "";
  let repo = "";
  let ref = "main";
  let path = "";
  let isFile = false;

  const m = sourceUrl.match(/github\.com\/([^/]+)\/([^/]+)(\/(blob|tree)\/([^/]+)\/(.+))?/i);
  if (m) {
    owner = m[1];
    repo = m[2].replace(/\.git$/, "");
    if (m[4]) {
      ref = m[5];
      path = m[6].replace(/[#?].*$/, "");
      isFile = m[4].toLowerCase() === "blob";
    }
  } else if (repoFallback.includes("/")) {
    const [o, r] = repoFallback.split("/");
    owner = o;
    repo = r.replace(/\.git$/, "");
  }

  if (!owner || !repo) return null;
  return { owner, repo, ref, path, isFile };
}

// stderr is captured, not printed: a probe that 404s (no SKILL.md at the root, say) is an answer the
// caller turns into a plain "Not installed" line, not a stray "gh: Not Found" above it.
function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}

function curl(url: string): string {
  return execFileSync("curl", ["-sL", "--fail", url], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

// Fetch one file's text. Tries `gh api …/contents/<path>` (base64), then falls
// back to raw.githubusercontent. Throws only if both fail.
export function fetchFile(ref: RepoRef, filePath: string): string {
  const apiPath = `repos/${ref.owner}/${ref.repo}/contents/${filePath}?ref=${ref.ref}`;
  try {
    const b64 = gh(["api", apiPath, "--jq", ".content"]).trim();
    if (b64) return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    // fall through to curl
  }
  return curl(`https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.ref}/${filePath}`);
}

export interface DirEntry {
  name: string;
  type: "file" | "dir";
  path: string;
}

// List a directory's immediate entries via the contents API. Returns [] on
// failure (caller decides whether that is fatal).
export function listDir(ref: RepoRef, dirPath: string): DirEntry[] {
  try {
    const out = gh([
      "api",
      `repos/${ref.owner}/${ref.repo}/contents/${dirPath}?ref=${ref.ref}`,
      "--jq",
      ".[] | {name: .name, type: .type, path: .path} | @json",
    ]);
    return out
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l) as DirEntry);
  } catch {
    return [];
  }
}

// Resolve the npm package name for a repo by reading its package.json. Used to
// derive an `npx -y <name>` command when the body has no explicit snippet.
export function fetchNpmName(ref: RepoRef): string | null {
  const pkgPath = ref.isFile ? joinDir(ref.path) : ref.path;
  const candidate = pkgPath ? `${pkgPath}/package.json` : "package.json";
  try {
    const text = fetchFile(ref, candidate);
    const parsed = JSON.parse(text) as { name?: string };
    return typeof parsed.name === "string" && parsed.name.length > 0 ? parsed.name : null;
  } catch {
    return null;
  }
}

// Directory portion of a file path ("a/b/c.md" -> "a/b", "c.md" -> "").
function joinDir(p: string): string {
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

export interface RunCommand {
  command: string;
  args: string[];
}

// Recognised launcher prefixes for MCP run-commands embedded in a body.
const LAUNCHERS = ["npx", "uvx", "uv", "docker", "bunx", "pnpm", "deno", "node", "python", "python3"];

// Extract the first plausible MCP run-command from free text. We scan for a
// launcher token (npx/uvx/docker/…) and split the rest into argv, stripping
// shell noise. Returns null when nothing matches.
export function parseRunCommand(text: string): RunCommand | null {
  // Prefer fenced/inline code, but fall back to scanning every line.
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.replace(/`/g, "").replace(/^\s*\$\s*/, "").trim();
    const tokens = line.split(/\s+/).filter(Boolean);
    const startIdx = tokens.findIndex((t) => LAUNCHERS.includes(t));
    if (startIdx === -1) continue;
    const slice = tokens
      .slice(startIdx)
      .filter((t) => t !== "&&" && !t.startsWith("#"))
      // Strip prose punctuation that bleeds in from inline sentences like
      // "Install: `npx -y vatnode-mcp`." — trailing . , ; ) and stray quotes.
      .map((t) => t.replace(/^["'`]+/, "").replace(/["'`.,;)]+$/, ""));
    const command = slice[0];
    const args = slice.slice(1).filter((a) => a.length > 0 && !a.includes("&&"));
    // A bare launcher with no package isn't useful.
    if (args.length === 0 && command !== "docker") continue;
    return { command, args };
  }
  return null;
}

// --- Is the downloaded package the component's own? (CP143) -------------------
// `npx -y <name>` and `uvx <name>` run whatever the public registry holds under a name. A note's text
// or a repository's package.json name is only a claim: `github-mcp-server` on npm is not GitHub's.
// Before writing such a command, ask the registry where the package is published from (read-only),
// and write it only when that is the component's own repository (for a ghcr.io image, its owner).
// scripts/check-installs.mjs applies the same rule for the website.

// Launchers that download code by name. Anything else (node, python, uv run) runs local files.
export const DOWNLOADING = new Set(["npx", "uvx", "bunx", "pnpm", "deno", "docker"]);

export interface PackageRef {
  registry: "npm" | "pypi" | "ghcr";
  name: string;
}

// npx: the first non-flag argument or the value of -p/--package, version dropped. uvx: the first
// non-flag argument or --from, version and extras dropped. docker: a ghcr.io image.
export function packageOf(run: RunCommand): PackageRef | null {
  const first = (flags: string[]): string | null => {
    for (let i = 0; i < run.args.length; i += 1) {
      const a = run.args[i];
      if (flags.includes(a)) return run.args[i + 1] ?? null;
      const eq = flags.find((f) => a.startsWith(`${f}=`));
      if (eq) return a.slice(eq.length + 1);
      if (!a.startsWith("-")) return a;
    }
    return null;
  };
  if (run.command === "npx") {
    const raw = first(["-p", "--package"]);
    const name = raw && (raw.startsWith("@") ? raw.replace(/^(@[^/@]+\/[^@]+)@.*$/, "$1") : raw.replace(/@.*$/, ""));
    return name && /^(@[a-z0-9][\w.~-]*\/)?[a-z0-9][\w.~-]*$/i.test(name) ? { registry: "npm", name } : null;
  }
  if (run.command === "uvx") {
    const raw = first(["--from"]);
    const name = raw && raw.replace(/\[.*$/, "").replace(/[=<>!~@].*$/, "");
    return name && /^[a-z0-9][\w.-]*$/i.test(name) ? { registry: "pypi", name } : null;
  }
  if (run.command === "docker") {
    const image = run.args.find((a) => /^ghcr\.io\/[^/\s]+\/\S+$/i.test(a));
    return image ? { registry: "ghcr", name: image } : null;
  }
  return null;
}

// "git+https://github.com/o/r.git", "github:o/r", "o/r" → "o/r", lower case.
export function repoOf(value: unknown): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  const m = s.match(/github\.com[/:]([^/\s]+)\/([^/#?\s]+)/i) || s.match(/^(?:github:)?([\w.-]+)\/([\w.-]+)$/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/i, "")}`.toLowerCase() : null;
}

// Where the registry says a package comes from, or why that could not be confirmed.
function publishedFrom(pkg: PackageRef, repo: string): { from: string | null; why: string } {
  try {
    if (pkg.registry === "npm") {
      const doc = JSON.parse(curl(`https://registry.npmjs.org/${pkg.name.replace("/", "%2F")}/latest`)) as {
        repository?: string | { url?: string };
      };
      const from = repoOf(typeof doc.repository === "string" ? doc.repository : doc.repository?.url);
      return { from, why: from ? `npm says it comes from ${from}` : "npm lists no repository for it" };
    }
    if (pkg.registry === "pypi") {
      const doc = JSON.parse(curl(`https://pypi.org/pypi/${encodeURIComponent(pkg.name)}/json`)) as {
        info?: { home_page?: string; download_url?: string; project_urls?: Record<string, string> };
      };
      const urls = [doc.info?.home_page, doc.info?.download_url, ...Object.values(doc.info?.project_urls ?? {})];
      const repos = urls.map(repoOf).filter((r): r is string => r !== null);
      const from = repos.find((r) => r === repo) ?? repos[0] ?? null;
      return { from, why: from ? `PyPI says it comes from ${from}` : "PyPI lists no GitHub repository for it" };
    }
    const owner = pkg.name.split("/")[1].toLowerCase();
    return { from: owner, why: `the image belongs to ${owner}` };
  } catch {
    return { from: null, why: `the ${pkg.registry === "pypi" ? "PyPI" : "npm"} registry has no such package, or did not answer` };
  }
}

// True when the package is published from `repo` ("owner/name"); otherwise why not.
export function checkPackage(pkg: PackageRef, repo: string): { ok: boolean; why: string } {
  const r = repo.toLowerCase();
  const { from, why } = publishedFrom(pkg, r);
  const ok = pkg.registry === "ghcr" ? from === r.split("/")[0] : from === r;
  return { ok, why };
}

// The command in its plain form, so prose that followed it in a note never reaches a config.
export function plainRun(run: RunCommand, pkg: PackageRef): RunCommand {
  if (pkg.registry === "npm") return { command: "npx", args: ["-y", pkg.name] };
  if (pkg.registry === "pypi") return { command: "uvx", args: [pkg.name] };
  return { command: run.command, args: run.args.slice(0, run.args.indexOf(pkg.name) + 1) };
}
