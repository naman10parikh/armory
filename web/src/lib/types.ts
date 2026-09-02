// The component contract — mirrors the frontmatter schema in CONTRIBUTING.md and
// the fields emitted by ingest/catalog.mjs. Kept in sync by hand; the catalog
// generator is the source of truth for shape.

export type Maturity = "experimental" | "beta" | "stable" | "";

export type ComponentType =
  | "mcps"
  | "skills"
  | "hooks"
  | "subagents"
  | "identity"
  | "memory"
  | "claudemd-rules"
  | "clis-tools"
  | "evals"
  | "observability"
  | "infrastructure"
  | "workflows";

export interface Component {
  name: string;
  type: ComponentType;
  description: string;
  source_repo: string;
  source_url: string;
  license: string;
  cli_compat: string[];
  maturity: Maturity;
  stars: number | null;
  eval_score: number | null;
  mentions: number | null;
  verified_at: string;
  related: string[];
  tags: string[];
  path: string;
}

export interface CatalogCounts {
  total: number;
  by_type: Record<ComponentType, number>;
}

export interface Catalog {
  generated_at: string;
  counts: CatalogCounts;
  components: Component[];
}

// Display metadata for the 12 categories. Order is canonical (matches the
// catalog generator TYPES array). The last four are the wedge.
export interface CategoryMeta {
  type: ComponentType;
  label: string;
  blurb: string;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  { type: "mcps", label: "MCPs", blurb: "servers, registries, transports, auth" },
  { type: "skills", label: "Skills", blurb: "coding, workflow, domain, meta" },
  { type: "hooks", label: "Hooks", blurb: "by event, by purpose, SDKs" },
  { type: "subagents", label: "Sub-Agents", blurb: "roles, swarms, orchestration" },
  { type: "identity", label: "Identity", blurb: "SOUL, persona, brand, format specs" },
  { type: "memory", label: "Memory", blurb: "bootstrap, compression, layers" },
  { type: "claudemd-rules", label: "CLAUDE.md / Rules", blurb: "behavior norms, language packs" },
  { type: "clis-tools", label: "CLIs & Tools", blurb: "agent toolkits, provisioning" },
  { type: "evals", label: "Evals", blurb: "rubrics, golden tasks, harnesses" },
  { type: "observability", label: "Observability", blurb: "tracing, platforms, dashboards" },
  { type: "infrastructure", label: "Infrastructure", blurb: "sandboxing, browser, deploy, payments" },
  { type: "workflows", label: "Workflows", blurb: "recipes, presets, compositions" },
] as const;

export const CATEGORY_LABEL: Record<ComponentType, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.type, c.label]),
) as Record<ComponentType, string>;

// The four "wedge" categories — what every other agent-list under-covers. These
// get amber eyebrows + larger spans in the bento to signal the differentiator.
export const WEDGE_TYPES: ReadonlySet<ComponentType> = new Set([
  "clis-tools",
  "evals",
  "observability",
  "infrastructure",
]);

// A stable, desaturated/tinted 12-hue map for graph node colour-by-type. All in
// OKLCH, kept low-chroma so amber (reserved for the active node) stays the loud
// one. Used only on the synapse-graph canvas, never as the sole signal in UI.
export const TYPE_HUE: Record<ComponentType, string> = {
  mcps: "oklch(70% 0.07 200)",
  skills: "oklch(72% 0.07 160)",
  hooks: "oklch(70% 0.07 300)",
  subagents: "oklch(72% 0.07 260)",
  identity: "oklch(72% 0.07 20)",
  memory: "oklch(70% 0.07 330)",
  "claudemd-rules": "oklch(72% 0.06 100)",
  "clis-tools": "oklch(74% 0.08 75)",
  evals: "oklch(74% 0.08 60)",
  observability: "oklch(72% 0.07 130)",
  infrastructure: "oklch(72% 0.07 240)",
  workflows: "oklch(74% 0.08 90)",
};
