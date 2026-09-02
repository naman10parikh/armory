import { defineConfig } from "vitest/config";

// agentic-user.test.mjs is a node:test script (CI runs it with `node --test`); vitest must not collect it.
export default defineConfig({ test: { include: ["test/**/*.test.ts"] } });
