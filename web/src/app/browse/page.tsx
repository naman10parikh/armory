import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES, type ComponentType } from "@/lib/types";
import { BrowseClient } from "./browse-client";

export const metadata: Metadata = {
  title: "Browse — Armory",
  description: "Search and filter agent-harness components by category.",
};

const VALID_TYPES = new Set<string>(CATEGORIES.map((c) => c.type));

// Next 15: searchParams is async. We read an optional ?type= to pre-select a facet.
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType: ComponentType | null =
    type && VALID_TYPES.has(type) ? (type as ComponentType) : null;

  const { components, counts } = getCatalog();

  return (
    <BrowseClient
      components={components}
      countsByType={counts.by_type}
      initialType={initialType}
    />
  );
}
