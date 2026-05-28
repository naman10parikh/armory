import { Reveal } from "./reveal";
import { ArrowRightIcon, GraphIcon, SparkIcon, TypeIcon } from "./icons";

/*
  The "how it's built" flow: brain/ markdown vault → one generated catalog.json →
  three surfaces (this site, the MCP server, the CLI). Editorial node-and-edge
  diagram, not a code screenshot. Each stage reveals in sequence.
*/
const STAGES = [
  {
    label: "brain/",
    sub: "markdown vault — one file per engram, with frontmatter + synapses",
    icon: <TypeIcon type="memory" size={18} className="text-accent" />,
  },
  {
    label: "catalog.json",
    sub: "one generated index — verified, scored, deduped",
    icon: <SparkIcon size={18} className="text-accent" />,
  },
  {
    label: "site · MCP · CLI",
    sub: "three surfaces, one source of truth — read by humans and agents",
    icon: <GraphIcon size={18} className="text-accent" />,
  },
];

export function BuildFlow() {
  return (
    <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
      {STAGES.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-3">
          <Reveal index={i} className="flex-1">
            <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
              <div className="rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5">
                <span className="flex items-center gap-2 font-mono text-sm text-ink-hi">
                  {s.icon}
                  {s.label}
                </span>
                <p className="mt-2 text-sm leading-snug text-ink-muted">
                  {s.sub}
                </p>
              </div>
            </div>
          </Reveal>
          {i < STAGES.length - 1 && (
            <ArrowRightIcon
              size={20}
              className="hidden shrink-0 rotate-90 text-accent-line md:block md:rotate-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}
