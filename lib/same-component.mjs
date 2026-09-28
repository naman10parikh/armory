// same-component.mjs: which catalog rows are the same component (CP143 T56, CP147 T07, decision D-08).
//
// One GitHub repository is one row, on any shelf. A row IS a repository when its source_url is the
// repository root in any spelling (any case, `#readme`, `?tab=`, `.git`, `/tree/<branch>`), or when its
// source_url is a registry listing (an mcp.so page) and its source_repo names the repository. A product's
// own website is not its source_repo: fly.io names superfly/flyctl, the command-line tool, not the platform.
// A row that points at a folder or file inside a repository is a component inside it. It is the same
// component only as that same folder or file: under another branch, or as the folder's README.
// Rows on one shelf that point at the very same file are the entries that file lists (hooks/hooks.json
// names 29 hooks), so they are never copies of each other (D-08).
//
// scripts/demote-same-repo.mjs folds every group into one row; scripts/lint-catalog.mjs fails while any
// group is left; ingest/promote.mjs keeps a crawl from adding one. One rule, so they cannot disagree.
import { kindOf, repoRootUrl } from "./rank.mjs";

const lc = (s) => String(s || "").toLowerCase();
// A folder or file inside a repository, keyed without its branch: owner/repo/<path>.
const SUB = /^https?:\/\/(?:www\.)?github\.com\/([^/\s#?]+)\/([^/\s#?]+)\/(?:tree|blob)\/[^/\s#?]+\/([^#?\s]+?)\/?(?:[#?].*)?$/i;

// The GitHub repository a row is (lowercase root URL), or null when the row is not a repository.
export function repositoryOf(row) {
  const root = repoRootUrl(row?.source_url);
  if (root) return lc(root);
  if (kindOf({ url: row?.source_url }) !== "registry") return null; // inside a repository, or a website
  const repo = String(row?.source_repo || "").trim();
  const named = repoRootUrl(repo) || (/^[\w.-]+\/[\w.-]+$/.test(repo) ? `https://github.com/${repo.replace(/\.git$/i, "")}` : null);
  return named ? lc(named) : null;
}

// What two rows share when they are the same component, or null when a row has no such identity.
// `viaRepo` marks a row that is a repository only through its source_repo.
export function componentKey(row) {
  const repo = repositoryOf(row);
  if (repo) return { key: `root:${repo}`, repo: repo.replace("https://github.com/", ""), root: true, viaRepo: !repoRootUrl(row?.source_url) };
  const m = SUB.exec(String(row?.source_url || "").trim());
  if (!m) return null;
  // A folder's README is the folder: `…/blob/main/src/everything/README.md` names `…/tree/main/src/everything`.
  const path = m[3].replace(/\/readme(?:\.md)?$/i, "");
  return { key: `sub:${lc(`${m[1]}/${m[2]}/${path}`)}`, repo: lc(`${m[1]}/${m[2]}`), root: false, viaRepo: false };
}

// Every group of two or more rows that must become one row: { kind, key, repo, rows }.
//   crossShelf        one repository (or folder) on two or more shelves
//   sameShelfSameUrl  one repository on one shelf under two names (PulseMCP and Glama)
//   registryPage      a registry page whose source_repo is a repository already listed (mcp.so)
//   rootWrittenTwice  one repository root written two ways (`repo#readme` beside `repo`)
//   branchTwice       one folder under two branches, or as the folder and its README
export function duplicateGroups(components) {
  const groups = new Map();
  for (const row of components || []) {
    const k = componentKey(row);
    if (!k) continue;
    (groups.get(k.key) || groups.set(k.key, { k, members: [] }).get(k.key)).members.push({ row, k });
  }
  const out = [];
  for (const [key, { k, members }] of groups) {
    if (members.length < 2) continue;
    const rows = members.map((m) => m.row);
    const types = new Set(rows.map((r) => r.type));
    const urls = new Set(rows.map((r) => lc(r.source_url).trim().replace(/\/+$/, "")));
    // One file inside a repository, on one shelf: the entries it lists, not copies (D-08).
    if (!k.root && types.size === 1 && urls.size === 1) continue;
    const kind = types.size > 1 ? "crossShelf"
      : !k.root ? "branchTwice"
      : members.some((m) => m.k.viaRepo) ? "registryPage"
      : urls.size === 1 ? "sameShelfSameUrl" : "rootWrittenTwice";
    out.push({ kind, key, repo: k.repo, rows });
  }
  return out;
}
