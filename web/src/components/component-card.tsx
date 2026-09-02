import Link from "next/link";
import type { Component } from "@/lib/types";
import { CliChip, MaturityBadge, TagChip, TypeBadge } from "./badges";
import { ArrowRightIcon, StarIcon, TypeIcon } from "./icons";
import { QuickInstall } from "./quick-install";
import { ScoreBadge } from "./score-badge";
import { SignalsRow, type SignalValues } from "./signals-row";

/** The Universal score + its four signals for one component (design/BRIEF.md §9).
 *  Optional — a caller without a scored catalog (e.g. a bare related-component
 *  list) simply omits it and the card renders without the badge/row. */
export interface ComponentScore {
  universal: number | null;
  evidence: number;
  signals: SignalValues;
}

/*
  The atomic unit — one component, via the Double-Bezel (outer shell +
  inner core + top inner highlight). Hover lifts 2px, border goes amber, faint
  wash; :active presses.

  Clickability model: a SINGLE absolutely-positioned link overlay covers the whole
  inner core, so anywhere on the card navigates to the detail route. Interactive
  controls that must NOT navigate (the quick-install tray, the source link) sit in
  the footer with `pointer-events-auto` + a higher z-index, above the overlay.
*/
export function ComponentCard({
  component,
  score = null,
}: {
  component: Component;
  score?: ComponentScore | null;
}) {
  const href = `/e/${component.type}/${component.name}`;
  return (
    // Outer shell (bezel)
    <article className="group relative h-full rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle transition duration-[220ms] ease-out-quart hover:ring-accent-line hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]">
      {/* Inner core (positioning context for the whole-card link) */}
      <div className="relative flex h-full flex-col rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5 shadow-[inset_0_1px_0_var(--line-subtle)] transition-colors duration-[220ms] group-hover:bg-raise-3">
        {/* Whole-card link overlay — covers the entire core. Title text is shown
            separately above it so it can also be the accessible link label. */}
        <Link
          href={href}
          aria-label={`${component.name} — open detail`}
          className="absolute inset-0 z-[1] cursor-pointer rounded-[calc(1.25rem-0.375rem)] outline-none"
        />

        {/* Row 1: glyph + type · maturity */}
        <div className="pointer-events-none relative z-[2] mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2">
            <TypeIcon type={component.type} size={16} className="text-accent" />
            <TypeBadge type={component.type} />
          </span>
          <MaturityBadge maturity={component.maturity} />
        </div>

        {/* Row 2: name */}
        <h3 className="pointer-events-none relative z-[2] font-sans text-lg font-semibold leading-tight text-ink-hi transition-colors group-hover:text-accent-hover">
          {component.name}
        </h3>

        {/* Row 3: description, clamped */}
        <p className="pointer-events-none relative z-[2] mt-2 line-clamp-2 text-sm leading-relaxed text-ink-body">
          {component.description}
        </p>

        {/* Row 4: score + signals (when the card was handed a scored row) or the CLI
            compat strip. Falls back to the raw stars/eval fields for callers that
            don't scope a scored catalog (e.g. a bare related-component list). */}
        {score ? (
          <div className="pointer-events-none relative z-[2] mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <ScoreBadge score={score.universal} evidence={score.evidence} />
            <SignalsRow signals={score.signals} />
          </div>
        ) : (
          (typeof component.stars === "number" || typeof component.eval_score === "number") && (
            <div className="pointer-events-none relative z-[2] mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 tabular-nums">
              {typeof component.stars === "number" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                  <StarIcon size={12} className="text-accent" />
                  {component.stars.toLocaleString()}
                </span>
              )}
              {typeof component.eval_score === "number" && (
                <span className="text-[11px] text-ink-muted">
                  eval{" "}
                  <span className="text-accent-hover">{component.eval_score.toFixed(2)}</span>
                </span>
              )}
            </div>
          )
        )}
        {component.cli_compat.length > 0 && (
          <div className="pointer-events-none relative z-[2] mt-2 flex flex-wrap items-center gap-1.5">
            {component.cli_compat.slice(0, 5).map((cli) => (
              <CliChip key={cli} cli={cli} />
            ))}
          </div>
        )}

        {/* Row 5: tags */}
        {component.tags.length > 0 && (
          <div className="pointer-events-none relative z-[2] mt-3 flex flex-wrap gap-1.5">
            {component.tags.slice(0, 4).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Footer: compact one-click install + a link to the detail page's
            connections. Interactive — sits above the overlay (z-10, pointer-events
            restored). */}
        <div className="relative z-10 mt-4 border-t border-line-subtle pt-3">
          <div className="flex items-center justify-between gap-2">
            <QuickInstall component={component} />
            <Link
              href={href}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:text-accent-hover group-hover:text-accent-hover"
            >
              Connections
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-quiet">
                <ArrowRightIcon size={12} className="text-accent" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// A lighter skeleton with the same footprint — shown while the browse list
// computes / on first paint. Matches the card layout, never a spinner.
export function ComponentCardSkeleton() {
  return (
    <div className="h-full animate-pulse rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
      <div className="flex h-full flex-col rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5">
        <div className="mb-4 h-3 w-20 rounded bg-raise-3" />
        <div className="h-4 w-2/3 rounded bg-raise-3" />
        <div className="mt-3 h-3 w-full rounded bg-raise-3/70" />
        <div className="mt-2 h-3 w-5/6 rounded bg-raise-3/70" />
        <div className="mt-auto flex gap-2 pt-6">
          <div className="h-4 w-12 rounded bg-raise-3/60" />
          <div className="h-4 w-12 rounded bg-raise-3/60" />
        </div>
      </div>
    </div>
  );
}
