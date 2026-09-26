import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon } from "./icons";
import { HarnessSelector } from "./install-snippet";

const REPO = "https://github.com/naman10parikh/armory";

// design/BRIEF.md Approval note: the nav was a `fixed` floating pill; pages
// compensated with `pt-20`. This is now an IN-FLOW top bar — normal document
// flow, no `fixed`/`sticky` — so pages clear it for free and only need the
// brief's 32px baseline top padding. Accent discipline (§6): amber marks
// INTERACTIVE and SELECTED, so every link is neutral at rest and ambers on
// hover/focus. The one serif on the page is the wordmark (§5 — removed from
// the rest of chrome, so no per-link icons either; text labels only).
const NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/c", label: "Components" },
  { href: "/stack", label: "Stack" },
  { href: "/formula", label: "Formula" },
  { href: "/ask", label: "Ask" },
  { href: "/browse", label: "Browse" },
  { href: "/graph", label: "Timeline" },
] as const;

export function SiteNav() {
  // Phone (CP143 upgrade 11): the old bar was a fixed 56px that wrapped its links into three rows
  // over the page title. Now the wordmark and Source share the first row, and the links sit in a
  // strip of their own that scrolls sideways inside itself, so the page never does. The right edge fades
  // so the strip reads as scrollable, and end padding as wide as the fade lets the last link clear it.
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
          className="order-last -mx-2 flex w-[calc(100%+1rem)] items-center gap-0.5 overflow-x-auto whitespace-nowrap pb-1 text-[14px] [scrollbar-width:none] max-lg:pr-14 max-lg:[mask-image:linear-gradient(90deg,#000_85%,transparent)] lg:order-none lg:mx-0 lg:w-auto lg:overflow-visible lg:pb-0 lg:[mask-image:none]"
        >
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <HarnessSelector className="hidden lg:inline-flex" />
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-ink-body transition-colors duration-150 ease-state hover:bg-raise-2 hover:text-accent-hover"
          >
            <GithubIcon size={15} />
            <span>Source</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-ink-body transition-colors duration-150 ease-state hover:bg-raise-2 hover:text-accent-hover"
    >
      {children}
    </Link>
  );
}
