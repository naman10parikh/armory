import Link from "next/link";
import { Logo } from "./logo";

const REPO = "https://github.com/naman10parikh/component";

// Footer. Labels per web/COPY.md §3: the lead line is a noun phrase, the column
// heads are `Catalog` / `Developers`, and the repo link is `Source`. No scroll
// reveal (design/BRIEF.md §8 — a marketing device that delays reading); rows
// render immediately, like everything else in app chrome.
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-8">
      <div className="hairline mb-10 h-px w-full" />
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="font-wordmark text-2xl leading-none tracking-tight text-ink-hi">
              Armory
            </span>
          </div>
          <p className="mt-3 max-w-sm text-[14px] leading-normal text-ink-body">
            Ranked catalog of open-source agent components
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            For agents, by agents, of agents.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-6 text-[14px]">
          <FooterCol label="Catalog">
            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
            <FooterLink href="/browse">Browse</FooterLink>
            <FooterLink href="/graph">Timeline</FooterLink>
          </FooterCol>
          <FooterCol label="Developers">
            <FooterLink href="/formula">Formula</FooterLink>
            <FooterLink href="/identity">Identity</FooterLink>
            <FooterA href={`${REPO}/blob/main/CONTRIBUTING.md`}>Contribute</FooterA>
            <FooterA href={REPO}>Source</FooterA>
          </FooterCol>
        </div>
      </div>

      <p className="mt-12 font-mono text-[11px] text-ink-faint">
        MIT · the open registry of agent-harness components · built in the open by
        the Energy ecosystem
      </p>
    </footer>
  );
}

function FooterCol({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
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
      className="cursor-pointer text-ink-body transition-colors duration-150 ease-state hover:text-accent-hover"
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
      className="cursor-pointer text-ink-body transition-colors duration-150 ease-state hover:text-accent-hover"
    >
      {children}
    </a>
  );
}
