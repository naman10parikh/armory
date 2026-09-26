// A note's body as a reader should see it on its detail page (CP143, the copy audit's D1 and D4). The crawlers
// wrote their provenance and workflow state into about 65,000 notes; the files keep that text, and only the page
// changes, so no crawl has to rewrite them. New notes are written the plain way (ingest/crawl-*.mjs).

// A section whose whole body is one "See the source ..." line says nothing the Source link beside it does not
// (16,000-odd install and "When to use it" sections). `armory install` and the run check still read the file.
const POINTER_ONLY = /^see the source\b[^\n]*$/i;

function withoutPointerSections(md: string): string {
  return md.replace(/^#{1,6}[ \t]+[^\n]*\n([\s\S]*?)(?=^#{1,6}[ \t]|(?![\s\S]))/gm, (section: string, content: string) =>
    POINTER_ONLY.test(content.trim()) ? "" : section,
  );
}

// Each boilerplate line and how it reads on the page, in the order they apply.
const PLAIN: readonly [RegExp, string][] = [
  // The intake's workflow state, which tells a reader nothing.
  [/[ \t]*Pending verify (?:->|\u2192) promote\.?/g, ""],
  // A registry or sitemap: Glama, PulseMCP (with its page link), Smithery and mcp.so.
  [/Discovered via (?:the )?([^(\n]+?) \((?:live API|live sitemaps?|GitHub fallback|https?:\/\/[^)\s]+)\)\./g, "Listed from the $1."],
  [/License not declared in registry metadata \u2014 confirm before production use\./g, "The registry does not state a license. Check it before production use."],
  // Armory's own curated lists, some still under the project's old name.
  [/Discovered via the (?:Engram |Component )?([\w.-]+) curated list\./g, "Listed from Armory's $1 list."],
  [/Curated by the (?:Engram |Component )?([\w.-]+) adapter\./g, "Listed from Armory's $1 list."],
  // A list on GitHub, by section or category, and a file inside a collection.
  [/Discovered via (\[`[^`\]\n]+`\]\([^)\s]+\)) \u2014 (?:section|category): ([^.\n]+)\./g, "Listed from $1, under $2."],
  [/Discovered via (\[`[^`\]\n]+`\]\([^)\s]+\))\./g, "Listed from $1."],
  [/(Extracted from \[`[^`\]\n]+`\]\([^)\s]+\)) \u2014 ([\w-]+) category\. Type: [\w-]+\./g, "$1, $2 category."],
  [/ \u2014 a runnable starter project\./g, ", a runnable starter project."],
  // The seeding note named an internal task.
  [
    /Seeded (\d{4}-\d{2}-\d{2}) by CP138 T18 to give the ([\w-]+) shelf enough depth to rank\. Verified live on GitHub at seed time; not already in the catalogue\./g,
    "Added on $1 so the $2 list has enough rows to rank. Checked live on GitHub when added.",
  ],
];

/** The body a detail page renders: pointer-only sections left out, crawler boilerplate in plain words. */
export function plainNoteBody(md: string): string {
  let out = withoutPointerSections(md);
  for (const [pattern, replacement] of PLAIN) out = out.replace(pattern, replacement);
  return out;
}
