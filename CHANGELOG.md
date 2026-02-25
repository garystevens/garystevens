# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- Node.js/Express server (`server.js`) serving a `public/` directory and JSON data API
- Data endpoints: `GET /data/profile`, `GET /data/projects`, `GET /data/skills`
- `GET /health` endpoint returning `{ status, uptime, timestamp }` for uptime monitors
- Static HTML shell (`public/index.html`) with `style.css` and `app.js` placeholders
- Placeholder content in `data/profile.json`, `data/projects.json`, `data/skills.json`
- Jest + Supertest integration test suite (23 tests) covering routes, data shapes, security headers, and error handling
- ESLint 9 flat config with separate rule scopes for Node, Jest, and browser files
- Prettier formatting with single quotes, trailing commas, 80-char print width
- Husky pre-commit hook running lint-staged on staged files only
- GitHub Actions CI pipeline: lint, test matrix (Node 18 + 20), Docker build — all parallel
- Jest coverage thresholds (statements/functions/lines ≥ 85%, branches ≥ 45%)
- morgan HTTP request logging: `dev` format locally, `combined` in production, suppressed in test
- helmet security headers on all responses
- Global error handler returning `{ error }` JSON; masks 5xx messages in production
- Dockerfile (`node:20-alpine`, production deps only, non-root `USER node`)
- `docker-compose.yml` with `data/` volume mount for live content editing
- dotenv support; `.env.example` documents all environment variables
- `README.md` with project structure, API reference, configuration, and architecture notes
- `RUNBOOK.md` covering Docker, logging, health checks, content updates, CI, and troubleshooting
- Architecture Decision Records in `docs/decisions/`
