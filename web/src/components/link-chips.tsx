import Link from "next/link";

/*
  One filter axis as chips that are LINKS (CP143 upgrade 10): the leaderboard is rendered on the
  server, so a filter is a URL, not a click handler. It works without JavaScript, an agent can follow
  it, and the view it opens is citable. Past the first few, the rest fold behind a native <details>.
*/

export interface ChipLink {
  key: string;
  label: string;
  count?: number;
  href: string;
  active: boolean;
}

const VISIBLE = 8;
const INT = new Intl.NumberFormat("en-US");

export function LinkChipGroup({ label, chips }: { label: string; chips: readonly ChipLink[] }) {
  const shown = chips.slice(0, VISIBLE + 1); // "All" + the first eight
  const rest = chips.slice(VISIBLE + 1);
  const restActive = rest.some((c) => c.active);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-[76px] shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
      {shown.map((c) => (
        <Chip key={c.key} chip={c} />
      ))}
      {rest.length > 0 && (
        <details className="group open:w-full" open={restActive}>
          <summary className="cursor-pointer list-none rounded-full border border-line-subtle bg-raise-1 px-2.5 py-1 text-[12px] font-medium text-ink-body transition-colors duration-150 ease-state hover:border-line hover:text-ink-hi group-open:hidden [&::-webkit-details-marker]:hidden">
            {INT.format(rest.length)} More
          </summary>
          <div className="flex flex-wrap gap-1.5 sm:pl-[82px]">
            {rest.map((c) => (
              <Chip key={c.key} chip={c} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Chip({ chip }: { chip: ChipLink }) {
  return (
    <Link
      href={chip.href}
      aria-current={chip.active ? "true" : undefined}
      scroll={false}
      className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 ease-state ${
        chip.active
          ? "border-accent-line bg-accent-quiet text-accent-hover"
          : "border-line-subtle bg-raise-1 text-ink-body hover:border-line hover:text-ink-hi"
      }`}
    >
      {chip.label}
      {chip.count != null && (
        <>
          {" "}
          <data value={String(chip.count)} className="text-ink-muted">
            {INT.format(chip.count)}
          </data>
        </>
      )}
    </Link>
  );
}
