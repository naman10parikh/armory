import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon } from "./icons";
import { HarnessSelector } from "./install-snippet";

const REPO = "https://github.com/naman10parikh/component";

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
  return (
    <header className="border-b border-line-subtle bg-canvas">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg"
          aria-label="Armory"
        >
          <Logo size={20} />
          <span className="font-wordmark text-lg leading-none tracking-tight text-ink-hi">
            Armory
          </span>
        </Link>

        <nav aria-label="Sections" className="flex flex-wrap items-center gap-0.5 text-[14px]">
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
            <span className="hidden sm:inline">Source</span>
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
