// Observability spine — append-only JSONL audit trail for every state-mutating
// Armory CLI invocation (install / submit / sandbox-run). One line per run:
// what ran, with which args, how long, and whether it landed. Best-effort by
// design: a log-write failure must NEVER break the command itself.
// Pattern ported from the Helios earning harness (energy/agents/earning/helios).
import { appendFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { resolveRoot } from "./catalog.js";

export interface RunLogEntry {
  /** ISO-8601 timestamp of when the run finished. */
  ts: string;
  /** CLI subcommand (e.g. "install", "submit", "sandbox-run"). */
  command: string;
  /** Argument tokens passed to the subcommand (no flag values with paths redacted). */
  args: string[];
  /** Wall-clock duration of the invocation, milliseconds. */
  durationMs: number;
  /** Whether the invocation completed cleanly or threw / failed validation. */
  outcome: "ok" | "error";
  /** Error message when outcome === "error". */
  error?: string;
  /** Optional one-line summary (e.g. "installed playwright-mcp → claude"). */
  note?: string;
}

// Where the trail lives: ARMORY_RUNS_LOG wins; inside the armory repo it is
// <repo>/logs/runs.jsonl (gitignored runtime state); for a global npm install
// (no catalog.json on the walk-up path) it falls back to ~/.armory/runs.jsonl.
export function runsLogPath(): string {
  const override = process.env.ARMORY_RUNS_LOG;
  if (override) return override;
  const root = resolveRoot();
  if (existsSync(join(root, "catalog.json"))) return join(root, "logs", "runs.jsonl");
  return join(homedir(), ".armory", "runs.jsonl");
}

/** Append one run entry to the JSONL audit trail. Best-effort — never throws. */
export function recordRun(entry: RunLogEntry, logPath: string = runsLogPath()): void {
  try {
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, JSON.stringify(entry) + "\n");
  } catch {
    // Observability is best-effort; a log-write failure must not break the CLI.
  }
}

/** Read the most-recent run entries (oldest→newest), capped at `limit`. */
export function readRuns(limit = 20, logPath: string = runsLogPath()): RunLogEntry[] {
  if (!existsSync(logPath)) return [];
  return readFileSync(logPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .slice(-limit)
    .map((l) => JSON.parse(l) as RunLogEntry);
}

// Small helper so each command wires the trail identically: time the action,
// record ok/error with a note, re-throw nothing (caller already handled).
export function timedRun<T>(
  command: string,
  args: string[],
  fn: () => T,
  note?: (result: T) => string,
): T {
  const start = performance.now();
  try {
    const result = fn();
    recordRun({
      ts: new Date().toISOString(),
      command,
      args,
      durationMs: Math.round(performance.now() - start),
      outcome: "ok",
      note: note ? note(result) : undefined,
    });
    return result;
  } catch (err) {
    recordRun({
      ts: new Date().toISOString(),
      command,
      args,
      durationMs: Math.round(performance.now() - start),
      outcome: "error",
      error: (err as Error).message,
    });
    throw err;
  }
}
