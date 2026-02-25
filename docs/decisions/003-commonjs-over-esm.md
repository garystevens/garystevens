# ADR-003: CommonJS over ES Modules

**Status:** Accepted
**Date:** 2026-02-25

---

## Context

Node.js supports two module systems: CommonJS (`require`/`module.exports`) and ES Modules (`import`/`export`). New projects must choose one. Key dependencies include Express 4, Jest, dotenv, morgan, and helmet.

## Decision

Use CommonJS throughout the project.

## Reasons

- **Express 4 compatibility** — Express 4 is a CommonJS package; mixing ESM and CJS requires careful interop configuration
- **Jest compatibility** — Jest's ESM support requires additional configuration (`--experimental-vm-modules`, Babel, or `ts-jest`); CommonJS works out of the box
- **Simpler toolchain** — No Babel, no transpilation, no `.mjs` extensions needed
- **`__dirname` availability** — Used in `server.js` for `path.join(__dirname, ...)` to resolve file paths reliably; not available natively in ESM without `import.meta.url` workarounds
- **dotenv compatibility** — `require('dotenv').config()` at the top of the entry file is the canonical dotenv pattern; ESM requires a different approach

## Consequences

- VS Code may show a hint suggesting conversion to ESM (code 80001) — this can be safely ignored
- If the project migrates to Express 5 (which has native ESM support) or adopts a bundler in the future, migrating to ESM would be straightforward
- All new files in this project should use `require`/`module.exports`
