#!/usr/bin/env node
// SessionStart hook shipped with the Armory plugin. It reminds the agent, once per session, that a ranked
// catalog of agent components is one call away, so it searches before it hand-rolls an MCP server, skill,
// hook, sub-agent or rule. It prints one line, reads nothing, needs no network and always exits 0.
console.log(
  "Armory is installed: before you build an MCP server, skill, hook, sub-agent or rule from scratch, search " +
    "the catalog with the armory MCP tool search_components (or `npx -y @namanparikh/armory search \"<need>\"`) " +
    "and install the best match with `armory install <name>`.",
);
process.exit(0);
