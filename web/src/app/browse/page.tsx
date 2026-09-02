import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES, type ComponentType } from "@/lib/types";
import type { ComponentScore } from "@/components/component-card";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs)
import { computeRows } from "../../../lib/rank.mjs";
import { BrowseClient } from "./browse-client";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Browse · Armory",
  description: "Search and filter agent-harness components by type.",
};

const VALID_TYPES = new Set<string>(CATEGORIES.map((c) => c.type));

/** Comma-separated `?type=` (or a single legacy value) → the valid subset. */
function parseTypes(raw: string | undefined): ComponentType[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is ComponentType => VALID_TYPES.has(t));
}

interface EngineRow {
  name: string;
  signals: ComponentScore["signals"];
  scores: { universal: number | null; evidence: number };
}

// Next 15: searchParams is async. `type` supports multiple comma-separated values
// (the client's facet rail is multi-select); `q` pre-fills the search box — both
// so a link into /browse reproduces the exact view (design/BRIEF.md rule #2).
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type, q } = await searchParams;
  const initialTypes = parseTypes(type);
  const initialQuery = typeof q === "string" ? q : "";

  const { components, counts } = getCatalog();

  // Score every component with the SAME engine the home page, leaderboard and
  // /formula use (lib/rank.mjs) — computed once here on data already fetched
  // above (no second catalog.json parse). computeRows is a 1:1 .map, so
  // scored[i] pairs exactly with components[i]; the lookup key mirrors the
  // detail route (`type/name`) so ComponentCard can key off it directly.
  const scored = computeRows(components) as EngineRow[];
  const scores: Record<string, ComponentScore> = {};
  scored.forEach((row, i) => {
    const c = components[i];
    if (!c) return;
    scores[`${c.type}/${c.name}`] = {
      universal: row.scores.universal,
      evidence: row.scores.evidence,
      signals: row.signals,
    };
  });

  return (
    <BrowseClient
      components={components}
      countsByType={counts.by_type}
      scores={scores}
      initialTypes={initialTypes}
      initialQuery={initialQuery}
    />
  );
}
