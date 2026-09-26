// credit.mjs — the row a contributor's mention reaches (CP143). A mention names a repository, and it belongs to
// that repository's root row: never a file or folder inside the repository, and never a row on another shelf that
// only shares the root row's slug. Both went wrong until 2026-09-26: Sentinel's feed credited Mastra's notes
// (github.com/mastra-ai/mastra) to mcps/mastra-docs, a folder of that repository, and a slug held on two shelves
// (firecrawl-firecrawl is a tool row and an MCP row) sent the credit to whichever row the catalog listed last.
//   • An `existing` entry reaches a root row of the repository its GitHub link names: the contributor's own match
//     when it is one, otherwise the first.
//   • When that repository has no root row, the entry is a `new` candidate, and the intake gate decides.
//   • An entry with no GitHub link keeps the contributor's match by name: there is no repository to compare.
import { repoRootUrl } from "../lib/rank.mjs";

const rootOf = (url) => repoRootUrl(url)?.toLowerCase() ?? null;
// The repository a link names, a folder link included: github.com/o/r/tree/main/x names github.com/o/r.
const repositoryOf = (url) => {
  const m = String(url || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?)]+)/i);
  return m ? `https://github.com/${m[1]}/${m[2].replace(/\.git$/i, "")}`.toLowerCase() : null;
};

// → { credited: [{ entry, row }], fresh: [entry], moved: [{ tool, from, to }] }. Nothing is mutated.
export function creditRows(feed, components) {
  const roots = new Map();
  for (const c of components || []) {
    const k = rootOf(c.source_url);
    if (k) roots.set(k, [...(roots.get(k) || []), c]);
  }
  const byName = new Map((components || []).map((c) => [c.name, c]));
  const credited = [], fresh = [], moved = [];
  const label = (r) => (r ? `${r.type}/${r.name}` : null);
  for (const e of feed.existing || []) {
    const named = byName.get(e.armory_name);
    const repo = (e.urls || []).map(repositoryOf).find(Boolean);
    if (!repo) { credited.push({ entry: e, row: named }); continue; }
    const rows = roots.get(repo) || [];
    const row = rows.includes(named) ? named : rows[0];
    if (row) credited.push({ entry: e, row });
    else fresh.push(e);
    if (row !== named) moved.push({ tool: e.name, from: label(named), to: label(row) });
  }
  return { credited, fresh, moved };
}
