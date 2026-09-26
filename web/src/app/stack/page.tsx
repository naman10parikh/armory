// Stack — what to build an agent out of, on both of CP138's axes, and a builder that turns a choice
// into one command and one link.
//
//   1. Inside the harness: one pick per canonical component (src/data/stack.json, CP138), each with its
//      live Score and install line. Every pick is a select: swap in a runner-up or a top-ranked row
//      from the same shelf, or leave the slot out. The form is a plain GET, so /stack?memory=getzep-zep
//      reproduces a stack for anyone who opens it, agents included (CP143 upgrade 12).
//   2. Accounts the agent acts through: the capability plane (CP138 axis 2). Accounts, not open-source
//      code, so never ranked; the deploy-access line is the answer, a pick without it is a logo.
// Stamped with the date the picks were set and the command that re-derives their evidence (CP138 T45).
// Machine twin: GET /api/stack.
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { OursTag } from "@/components/board-table";
import { ContentWidth, DataTable, Th, Tr, clampWords } from "@/components/data-table";
import { HarnessSelector, InstallSnippet } from "@/components/install-snippet";
import { NotIndexedTag } from "@/components/component-page";
import { ScoreBadge } from "@/components/score-badge";
import { CopyText, PickSelect, StackCommand, type PickOption } from "@/components/stack-builder";
import {
  CANON_SLUGS,
  PLANE,
  PROVISIONING,
  STACK_AS_OF,
  STACK_REGENERATE,
  resolvedPicksFor,
  rowsFor,
  stackFor,
  type CanonRow,
} from "@/lib/canon";
import { shortDate } from "@/lib/format";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Stack · Armory",
  description:
    "One pick per harness component, the accounts an agent acts through, and one command that installs your picks.",
};

const SITE = "https://armory-murex.vercel.app";
const ALTERNATES = 5;
const NONE = "none";
const CELL = "border-b border-line-subtle px-3 py-2.5 align-top";

type Params = Record<string, string | string[] | undefined>;

interface Slot {
  slug: string;
  label: string;
  chosen: string;
  options: PickOption[];
  row: CanonRow | null;
  why: string;
  sourceUrl: string | null;
  isDefault: boolean;
}

function slotFor(slug: string, sp: Params): Slot {
  const entry = stackFor(slug);
  const picks = resolvedPicksFor(slug).filter((p) => p.armoryName);
  const pickNames = new Set(picks.map((p) => p.armoryName as string));
  const alternates = rowsFor(slug)
    .filter((r) => r.universal != null && !pickNames.has(r.name))
    .slice(0, ALTERNATES);
  const score = (r: CanonRow | null) => (r?.universal != null ? ` · ${r.universal.toFixed(1)}` : "");
  const ours = (r: CanonRow | null) => (r?.ours ? " · ours" : "");

  const options: PickOption[] = [
    ...picks.map((p, i) => ({
      value: p.armoryName as string,
      label: `${p.name}${score(p.row)}${i === 0 ? " · the pick" : " · runner-up"}${ours(p.row)}`,
    })),
    ...alternates.map((r) => ({ value: r.name, label: `${r.name}${score(r)}${ours(r)}` })),
    { value: NONE, label: "Leave this slot out" },
  ];

  const raw = sp[slug];
  const asked = Array.isArray(raw) ? raw[0] : raw;
  const defaultName = picks[0]?.armoryName ?? NONE;
  const chosen = asked && options.some((o) => o.value === asked) ? asked : defaultName;

  const pick = picks.find((p) => p.armoryName === chosen) ?? null;
  const row = pick?.row ?? alternates.find((r) => r.name === chosen) ?? null;
  return {
    slug,
    label: entry?.label ?? slug,
    chosen,
    options,
    row,
    why: pick?.why ?? (row ? clampWords(row.desc, 110) : ""),
    sourceUrl: pick?.url ?? row?.url ?? null,
    isDefault: chosen === defaultName,
  };
}

