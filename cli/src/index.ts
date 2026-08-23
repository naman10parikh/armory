#!/usr/bin/env node
// Armory CLI — where agents gear up. Search, get, install, submit, list harness
// components (components). Reads the generated catalog.json (the contract) and
// installs components into whatever coding harness you're in. See CONTRIBUTING.md.
import { basename } from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { loadCatalog, readComponentBody, type Component } from "./catalog.js";
import { validateAndCopy, type SubmitResult } from "./submit.js";
import { runInstall, type InstallReport } from "./install.js";

const program = new Command();

program
  .name("armory")
  .description("Armory — where agents gear up. Search and install harness components (components).")
  .version("0.1.0");

function findByName(name: string): Component | undefined {
  return loadCatalog().components.find((e) => e.name === name.trim());
}

function typeBadge(type: string): string {
  return chalk.cyan(`[${type}]`);
}

// --- search: keyword relevance over the catalog, enriched by the Universal engine ---------------
// The programmatic query surface for agents. A term in the name outweighs a tag, which outweighs the
// body (no LLM, no network) — the SAME simple scorer as GET /api/search and the MCP `search_catalog`
// tool, so all three rank identically. computeRows adds each hit's normalized component, domain,
// Universal score, and primary signal.
interface EngineRow {
  name: string; component: string; domain: string; url: string | null; desc: string;
  scores: { universal: number | null };
  primary: { key: string; value: number | null; pct: number; label: string } | null;
}

async function computeEngineRows(components: Component[]): Promise<EngineRow[]> {
  // The engine's .d.mts predates computeRows (it declares leaderboard/rows/facets); intersect the real
  // module type with the missing export so this stays type-safe without touching the engine or its types.
  const mod = (await import("../../lib/rank.mjs")) as typeof import("../../lib/rank.mjs") & {
    computeRows: (c: unknown[]) => EngineRow[];
  };
  return mod.computeRows(components); // same order as the input array (a .map)
}

const tokenize = (text: string): string[] =>
  text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

function keywordScore(component: Component, qTerms: string[]): number {
  const name = new Set(tokenize(component.name));
  const tags = new Set(tokenize((component.tags || []).join(" ")));
  const desc = new Set(tokenize(component.description || ""));
  let s = 0;
  for (const term of qTerms) {
    if (name.has(term)) s += 3;
    if (tags.has(term)) s += 2;
    if (desc.has(term)) s += 1;
  }
  return s;
}

program
  .command("search")
  .description("Keyword-search components by name + description + tags, enriched with the Universal score; sliceable by component + domain.")
  .argument("<query>", "search terms")
  .option("-c, --component <type>", "filter to one component: mcp|cli|skill|plugin|hook|subagent|rules|tool|...")
  .option("-d, --domain <domain>", "filter to one domain: front-end|back-end|browser|payments|ai-agents|...")
  .option("-t, --type <type>", "alias for --component (back-compat)")
  .option("-n, --limit <n>", "max results", "10")
  .option("--json", "emit JSON (for agents)", false)
  .action(async (query: string, opts: { component?: string; domain?: string; type?: string; limit: string; json: boolean }) => {
    const component = opts.component || opts.type;
    const qTerms = [...new Set(tokenize(query))];
    const components = loadCatalog().components;
    const rows = await computeEngineRows(components);
    const scored = components
      .map((c, i) => ({ row: rows[i], score: keywordScore(c, qTerms) }))
      .filter(
        ({ row, score }) =>
          score > 0 && (!component || row.component === component) && (!opts.domain || row.domain === opts.domain),
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          (b.row.scores.universal ?? -1) - (a.row.scores.universal ?? -1) ||
          a.row.name.localeCompare(b.row.name),
      );
    const items = scored.slice(0, Number(opts.limit) || 10).map(({ row }) => ({
      name: row.name, component: row.component, domain: row.domain, url: row.url ?? null,
      universal: row.scores.universal, primary: row.primary, desc: row.desc,
    }));

    if (opts.json) {
      console.log(JSON.stringify({ items, total: scored.length }, null, 2));
      return;
    }
    if (items.length === 0) {
      console.log(chalk.yellow(`No components matched "${query}".`));
      return;
    }
    const slice = [component, opts.domain].filter(Boolean).join(" × ");
    console.log(
      chalk.bold(`\nTop ${items.length} for "${query}"`) +
        (slice ? chalk.dim(`  ·  ${slice}`) : "") +
        chalk.dim(`  ·  ${scored.length} match${scored.length === 1 ? "" : "es"}\n`),
    );
    let rank = 0;
    for (const i of items) {
      rank += 1;
      const u = i.universal != null ? chalk.bold(String(i.universal).padStart(4)) : chalk.dim("   —");
      const prim =
        i.primary && i.primary.value != null ? chalk.yellow(`${i.primary.label} ${i.primary.value.toLocaleString()}`) : "";
      console.log(`${chalk.dim(String(rank).padStart(3))}  ${u}  ${chalk.green(i.name)} ${typeBadge(i.component)} ${chalk.dim(i.domain)} ${prim}`);
      if (i.desc) console.log(`      ${chalk.dim(i.desc.slice(0, 96))}`);
      if (i.url) console.log(`      ${chalk.blue(i.url)}`);
    }
    console.log("");
  });

