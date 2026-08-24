import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORY_LABEL, type ComponentType } from "@/lib/types";
import { Timeline, type TimelineData } from "@/components/timeline";

// Reads catalog.json via node:fs (through getCatalog) at build time — keep this on
// the Node runtime so it's never edge-bundled without the file system.
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "How the index grew — Armory",
  description:
    "The layers the Armory is built from — its sources, its components, the Universal score, the industry verticals, and the ways agents query it. Every number computed from the catalog, no invented dates.",
};

// The 12 industry verticals (display labels). Canonical order mirrors VERTICALS in
// web/lib/rank.mjs — the same buckets the leaderboard filters by.
const VERTICAL_LABELS = [
  "Finance", "Legal", "Healthcare", "E-commerce", "Marketing", "Education",
  "Gaming", "Productivity", "Data & analytics", "Security", "Dev tools", "AI infra",
] as const;

// MCP registries the crawler seeds from: catalog tag → display label. The tag counts
// are real and non-overlapping (a component tagged `glama` is never also `pulsemcp`).
const REGISTRIES: readonly [string, string][] = [
  ["glama", "Glama"], ["pulsemcp", "PulseMCP"], ["mcp-so", "mcp.so"], ["smithery", "Smithery"],
];

// The /graph route now tells the story of HOW the index grew — the layers of the
// Armory, grounded in real catalog aggregates — instead of the old synapse graph.
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
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 24px 96px" }}>
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--accent)",
          margin: 0,
        }}
      >
        the timeline
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(2.4rem, 6vw, 3.5rem)",
          lineHeight: 1.03,
          letterSpacing: "-0.02em",
          color: "var(--text-hi)",
          margin: "10px 0 0",
        }}
      >
        How the index grew.
      </h1>
      <p style={{ color: "var(--text-body)", marginTop: 14, maxWidth: "64ch", lineHeight: 1.6 }}>
        Not a dated history — the <span style={{ color: "var(--text-hi)" }}>layers</span> the Armory
        is built from, in the order an agent meets them. Every figure below is computed straight from{" "}
        <span style={{ color: "var(--text-hi)" }}>catalog.json</span> the moment this page builds —
        so it grows as the shelf does.
      </p>

      <Timeline data={data} />
    </main>
  );
}
