# ADR-002: Export `app` separately from `app.listen`

**Status:** Accepted
**Date:** 2026-02-25

---

## Context

The Express app needs to be both runnable as a server (`node server.js`) and importable by the test suite without opening a real network port. A naive implementation calls `app.listen()` at module load time, which causes test runners to bind ports and produces `EADDRINUSE` errors in CI.

## Decision

`server.js` exports `app` unconditionally and only calls `app.listen()` when the module is the process entry point:

```js
module.exports = app;

if (require.main === module) {
  app.listen(PORT, ...);
}
```

## Reasons

- **Clean test imports** — `require('../server')` in tests gets the Express app with no side effects
- **No port conflicts** — tests can spin up as many parallel suites as needed
- **Standard pattern** — widely used in the Node/Express ecosystem; familiar to any Express developer
- **Supertest compatible** — Supertest's `request(app)` handles its own ephemeral port binding internally

## Consequences

- The `require.main === module` branch is never executed during tests, leaving it uncovered in the coverage report — this is expected and documented
- Any future entry-point logic (graceful shutdown, process signal handling) goes in the `if (require.main === module)` block, not in the shared `app` setup
