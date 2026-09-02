import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORY_LABEL, type ComponentType } from "@/lib/types";
import { ContentWidth } from "@/components/data-table";
import { Timeline, type TimelineData } from "@/components/timeline";

// Reads catalog.json via node:fs (through getCatalog) at build time — keep this on
// the Node runtime so it's never edge-bundled without the file system.
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "How the index grew · Armory",
  description:
    "The layers the Armory is built from — its sources, its components, the Universal score, the industry verticals, and the ways agents query it. Every number computed from the catalog, no invented dates.",
};

// The 12 industry verticals (display labels), Title Case per COPY.md R3. Canonical
// order mirrors VERTICALS in web/lib/rank.mjs — the same buckets the leaderboard
// filters by.
const VERTICAL_LABELS = [
  "Finance", "Legal", "Healthcare", "E-commerce", "Marketing", "Education",
  "Gaming", "Productivity", "Data & Analytics", "Security", "Dev Tools", "AI Infra",
] as const;

// MCP registries the crawler seeds from: catalog tag → display label. The tag counts
// are real and non-overlapping (a component tagged `glama` is never also `pulsemcp`).
const REGISTRIES: readonly [string, string][] = [
  ["glama", "Glama"], ["pulsemcp", "PulseMCP"], ["mcp-so", "mcp.so"], ["smithery", "Smithery"],
];

// The /graph route tells the story of HOW the index grew — the layers of the
// Armory, grounded in real catalog aggregates. No brain/synapse vocabulary and no
// relation graph here (design/BRIEF.md Approval #3): the old synapse canvas is gone,
// and `related:` is loose co-occurrence, not a citable dependency edge.
export default function GrowthPage() {
  const { components, counts } = getCatalog();

  // Sources: registries by tagged count + the top hand-curated source repos, and the
  // total distinct source repositories deduped into the catalog.
  const registries = REGISTRIES
    .map(([tag, label]) => ({
      label,
      count: components.reduce((n, c) => n + (c.tags.includes(tag) ? 1 : 0), 0),
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const repoCounts = new Map<string, number>();
  for (const c of components) {
    if (c.source_repo) repoCounts.set(c.source_repo, (repoCounts.get(c.source_repo) ?? 0) + 1);
  }
  const distinctRepos = repoCounts.size;
  const collections = [...repoCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  // Components: the 12 canonical kinds from the catalog's own counts (summing to
  // counts.total), sorted so the dominant kinds read first.
  const types = (Object.entries(counts.by_type) as [ComponentType, number][])
    .map(([t, count]) => ({ label: CATEGORY_LABEL[t], count }))
    .sort((a, b) => b.count - a.count);

  // Ranking: how many components carry a measured popularity signal (stars/usage).
  const starsSignal = components.reduce((n, c) => n + (c.stars != null ? 1 : 0), 0);

  const data: TimelineData = {
    total: counts.total,
    registries,
    collections,
    distinctRepos,
    types,
    starsSignal,
    verticals: [...VERTICAL_LABELS],
  };

  return (
    <ContentWidth className="pb-24 pt-8">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Timeline</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">
        How the index grew
      </h1>
      <p className="mt-3 max-w-[64ch] text-[16px] leading-[1.5] text-ink-body">
        The layers the Armory is built from, in the order an agent meets them
      </p>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
        Not a dated history. Every figure below is computed straight from{" "}
        <code className="rounded border border-line bg-raise-1 px-1.5 py-0.5 font-mono text-[12px] text-ink-body">
          catalog.json
        </code>{" "}
        the moment this page builds, so it grows as the shelf does.
      </p>

      <Timeline data={data} />
    </ContentWidth>
  );
}
