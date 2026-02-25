# garystevens

[![CI](https://github.com/garystevens/garystevens/actions/workflows/ci.yml/badge.svg)](https://github.com/garystevens/garystevens/actions/workflows/ci.yml)

Personal portfolio site. A Node.js/Express server that exposes content data as JSON API endpoints and serves a static frontend from `public/`.

---

## Requirements

- Node.js 18+
- npm 9+

---

## Quick start

```bash
npm install
npm start
```

Server starts at `http://localhost:3000`.

---

## Project structure

```
garystevens/
├── server.js            # Express app (exported) + entry point
├── package.json
├── Dockerfile           # Production image (node:20-alpine, non-root user)
├── docker-compose.yml   # Local dev container with data/ volume mount
├── .dockerignore
├── .env.example         # Documented env vars — copy to .env for local dev
├── eslint.config.js     # ESLint 9 flat config (Node, Jest, browser scopes)
├── .prettierrc          # Prettier formatting rules
├── .prettierignore
├── .husky/
│   └── pre-commit       # Runs lint-staged before every commit
├── .github/
│   └── workflows/
│       └── ci.yml       # CI pipeline (lint + test + docker build)
├── data/                # Content — edit these to update the site
│   ├── profile.json
│   ├── projects.json
│   └── skills.json
├── public/              # Static frontend, served at /
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tests/
│   └── server.test.js   # Integration tests (Jest + Supertest)
├── docs/
│   └── decisions/       # Architecture Decision Records
│       ├── 001-static-json-content.md
│       ├── 002-app-export-pattern.md
│       └── 003-commonjs-over-esm.md
└── CHANGELOG.md
```

---

## npm scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm start`             | Start the production server               |
| `npm test`              | Run the test suite                        |
| `npm run lint`          | Check all JS files with ESLint            |
| `npm run lint:fix`      | Auto-fix ESLint issues where possible     |
| `npm run format`        | Format all files with Prettier            |
| `npm run test:coverage` | Run tests and enforce coverage thresholds |
| `npm run docker:build`  | Build the Docker image                    |
| `npm run docker:up`     | Start the container via docker-compose    |
| `npm run docker:down`   | Stop and remove the container             |

---

## API endpoints

All endpoints return `application/json`.

### `GET /health`

Returns server health status. Intended for uptime monitors and load balancers — does not check data files.

```json
{
  "status": "ok",
  "uptime": 42.3,
  "timestamp": 1700000000000
}
```

### `GET /data/profile`

Returns personal profile information.

```json
{
  "name": "string",
  "title": "string",
  "bio": "string",
  "links": {
    "github": "string (URL)",
    "linkedin": "string (URL)",
    "email": "string"
  }
}
```

### `GET /data/projects`

Returns an array of portfolio projects.

```json
[
  {
    "title": "string",
    "description": "string",
    "tags": ["string"],
    "image": "string (path)",
    "url": "string (URL)"
  }
]
```

### `GET /data/skills`

Returns skill categories and their members.

```json
[
  {
    "category": "string",
    "skills": ["string"]
  }
]
```

---

## Updating content

All content lives in `data/`. No server restart is needed between edits during development — changes take effect on the next request.

| File                 | What to edit                             |
| -------------------- | ---------------------------------------- |
| `data/profile.json`  | Name, title, bio, social links           |
| `data/projects.json` | Add, remove, or update projects          |
| `data/skills.json`   | Add, remove, or reorder skill categories |

After editing, run `npm test` to verify the data files still conform to the expected shape.

---

## Configuration

| Environment variable | Default       | Description                                                                       |
| -------------------- | ------------- | --------------------------------------------------------------------------------- |
| `PORT`               | `3000`        | Port the server listens on                                                        |
| `NODE_ENV`           | `development` | Controls logging format and error verbosity (`development`, `production`, `test`) |

**Local development** — copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example .env
```

`.env` is loaded automatically by `dotenv` on startup and is gitignored — never commit it. In production, set variables through your platform's environment config instead.

**Inline override** (without a `.env` file):

```bash
PORT=8080 npm start
```

---

## Code quality

| Tool                                                      | Config              | Purpose                                                          |
| --------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| [ESLint](https://eslint.org/)                             | `eslint.config.js`  | Linting — separate rule scopes for Node, Jest, and browser files |
| [Prettier](https://prettier.io/)                          | `.prettierrc`       | Formatting — single quotes, trailing commas, 80-char width       |
| [Husky](https://typicode.github.io/husky/)                | `.husky/pre-commit` | Git hook that runs lint-staged before every commit               |
| [lint-staged](https://github.com/lint-staged/lint-staged) | `package.json`      | Runs ESLint + Prettier on staged files only                      |

---

## Testing

Tests use [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest). The Express `app` is imported directly — no real server port is opened during tests.

```bash
npm test
```

Coverage areas:

- `GET /` returns 200 HTML
- Unknown routes return 404
- Each `/data/*` endpoint returns 200 JSON with the correct shape
- Required fields and types are validated per endpoint
- Unhandled errors return JSON (not HTML) with the correct status code
- `GET /health` returns `{ status, uptime, timestamp }`
- Security headers are present on all responses (helmet)

**Coverage thresholds** (enforced via `npm run test:coverage`):

| Metric     | Threshold | Notes                                                                                                                                                                                   |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Statements | 85%       |                                                                                                                                                                                         |
| Functions  | 85%       |                                                                                                                                                                                         |
| Lines      | 85%       |                                                                                                                                                                                         |
| Branches   | 45%       | Lower due to environment-conditional code (`NODE_ENV` guards, `require.main`) that cannot be exercised in a standard test run — see [ADR-002](docs/decisions/002-app-export-pattern.md) |

---

## CI

Every push to `main` and every pull request targeting `main` triggers three parallel jobs via GitHub Actions:

| Job           | What it does                             |
| ------------- | ---------------------------------------- |
| `lint`        | Runs `npm run lint` on Node 20           |
| `test (18.x)` | Runs the test suite on Node 18           |
| `test (20.x)` | Runs the test suite on Node 20           |
| `docker`      | Builds the Docker image (`docker build`) |

All three must pass for a green check. Pipeline status is visible on the [Actions tab](https://github.com/garystevens/garystevens/actions) and reflected in the badge at the top of this file.

To match CI locally before pushing:

```bash
npm ci && npm run lint && npm test -- --forceExit
```

`npm ci` (rather than `npm install`) mirrors what CI does — clean install from `package-lock.json`, fails if the lockfile is out of date.

---

## Docker

The app ships as a single container built from `node:20-alpine`. Production dependencies only are installed — dev tooling is excluded.

```bash
# Build and start via docker-compose (recommended for local use)
npm run docker:up

# Or build and run the image directly
docker build -t garystevens .
docker run -p 3000:3000 garystevens
```

`docker-compose.yml` mounts `data/` as a read-only volume, so JSON content files can be edited without rebuilding the image.

---

## Architecture Decision Records

Key decisions are documented in [`docs/decisions/`](docs/decisions/):

| ADR                                              | Decision                                                   |
| ------------------------------------------------ | ---------------------------------------------------------- |
| [001](docs/decisions/001-static-json-content.md) | Static JSON files for content storage (vs database or CMS) |
| [002](docs/decisions/002-app-export-pattern.md)  | Export `app` separately from `app.listen` for testability  |
| [003](docs/decisions/003-commonjs-over-esm.md)   | CommonJS over ES Modules                                   |

---

## Architecture notes

`server.js` exports `app` and only calls `app.listen()` when run directly (`node server.js`). This allows tests to import the app without binding a port.

**Middleware order** (registration order matters in Express):

1. `morgan` — logs every request; skipped when `NODE_ENV=test`
2. `helmet` — sets security headers on every response
3. `express.static` — serves `public/`
4. `GET /health` — lightweight health check
5. Data routes — `GET /data/*`
6. Global error handler — catches any unhandled error, returns `{ error: "..." }` JSON; masks 5xx messages in production

```
┌─────────────┐     GET /          ┌──────────────┐
│             │ ─────────────────> │  public/     │
│   Browser   │                    │  index.html  │
│             │ ─── GET /data/* ─> │  data/*.json │
│             │ ─── (any error) ─> │  error JSON  │
└─────────────┘                    └──────────────┘
```
