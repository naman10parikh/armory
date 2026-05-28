import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES, type EngramType } from "@/lib/types";
import { BrowseClient } from "./browse-client";

export const metadata: Metadata = {
  title: "Browse — Armory",
  description: "Search and filter agent-harness engrams by category.",
};

const VALID_TYPES = new Set<string>(CATEGORIES.map((c) => c.type));

// Next 15: searchParams is async. We read an optional ?type= to pre-select a facet.
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType: EngramType | null =
    type && VALID_TYPES.has(type) ? (type as EngramType) : null;

  const { engrams, counts } = getCatalog();

  return (
    <BrowseClient
      engrams={engrams}
      countsByType={counts.by_type}
      initialType={initialType}
    />
  );
}
