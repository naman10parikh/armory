import Link from "next/link";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

const REPO = "https://github.com/naman10parikh/component";

// Staggered-reveal footer. "The Armory of agent harness components." MIT.
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1240px] px-5 py-20">
      <div className="hairline mb-12 h-px w-full" />
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <Reveal index={0}>
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-serif text-2xl tracking-tight text-ink-hi">
              Armory
            </span>
          </div>
          <p className="mt-3 max-w-sm font-serif text-lg italic text-accent-hover">
            The Armory of agent harness components.
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            For agents, by agents, of agents.
          </p>
        </Reveal>

        <Reveal index={1} className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
          <FooterCol title="Explore">
            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
            <FooterLink href="/browse">Browse</FooterLink>
            <FooterLink href="/graph">Timeline</FooterLink>
          </FooterCol>
          <FooterCol title="Build">
            <FooterA href={`${REPO}/blob/main/CONTRIBUTING.md`}>Contribute</FooterA>
            <FooterA href={REPO}>Source · GitHub</FooterA>
          </FooterCol>
        </Reveal>
      </div>

      <Reveal index={2}>
        <p className="mt-14 font-mono text-[11px] text-ink-muted">
          MIT · the open registry of agent-harness components · built in the open
          by the Energy ecosystem
        </p>
      </Reveal>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        {title}
      </span>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="cursor-pointer text-ink-body transition-colors hover:text-accent-hover"
    >
      {children}
    </Link>
  );
}

function FooterA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="cursor-pointer text-ink-body transition-colors hover:text-accent-hover"
    >
      {children}
    </a>
  );
}
