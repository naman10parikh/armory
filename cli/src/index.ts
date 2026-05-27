#!/usr/bin/env node
// Armory CLI — where agents gear up. Search, get, install, submit, list harness
// components (engrams). Reads the generated catalog.json (the contract) and
// installs components into whatever coding harness you're in. See CONTRIBUTING.md.
import { basename } from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { loadCatalog, rankEngrams, readEngramBody, type Engram } from "./catalog.js";
import { validateAndCopy, type SubmitResult } from "./submit.js";
import { runInstall, type InstallReport } from "./install.js";

const program = new Command();

program
  .name("armory")
  .description("Armory — where agents gear up. Search and install harness components (engrams).")
  .version("0.1.0");

function findByName(name: string): Engram | undefined {
  return loadCatalog().engrams.find((e) => e.name === name.trim());
}

function typeBadge(type: string): string {
  return chalk.cyan(`[${type}]`);
}

program
  .command("search")
  .description("Keyword-rank engrams by name + description + tags.")
  .argument("<query>", "search terms")
  .option("-t, --type <type>", "filter to one component type")
  .option("-n, --limit <n>", "max results", "10")
  .action((query: string, opts: { type?: string; limit: string }) => {
    let engrams = loadCatalog().engrams;
    if (opts.type) engrams = engrams.filter((e) => e.type === opts.type);
    const ranked = rankEngrams(engrams, query).slice(0, Number(opts.limit) || 10);
    if (ranked.length === 0) {
      console.log(chalk.yellow(`No engrams matched "${query}".`));
      return;
    }
    console.log(chalk.bold(`\nTop ${ranked.length} for "${query}":\n`));
    for (const { engram, score } of ranked) {
      console.log(
        `${chalk.green(engram.name)} ${typeBadge(engram.type)} ${chalk.dim(`(${score.toFixed(2)})`)}`
      );
      console.log(`  ${engram.description.trim()}`);
      console.log(`  ${chalk.blue(engram.source_url)}\n`);
    }
  });

program
  .command("get")
  .description("Print the full engram markdown.")
  .argument("<name>", "engram name")
  .action((name: string) => {
    const engram = findByName(name);
    if (!engram) {
      console.error(chalk.red(`Engram "${name}" not found.`));
      process.exitCode = 1;
      return;
    }
    console.log(readEngramBody(engram));
  });

program
  .command("install")
  .description("Fetch a component and install it into your coding harness (claude/cursor/codex/opencode/gemini).")
  .argument("<name>", "engram name (fuzzy-matched if no exact hit)")
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
    `\n${head} ${chalk.green(report.engram.name)} ${typeBadge(report.engram.type)} ${chalk.dim(`→ ${report.cli}`)}`,
  );
  if (report.fuzzy) {
    console.log(chalk.dim(`  (fuzzy match — no exact name "${report.engram.name}")`));
  }
  console.log(chalk.dim(`  source: ${report.engram.source_url}\n`));
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
  .description("Validate an engram file's frontmatter and copy it into incoming/.")
  .requiredOption("-f, --file <path>", "path to the engram markdown file")
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
  .description("Show counts and engram names, optionally filtered by type.")
  .option("-t, --type <type>", "filter to one component type")
  .action((opts: { type?: string }) => {
    const catalog = loadCatalog();
    let engrams = catalog.engrams;
    if (opts.type) engrams = engrams.filter((e) => e.type === opts.type);
    console.log(
      chalk.bold(
        `\n${engrams.length} engram(s)${opts.type ? ` of type ${opts.type}` : ` across ${Object.keys(catalog.counts.by_type).length} types`}\n`
      )
    );
    if (!opts.type) {
      for (const [type, count] of Object.entries(catalog.counts.by_type)) {
        if (count > 0) console.log(`  ${typeBadge(type)} ${chalk.dim(String(count))}`);
      }
      console.log("");
    }
    for (const e of engrams) {
      console.log(`  ${chalk.green(e.name)} ${chalk.dim(e.type)}`);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(chalk.red(`armory: ${(err as Error).message}`));
  process.exitCode = 1;
});
