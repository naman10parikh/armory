// Submit-side validation: check an engram file has the REQUIRED frontmatter
// (CONTRIBUTING.md contract) and copy it into incoming/ for verify+promote.
import { readFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { basename, join } from "node:path";
import { resolveRoot } from "./catalog.js";

const TYPES = [
  "mcps", "skills", "hooks", "subagents", "identity", "memory",
  "claudemd-rules", "clis-tools", "evals", "observability",
  "infrastructure", "workflows",
];

const REQUIRED = ["name", "type", "description", "source_url", "license"] as const;

export interface SubmitResult {
  ok: boolean;
  errors: string[];
  name: string;
  dest: string;
}

// Extract the raw `key: value` lines of the frontmatter block. We only need
// scalar presence + the name/type values, so a line scan is enough.
function frontmatterFields(raw: string): Record<string, string> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fields: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

export function validateAndCopy(filePath: string): SubmitResult {
  if (!existsSync(filePath)) {
    throw new Error(`file not found: ${filePath}`);
  }
  const raw = readFileSync(filePath, "utf8");
  const fields = frontmatterFields(raw);
  const errors: string[] = [];

  if (!raw.startsWith("---")) errors.push("file must start with YAML frontmatter (---).");

  for (const key of REQUIRED) {
    const val = fields[key];
    // A folded scalar (`description: >`) is valid even though the value is empty
    // on this line, so only flag truly-missing keys.
    if (val === undefined) errors.push(`missing required field: ${key}`);
    else if (val === "" && key !== "description") errors.push(`field "${key}" is empty.`);
  }

  const name = (fields.name ?? "").replace(/^["']|["']$/g, "");
  const type = (fields.type ?? "").replace(/^["']|["']$/g, "");

  if (name && !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    errors.push(`name "${name}" must be kebab-case (a-z, 0-9, hyphen).`);
  }
  const expectedFile = `${name}.md`;
  if (name && basename(filePath) !== expectedFile) {
    errors.push(`filename must equal "${expectedFile}" (name + .md), got "${basename(filePath)}".`);
  }
  if (type && !TYPES.includes(type)) {
    errors.push(`type "${type}" is not one of the 12 categories.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors, name, dest: "" };
  }

  const incoming = join(resolveRoot(), "incoming");
  mkdirSync(incoming, { recursive: true });
  const dest = join(incoming, expectedFile);
  copyFileSync(filePath, dest);
  return { ok: true, errors: [], name, dest };
}
