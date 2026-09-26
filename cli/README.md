# armory

The command line for [Armory](https://armory-murex.vercel.app), a ranked catalog of open-source parts for
coding agents: MCP servers, skills, sub-agents, rules, hooks, CLIs and more. Every ranked row carries one
0 to 100 score built from public evidence: tests, practitioner mentions, GitHub stars and forks, and
registry installs. How the score works: <https://armory-murex.vercel.app/formula>.

## Commands

```bash
armory search "browser automation"          # find components by what they do
armory rank --component mcp --limit 10      # the top of one shelf, by score
armory get github-mcp                       # one component in full
armory install github-mcp --cli claude      # place it in this project's harness
armory install github-mcp --dry-run         # show what would be written, write nothing
armory init --claude                        # wire the Armory MCP server into this harness
armory list                                 # what the catalog holds, by type
armory submit --file ./my-component.md      # propose a component
```

`--cli` takes `claude`, `cursor`, `codex`, `opencode` or `gemini`. Without it, the harness is detected
from the project folder.

## What `armory install` places

It places a file only where there is one to place:

- an MCP server entry, when the component names a command whose package is published from its own
  repository
- a skill folder
- one sub-agent, rule, command or hook file

For anything else it says "Not installed", why, and where the source is, and exits 1. A memory system
or a CLI installs with its own tool.

## Running it

Not yet on npm. From a clone of the repository:

```bash
cd cli && pnpm install && pnpm build
node dist/index.js search "browser automation"
```

It reads `catalog.json` from the repository root. Set `ENGRAM_ROOT` to use a catalog in another folder.

## License

MIT, like the repository. See [LICENSE](./LICENSE).
