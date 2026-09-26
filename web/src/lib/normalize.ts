// The one step every catalog row takes before a page reads it (moved out of catalog.ts, which is server-only,
// so a test can import it: web/test/normalize.test.mjs).
import type { Component } from "./types";

/** Coerce one raw catalog entry into a well-typed Component. The catalog is
 *  machine-generated and growing to thousands of entries, so fields are not
 *  guaranteed to match the contract (e.g. source_repo has shipped as `[]`).
 *  Normalising once here means every consumer (search, cards, detail) gets
 *  clean data and never has to defend against a non-string / non-array. */
export function normalizeComponent(raw: unknown): Component | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  const str = (v: unknown, fallback = ""): string =>
    typeof v === "string" ? v : fallback;
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const numOrNull = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const name = str(e.name);
  const type = str(e.type);
  const path = str(e.path);
  if (!name || !type) return null; // an component with no identity is unusable
  // The name a person sees, only on a row whose slug took a collision suffix (ingest/catalog.mjs carries it the
  // same way): microsoft-playwright-2 reads "microsoft-playwright". Dropped here, the heading showed the slug.
  const title = str(e.title);

  return {
    name,
    ...(title ? { title } : {}),
    type: type as Component["type"],
    description: str(e.description),
    source_repo: str(e.source_repo),
    source_url: str(e.source_url),
    license: str(e.license),
    cli_compat: strArr(e.cli_compat),
    maturity: str(e.maturity) as Component["maturity"],
    stars: numOrNull(e.stars),
    eval_score: numOrNull(e.eval_score),
    mentions: numOrNull(e.mentions),
    verified_at: str(e.verified_at),
    related: strArr(e.related),
    tags: strArr(e.tags),
    path,
  };
}