program
  .command("get")
  .description("Print the full component markdown.")
  .argument("<name>", "component name")
  .action((name: string) => {
    const component = findByName(name);
    if (!component) {
      console.error(chalk.red(`Component "${name}" not found.`));
      process.exitCode = 1;
      return;
    }
    console.log(readComponentBody(component));
  });

program
  .command("install")
  .description("Fetch a component and install it into your coding harness (claude/cursor/codex/opencode/gemini).")
  .argument("<name>", "component name (fuzzy-matched if no exact hit)")
  .option("-c, --cli <cli>", "target CLI: claude|cursor|codex|opencode|gemini (auto-detected if omitted)")
  .option("--to <dir>", "install root (defaults to the current directory)")
  .option("-f, --force", "overwrite existing files / MCP entries", false)
  .option("--dry-run", "print the install plan without writing anything", false)
  .action((name: string, opts: { cli?: string; to?: string; force: boolean; dryRun: boolean }) => {
    let report: InstallReport;
    try {
      report = runInstall(name, opts);
    } catch (err) {
      console.error(chalk.red(`install failed: ${(err as Error).message}`));
      process.exitCode = 1;
      return;
    }
    printInstallReport(report, opts.dryRun);
  });

function printInstallReport(report: InstallReport, dryRun: boolean): void {
  const head = dryRun ? chalk.yellow("[dry-run] would install") : chalk.bold("Installed");
  console.log(
    `\n${head} ${chalk.green(report.component.name)} ${typeBadge(report.component.type)} ${chalk.dim(`→ ${report.cli}`)}`,
  );
  if (report.fuzzy) {
    console.log(chalk.dim(`  (fuzzy match — no exact name "${report.component.name}")`));
  }
  console.log(chalk.dim(`  source: ${report.component.source_url}\n`));
  for (const step of report.steps) {
    if (step.action === "wrote-file") console.log(`  ${chalk.green("✓ wrote")} ${step.detail}`);
    else if (step.action === "merged-mcp") console.log(`  ${chalk.green("✓ mcp")}   ${step.detail}`);
    else if (step.action === "skipped") console.log(`  ${chalk.yellow("• skip")}  ${step.detail}`);
    else console.log(`\n${chalk.bold(step.detail)}\n`);
  }
  if (report.followUp.length > 0) {
    console.log(chalk.bold("\nNext steps:"));
    for (const f of [...new Set(report.followUp)]) console.log(`  - ${f}`);
  }
}

program
  .command("submit")
  .description("Validate a component file's frontmatter and copy it into incoming/.")
  .requiredOption("-f, --file <path>", "path to the component markdown file")
  .action((opts: { file: string }) => {
    let result: SubmitResult;
    try {
      result = validateAndCopy(opts.file);
    } catch (err) {
      console.error(chalk.red(`Submit failed: ${(err as Error).message}`));
      process.exitCode = 1;
      return;
    }
    if (!result.ok) {
      console.error(chalk.red(`Validation failed for ${basename(opts.file)}:`));
      for (const e of result.errors) console.error(chalk.red(`  - ${e}`));
      process.exitCode = 1;
      return;
    }
    console.log(chalk.green(`Submitted "${result.name}" → ${result.dest}`));
    console.log(chalk.dim("It will be promoted to components/ after a quick verify."));
  });

