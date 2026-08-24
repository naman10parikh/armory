import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon, GraphIcon, SearchIcon, SparkIcon } from "./icons";

const REPO = "https://github.com/naman10parikh/component";

// Floating glass pill nav — detached, centred, hairline border. backdrop-blur is
// allowed here (fixed element, not a scrolling container).
export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-5">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-line bg-raise-1/70 py-2 pl-3 pr-2 backdrop-blur-xl">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2 rounded-full px-1.5 py-1"
          aria-label="Armory — home"
        >
          <Logo size={20} />
          <span className="font-serif text-lg leading-none tracking-tight text-ink-hi">
            Armory
          </span>
        </Link>

        <div className="flex items-center gap-0.5 text-sm">
          <Link
            href="/leaderboard"
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-quiet px-3 py-1.5 font-medium text-accent transition-colors hover:bg-accent-line"
          >
            <RankIcon size={15} />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/ask"
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-quiet px-3 py-1.5 font-medium text-accent transition-colors hover:bg-accent-line"
          >
            <SparkIcon size={15} />
            <span>Ask</span>
          </Link>
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
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-body transition-colors hover:bg-raise-2 hover:text-ink-hi"
          >
            <GithubIcon size={15} />
            <span className="hidden sm:inline">GitHub</span>
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
      className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-body transition-colors hover:bg-raise-2 hover:text-ink-hi"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
