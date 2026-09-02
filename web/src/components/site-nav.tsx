import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon, GraphIcon, SearchIcon, SparkIcon } from "./icons";

const REPO = "https://github.com/naman10parikh/component";

// Floating pill nav — hairline border, opaque so table rows scroll cleanly
// underneath. Accent discipline (design/BRIEF.md §6): amber marks INTERACTIVE
// and SELECTED, so every item is neutral at rest and ambers on hover. The one
// serif on the page is the wordmark.
export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-5">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-line bg-raise-1 py-2 pl-3 pr-2 backdrop-blur-xl">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2 rounded-full px-1.5 py-1"
          aria-label="Armory"
        >
          <Logo size={20} />
          <span className="font-wordmark text-lg leading-none tracking-tight text-ink-hi">
            Armory
          </span>
        </Link>

        <div className="flex items-center gap-0.5 text-[14px]">
          <NavLink href="/leaderboard" icon={<RankIcon size={15} />}>
            Leaderboard
          </NavLink>
          <NavLink href="/ask" icon={<SparkIcon size={15} />}>
            Ask
          </NavLink>
          <NavLink href="/browse" icon={<SearchIcon size={15} />}>
            Browse
          </NavLink>
          <NavLink href="/graph" icon={<GraphIcon size={15} />}>
            Timeline
          </NavLink>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-body transition-colors duration-150 ease-state hover:bg-raise-2 hover:text-accent-hover"
          >
            <GithubIcon size={15} />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

function RankIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M6 20V10M12 20V4M18 20v-6" />
    </svg>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-ink-body transition-colors duration-150 ease-state hover:bg-raise-2 hover:text-accent-hover"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
