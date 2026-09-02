import Link from "next/link";
import { CATEGORIES, WEDGE_TYPES, type CatalogCounts } from "@/lib/types";
import { Reveal } from "./reveal";
import { ArrowRightIcon, TypeIcon } from "./icons";

/*
  Asymmetric 12-category bento. NOT 12 equal cards (slop). Explicit 12-col spans
  give the editorial rhythm; the four WEDGE categories carry an amber eyebrow to
  signal "this is what other lists miss." Counts come from the catalog and are
  rendered FINAL. Mobile collapses every tile to a single column.
*/

// Span pattern (md+, 12-col grid). Mirrors the brief's example layout.
const SPAN: Record<string, string> = {
  mcps: "md:col-span-7",
  skills: "md:col-span-5",
  hooks: "md:col-span-4",
  subagents: "md:col-span-4",
  identity: "md:col-span-4",
  memory: "md:col-span-5",
  "claudemd-rules": "md:col-span-7",
  // wedge band — equal quarter-spans, set apart by the eyebrow
  "clis-tools": "md:col-span-3",
  evals: "md:col-span-3",
  observability: "md:col-span-3",
  infrastructure: "md:col-span-3",
  workflows: "md:col-span-12",
};

export function CategoryBento({ counts }: { counts: CatalogCounts }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      {CATEGORIES.map((cat, i) => {
        const count = counts.by_type[cat.type] ?? 0;
        const wedge = WEDGE_TYPES.has(cat.type);
        return (
          <Reveal
            key={cat.type}
            index={Math.min(i, 11)}
            className={SPAN[cat.type] ?? "md:col-span-4"}
          >
            <Link
              href={`/browse?type=${cat.type}`}
              className="group relative flex h-full min-h-[140px] cursor-pointer flex-col justify-between rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle transition duration-[220ms] ease-out-quart hover:-translate-y-0.5 hover:ring-accent-line"
            >
              <div className="flex h-full flex-col justify-between rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5 transition-colors duration-[220ms] group-hover:bg-raise-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {wedge && (
                      <span className="mb-2 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                        the wedge
                      </span>
                    )}
                    <h3 className="flex items-center gap-2 font-serif text-2xl leading-tight text-ink-hi">
                      <TypeIcon
                        type={cat.type}
                        size={18}
                        className={wedge ? "text-accent" : "text-ink-muted"}
                      />
                      {cat.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-snug text-ink-muted">
                      {cat.blurb}
                    </p>
                  </div>
                  {/* Rendered FINAL — no animated numbers (design/BRIEF.md §1.2). */}
                  <data
                    value={String(count)}
                    className="shrink-0 font-sans text-2xl font-semibold tabular-nums text-ink-hi"
                  >
                    {count.toLocaleString("en-US")}
                  </data>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted opacity-0 transition-opacity duration-[220ms] group-hover:text-accent-hover group-hover:opacity-100">
                  Browse {cat.label}
                  <ArrowRightIcon size={13} />
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
