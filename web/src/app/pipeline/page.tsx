import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CANON_SLUGS, stackFor, statsFor } from "@/lib/canon";
import { ContentWidth } from "@/components/data-table";
import { Timeline, type TimelineData } from "@/components/timeline";
import { boardMeta } from "@/lib/rows";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { WEIGHTS, BLEND } from "../../../lib/rank.mjs";

// Reads catalog.json via node:fs (through getCatalog) at build time — keep this on
// the Node runtime so it's never edge-bundled without the file system.
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Pipeline · Armory",
  description:
    "The layers the catalog is built from: sources, components, the Score, industry verticals and the ways agents query it.",
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

// /pipeline (the old /graph and /timeline addresses redirect here, next.config.mjs) shows the layers
// of the Armory, grounded in real catalog aggregates. No brain/synapse vocabulary and no
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

  // Components: the 11 harness components under the names their pages use (/c), each with the rows it
  // holds, so /pipeline and /c can never disagree (CP138 T23). Every row sits in exactly one, so the
  // counts sum to the catalog total. Sorted so the largest reads first.
  const types = CANON_SLUGS.map((slug) => ({ label: stackFor(slug)?.label ?? slug, count: statsFor(slug).indexed }))
    .sort((a, b) => b.count - a.count);

  // Ranking: how many components the engine ranks (at least one signal), the signals it scores on, and
  // the blend, all from lib/rank.mjs, never typed here (CP138 T51).
  const signals = Object.keys(WEIGHTS as Record<string, number>).map((k) => k.charAt(0).toUpperCase() + k.slice(1));

  const data: TimelineData = {
    total: counts.total,
    registries,
    collections,
    distinctRepos,
    types,
    ranked: boardMeta().ranked,
    signals,
    blend: BLEND as { base: number; others: number },
    verticals: [...VERTICAL_LABELS],
  };

  return (
    <ContentWidth className="pb-24 pt-8">
      <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">Pipeline</h1>
      <p className="mt-3 max-w-[64ch] text-[16px] leading-[1.5] text-ink-body">
        The layers the Armory is built from, in the order an agent meets them
      </p>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
        Every figure below is computed from{" "}
        <code className="rounded border border-line bg-raise-1 px-1.5 py-0.5 font-sans text-[12px] text-ink-body">
          catalog.json
        </code>{" "}
        when this page builds.
      </p>

      <Timeline data={data} />
    </ContentWidth>
  );
}
