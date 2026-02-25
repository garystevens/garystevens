# ADR-001: Static JSON files for content storage

**Status:** Accepted
**Date:** 2026-02-25

---

## Context

The portfolio site needs to store and serve structured content: profile information, a list of projects, and skill categories. Options considered:

1. **Static JSON files** served directly by Express
2. **A database** (SQLite, PostgreSQL) with an ORM
3. **A headless CMS** (Contentful, Sanity)
4. **Hardcoded data** inside JavaScript modules

## Decision

Use static JSON files in a `data/` directory, served via dedicated Express routes.

## Reasons

- **Zero infrastructure** — no database process, no migrations, no connection strings
- **Git-native** — content changes are tracked, diffable, and revertable like code
- **No build step** — files are read at request time; changes take effect immediately
- **Readable without tooling** — anyone can edit `data/profile.json` directly
- **Testable** — Jest tests assert the shape of the files via the API, catching schema drift

## Consequences

- Content cannot be updated without file system access (no CMS UI, no API writes)
- Not suitable if content grows large or requires querying/filtering
- If a CMS or database is introduced later, the API surface (`GET /data/*`) stays the same — only the handler implementation changes
