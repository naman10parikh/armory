/*
  The info mark (CP147, after the text rules of the chairman's Synoptic prompts). An explanation a
  reader asks for once (how a number is made, where it comes from, a caveat) sits one hover, focus or
  tap away from the thing it explains, never in the reading path. The fact stays on the screen; only
  the why moves in here, so nothing is lost.

  No script. The panel is display:none until the mark is hovered or focused, so a closed panel adds
  nothing to the page's width. From 640px up it opens under the mark; below that it opens as a strip
  along the bottom of the screen, so it can never push a phone's page sideways. The text is in the
  served HTML, and it is the mark's description for screen readers.

  Use one per section at most, on its heading or on the label it explains. Never inside a table: the
  table's scroll box would clip it.
*/
import type { ReactNode } from "react";
import { InfoIcon } from "./icons";

export function Info({
  id,
  label,
  children,
  align = "start",
}: {
  /** Unique on the page: the panel's id, which the mark names as its description. */
  id: string;
  /** What the mark is about, read by screen readers ("About the update time"). */
  label: string;
  /** Plain text, at most two sentences. */
  children: ReactNode;
  /** "end" opens the panel leftwards, for a mark near the right edge. */
  align?: "start" | "end";
}) {
  return (
    <span className="group/info relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors duration-150 ease-state hover:text-accent-hover focus-visible:text-accent-hover"
      >
        <InfoIcon size={15} />
      </button>
      {/* The outer span's top padding bridges the gap to the mark, so the pointer can move onto the text. */}
      <span
        className={`absolute top-full z-40 hidden pt-1.5 group-focus-within/info:block group-hover/info:block max-sm:fixed max-sm:inset-x-4 max-sm:bottom-4 max-sm:top-auto max-sm:pt-0 ${
          align === "end" ? "right-0" : "left-0"
        }`}
      >
        <span
          id={id}
          role="tooltip"
          className="block w-[300px] rounded-lg border border-line bg-raise-2 px-3 py-2 text-left text-[12.5px] font-normal normal-case leading-snug tracking-normal text-ink-body shadow-[0_8px_24px_rgb(0_0_0/0.45)] max-sm:w-auto"
        >
          {children}
        </span>
      </span>
    </span>
  );
}