export default async function StackPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const slots = CANON_SLUGS.map((slug) => slotFor(slug, sp));
  const chosen = slots.filter((s) => s.chosen !== NONE);
  const changed = slots.filter((s) => !s.isDefault);
  const share = changed.length
    ? `${SITE}/stack?${new URLSearchParams(changed.map((s) => [s.slug, s.chosen])).toString()}`
    : `${SITE}/stack`;

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-10">
          <h1 className="text-[27px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">Stack</h1>
          <p className="mt-3 max-w-[72ch] text-[16px] leading-normal text-ink-body">
            One pick per harness component, and the accounts an agent acts through
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
            <span>
              Picks as of <time dateTime={STACK_AS_OF}>{shortDate(STACK_AS_OF)}</time>. Re-derive their evidence from
              the repository with
            </span>
            <code className="rounded border border-line-subtle bg-raise-1 px-1.5 py-0.5 font-mono text-[12px] text-ink-body">
              {STACK_REGENERATE}
            </code>
          </p>
        </ContentWidth>
      </section>

      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-10 pt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="text-[19px] font-semibold leading-none text-ink-hi">Inside the harness</h2>
            {/* One control for one setting: the nav owns this selector from lg up. */}
            <HarnessSelector className="lg:hidden" />
          </div>

          <Form action="/stack" scroll={false}>
            <DataTable label="Inside the harness" minWidthClass="min-w-[1000px]" fixed className="stack-table">
              <thead>
                <tr>
                  <Th className="w-[130px]">Component</Th>
                  <Th className="w-[270px]">Pick</Th>
                  <Th align="right" className="w-[92px]">
                    Score
                  </Th>
                  <Th className="w-auto">Why</Th>
                  <Th className="w-[300px]">Install</Th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <Tr key={s.slug}>
                    <td className={`${CELL} text-[13px] font-medium text-ink-hi`}>
                      <Link
                        href={`/c/${s.slug}`}
                        className="cursor-pointer transition-colors duration-150 ease-state hover:text-accent-hover"
                      >
                        {s.label}
                      </Link>
                    </td>
                    <td className={CELL}>
                      <PickSelect name={s.slug} label={s.label} value={s.chosen} options={s.options} />
                      {s.row?.ours && <OursTag />}
                      {s.row?.contributedBy && (
                        <span className="mt-1 block text-[11.5px] text-ink-faint">Contributed by {s.row.contributedBy}</span>
                      )}
                    </td>
                    <td data-col="score" className={`${CELL} text-right`}>
                      {s.chosen === NONE ? null : (
                        <ScoreBadge score={s.row?.universal ?? null} evidence={s.row?.evidence ?? 0} caption />
                      )}
                    </td>
                    <td className={`${CELL} text-[12.5px] leading-snug text-ink-muted`}>
                      {s.chosen === NONE ? "Left out" : s.why}
                    </td>
                    <td className={CELL}>
                      {s.chosen === NONE ? null : s.row ? (
                        <InstallSnippet name={s.row.name} />
                      ) : (
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <NotIndexedTag />
                          {s.sourceUrl && (
                            <a
                              href={s.sourceUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="cursor-pointer text-[12px] text-accent-hover underline underline-offset-4"
                            >
                              Source
                            </a>
                          )}
                        </span>
                      )}
                    </td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="h-9 cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-4 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
              >
                Build
              </button>
              {changed.length > 0 && (
                <Link
                  href="/stack"
                  scroll={false}
                  className="cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
                >
                  Reset to the picks
                </Link>
              )}
            </div>
          </Form>

          <h3 className="mt-10 text-[16px] font-semibold text-ink-hi">One command for these picks</h3>
          <div className="mt-3 max-w-[760px]">
            <StackCommand names={chosen.map((s) => s.row?.name ?? s.chosen)} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            <span>Link to this stack</span>
            <CopyText text={share} label="Copy the link" />
          </div>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-8">
          <h2 className="text-[19px] font-semibold leading-none text-ink-hi">Accounts the agent acts through</h2>
          <p className="mb-4 mt-3 max-w-[80ch] text-[13px] text-ink-muted">
            These are accounts, not repositories, so they carry no Armory score; each line says how an agent gets
            access.
          </p>
          <DataTable label="Accounts the agent acts through" minWidthClass="min-w-[760px]" fixed className="stack-table">
            <thead>
              <tr>
                <Th className="w-[200px]">Slot</Th>
                <Th className="w-[220px]">Pick</Th>
                <Th className="w-auto">Deploy access</Th>
              </tr>
            </thead>
            <tbody>
              {PLANE.map((p) => (
                <Tr key={p.slot}>
                  <td className={`${CELL} text-[13px] text-ink-muted`}>{p.slot}</td>
                  <td className={`${CELL} text-[13.5px] font-medium text-ink-hi`}>{p.pick}</td>
                  <td className={`${CELL} text-[13px] leading-snug text-ink-body`}>{p.access}</td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
          <p className="mt-4 max-w-[90ch] text-[13px] leading-relaxed text-ink-muted">{PROVISIONING}</p>

          <p className="mt-6 text-[13px] text-ink-muted">
            <a href="/api/stack" className="cursor-pointer font-medium text-accent-hover underline underline-offset-4">
              API
            </a>{" "}
            returns both lists as JSON;{" "}
            <Link href="/c" className="cursor-pointer font-medium text-accent-hover underline underline-offset-4">
              Components
            </Link>{" "}
            lists up to three picks per component with its top-ranked rows.
          </p>
        </ContentWidth>
      </section>
    </div>
  );
}
