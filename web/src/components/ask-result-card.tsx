import { clampWords } from "./data-table";
import { ScoreBadge } from "./score-badge";
import { SignalsRow, type SignalValues } from "./signals-row";
import { InstallSnippet } from "./install-snippet";
import { evidenceOf } from "./ranked-row";

export interface AskResultItem {
  name: string;
  component: string;
  domain: string;
  vertical: string | null;
  url: string | null;
  universal: number | null;
  desc: string;
  signals: SignalValues;
}

/** One Ask result — the card form (design/BRIEF.md §9's Card spec: single 1px line-subtle
 *  border, radius 10px, never nested), built from the same shared components as the
 *  Leaderboard row: ScoreBadge, SignalsRow, InstallSnippet. */
export function AskResultCard({ item }: { item: AskResultItem }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-xl border border-line-subtle bg-raise-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-[15px] font-semibold text-ink-hi transition-colors duration-150 ease-state hover:text-accent-hover"
            >
              {item.name}
            </a>
          ) : (
            <span className="text-[15px] font-semibold text-ink-hi">{item.name}</span>
          )}
          <div className="mt-0.5 truncate text-[11.5px] text-ink-muted">
            {[item.component, item.domain, item.vertical].filter(Boolean).join(" · ")}
          </div>
        </div>
        <ScoreBadge score={item.universal} evidence={evidenceOf(item.signals)} />
      </div>

      {item.desc && (
        <p className="text-[12.5px] leading-normal text-ink-body">{clampWords(item.desc, 140)}</p>
      )}

      <SignalsRow signals={item.signals} />
      <InstallSnippet name={item.name} />
    </article>
  );
}

export function InterpretedChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-accent-line bg-accent-quiet px-2.5 py-1 text-[12px] font-medium text-accent-hover">
      {children}
    </span>
  );
}

export function KeywordChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-line bg-raise-2 px-2.5 py-1 text-[12px] text-ink-muted">
      {children}
    </span>
  );
}
