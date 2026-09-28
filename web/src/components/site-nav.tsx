import Link from "next/link";
import { Logo } from "./logo";
import { HarnessSelector } from "./install-snippet";
import { NavLinks } from "./nav-links";

// design/BRIEF.md Approval note: the nav was a `fixed` floating pill; pages
// compensated with `pt-20`. This is now an IN-FLOW top bar — normal document
// flow, no `fixed`/`sticky` — so pages clear it for free and only need the
// brief's 32px baseline top padding. Accent discipline (§6): amber marks
// INTERACTIVE and SELECTED, so every link is neutral at rest and ambers on
// hover/focus. The one serif on the page is the wordmark (§5 — removed from
// the rest of chrome, so no per-link icons either; text labels only).
// CP147: the links and their order are the approved wireframe's (Top first, the current section
// marked), and the right side holds only the Harness selector, as drawn. Source is in the footer.
export function SiteNav() {
  // Phone (CP143 upgrade 11): the old bar was a fixed 56px that wrapped its links into three rows
  // over the page title. Now the wordmark and the Harness selector share the first row (CP147, as the
  // wireframe draws it: one selector for the whole site at every width), and the links sit in a
  // row of their own below it. That row used to scroll sideways behind a faded edge, which no reader
  // took for a cue (CP138 T23), so on a phone it wraps onto a second line instead: every section is
  // visible, nothing scrolls, and the header is not sticky, so the extra line costs nothing below it.
  return (
    <header className="border-b border-line-subtle bg-canvas">
      <div className="mx-auto flex min-h-14 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-4 px-5 py-2 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg py-1"
          aria-label="Armory"
        >
          <Logo size={20} />
          <span className="font-wordmark text-[22px] leading-none tracking-tight text-ink-hi">
            Armory
          </span>
        </Link>

        <nav
          aria-label="Sections"
          className="order-last -mx-2 flex w-[calc(100%+1rem)] flex-wrap items-center gap-0.5 pb-1 text-[14px] lg:order-none lg:mx-0 lg:w-auto lg:flex-nowrap lg:whitespace-nowrap lg:pb-0"
        >
          <NavLinks />
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <HarnessSelector />
        </div>
      </div>
    </header>
  );
}
