import Link from "next/link";
import type { Engram } from "@/lib/types";
import { CliChip, MaturityBadge, TagChip, TypeBadge } from "./badges";
import { ArrowRightIcon, StarIcon, TypeIcon } from "./icons";
import { QuickInstall } from "./quick-install";

/*
  The atomic unit — one recallable engram, as a "memory chip" via the Double-Bezel
  (outer shell + inner core + top inner highlight). Hover lifts 2px, border goes
  amber, faint wash; :active presses.

  Clickability model: a SINGLE absolutely-positioned link overlay covers the whole
  inner core, so anywhere on the card navigates to the detail route. Interactive
  controls that must NOT navigate (the quick-install tray, the source link) sit in
  the footer with `pointer-events-auto` + a higher z-index, above the overlay.
*/
export function EngramCard({ engram }: { engram: Engram }) {
  const href = `/e/${engram.type}/${engram.name}`;
  return (
    // Outer shell (bezel)
    <article className="group relative h-full rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle transition duration-[220ms] ease-out-quart hover:ring-accent-line hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]">
      {/* Inner core (positioning context for the whole-card link) */}
      <div className="relative flex h-full flex-col rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5 shadow-[inset_0_1px_0_oklch(100%_0_0/0.06)] transition-colors duration-[220ms] group-hover:bg-raise-3">
        {/* Whole-card link overlay — covers the entire core. Title text is shown
            separately above it so it can also be the accessible link label. */}
        <Link
          href={href}
          aria-label={`${engram.name} — open detail`}
          className="absolute inset-0 z-[1] cursor-pointer rounded-[calc(1.25rem-0.375rem)] outline-none"
        />

        {/* Amber wash on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[calc(1.25rem-0.375rem)] bg-[radial-gradient(20rem_12rem_at_80%_-20%,var(--accent-quiet),transparent_60%)] opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100"
        />

        {/* Row 1: glyph + type · maturity */}
        <div className="pointer-events-none relative z-[2] mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2">
            <TypeIcon type={engram.type} size={16} className="text-accent" />
            <TypeBadge type={engram.type} />
          </span>
          <MaturityBadge maturity={engram.maturity} />
        </div>

        {/* Row 2: name */}
        <h3 className="pointer-events-none relative z-[2] font-sans text-lg font-semibold leading-tight text-ink-hi transition-colors group-hover:text-accent-hover">
          {engram.name}
        </h3>

        {/* Row 3: description, clamped */}
        <p className="pointer-events-none relative z-[2] mt-2 line-clamp-2 text-sm leading-relaxed text-ink-body">
          {engram.description}
        </p>

        {/* Row 4: meta strip (tabular-nums) */}
        {(typeof engram.stars === "number" ||
          typeof engram.eval_score === "number" ||
          engram.cli_compat.length > 0) && (
          <div className="pointer-events-none relative z-[2] mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 tabular-nums">
            {typeof engram.stars === "number" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                <StarIcon size={12} className="text-accent" />
                {engram.stars.toLocaleString()}
              </span>
            )}
            {typeof engram.eval_score === "number" && (
              <span className="text-[11px] text-ink-muted">
                eval{" "}
                <span className="text-accent-hover">
                  {engram.eval_score.toFixed(2)}
                </span>
              </span>
            )}
            {engram.cli_compat.slice(0, 5).map((cli) => (
              <CliChip key={cli} cli={cli} />
            ))}
          </div>
        )}

        {/* Row 5: tags */}
        {engram.tags.length > 0 && (
          <div className="pointer-events-none relative z-[2] mt-3 flex flex-wrap gap-1.5">
            {engram.tags.slice(0, 4).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Footer: compact one-click install + "view synapses" affordance.
            Interactive — sits above the overlay (z-10, pointer-events restored). */}
        <div className="relative z-10 mt-4 border-t border-line-subtle pt-3">
          <div className="flex items-center justify-between gap-2">
            <QuickInstall engram={engram} />
            <Link
              href={href}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:text-accent-hover group-hover:text-accent-hover"
            >
              View synapses
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
export function EngramCardSkeleton() {
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