program
  .command("list")
  .description("Show counts and component names, optionally filtered by type.")
  .option("-t, --type <type>", "filter to one component type")
  .action((opts: { type?: string }) => {
    const catalog = loadCatalog();
    let components = catalog.components;
    if (opts.type) components = components.filter((e) => e.type === opts.type);
    console.log(
      chalk.bold(
        `\n${components.length} component(s)${opts.type ? ` of type ${opts.type}` : ` across ${Object.keys(catalog.counts.by_type).length} types`}\n`
      )
    );
    if (!opts.type) {
      for (const [type, count] of Object.entries(catalog.counts.by_type)) {
        if (count > 0) console.log(`  ${typeBadge(type)} ${chalk.dim(String(count))}`);
      }
      console.log("");
    }
    for (const e of components) {
      console.log(`  ${chalk.green(e.name)} ${chalk.dim(e.type)}`);
    }
  });

interface RankRow {
  name: string; component: string; domain: string; url?: string;
  universal: number | null; stars: number | null; tested: number | null; mentions: number | null; desc: string;
}
interface RankResult { items: RankRow[]; total: number; sort: string; dir: string; facets: { total: number } }

// The Universal ranking engine (portable ESM shared with the site + MCP). Dynamic import keeps the
// TS build decoupled from the plain-JS engine.
async function rankEngine(): Promise<{ leaderboard: (o: object) => RankResult }> {
  return (await import("../../lib/rank.mjs")) as { leaderboard: (o: object) => RankResult };
}

program
  .command("rank")
  .description("Rank open-source building blocks by Universal score (or another axis), sliceable by component + domain.")
  .option("-c, --component <type>", "filter to one component: mcp|cli|skill|plugin|hook|subagent|rules|tool|...")
  .option("-d, --domain <domain>", "filter to one domain: front-end|back-end|browser|payments|ai-agents|...")
  .option("-s, --sort <axis>", "universal|popular|tested|practitioner|stars|name", "universal")
  .option("--asc", "ascending instead of descending", false)
  .option("-n, --limit <n>", "max results", "20")
  .option("--json", "emit JSON (for agents)", false)
  .action(async (opts: { component?: string; domain?: string; sort: string; asc: boolean; limit: string; json: boolean }) => {
    const { leaderboard } = await rankEngine();
    const lb = leaderboard({
      component: opts.component, domain: opts.domain, sort: opts.sort,
      dir: opts.asc ? "asc" : "desc", limit: Number(opts.limit) || 20,
    });
    if (opts.json) { console.log(JSON.stringify(lb, null, 2)); return; }
    const slice = [opts.component, opts.domain].filter(Boolean).join(" × ") || "everything";
    console.log(chalk.bold(`\nTop ${lb.items.length} in ${slice}`) + chalk.dim(`  ·  ${lb.total.toLocaleString()} of ${lb.facets.total.toLocaleString()} · by ${lb.sort} ${lb.dir}\n`));
    let rank = 0;
    for (const i of lb.items) {
      rank++;
      const u = i.universal != null ? chalk.bold(String(i.universal).padStart(4)) : chalk.dim("   —");
      const star = i.stars != null ? chalk.yellow(`★${i.stars.toLocaleString()}`) : "";
      const ment = i.mentions != null ? chalk.magenta(`♦${i.mentions}`) : "";
      console.log(`${chalk.dim(String(rank).padStart(3))}  ${u}  ${chalk.green(i.name)} ${typeBadge(i.component)} ${chalk.dim(i.domain)} ${star} ${ment}`);
      if (i.desc) console.log(`      ${chalk.dim(i.desc.slice(0, 96))}`);
      if (i.url) console.log(`      ${chalk.blue(i.url)}`);
    }
    console.log("");
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(chalk.red(`armory: ${(err as Error).message}`));
  process.exitCode = 1;
});
