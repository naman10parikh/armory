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

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
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
