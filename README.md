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
├── eslint.config.js     # ESLint 9 flat config (Node, Jest, browser scopes)
├── .prettierrc          # Prettier formatting rules
├── .prettierignore
├── .husky/
│   └── pre-commit       # Runs lint-staged before every commit
├── .github/
│   └── workflows/
│       └── ci.yml       # CI pipeline (lint + test matrix)
├── data/                # Content — edit these to update the site
│   ├── profile.json
│   ├── projects.json
│   └── skills.json
├── public/              # Static frontend, served at /
│   ├── index.html
│   ├── style.css
│   └── app.js
└── tests/
    └── server.test.js   # Integration tests (Jest + Supertest)
```

---

## npm scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `npm start`        | Start the production server           |
| `npm test`         | Run the test suite                    |
| `npm run lint`     | Check all JS files with ESLint        |
| `npm run lint:fix` | Auto-fix ESLint issues where possible |
| `npm run format`   | Format all files with Prettier        |

---

## API endpoints

All endpoints return `application/json`.

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

| Environment variable | Default | Description                |
| -------------------- | ------- | -------------------------- |
| `PORT`               | `3000`  | Port the server listens on |

Set via shell or a `.env` file (requires `dotenv` if using a `.env` file):

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

---

## CI

Every push to `main` and every pull request targeting `main` triggers three parallel jobs via GitHub Actions:

| Job           | What it does                   |
| ------------- | ------------------------------ |
| `lint`        | Runs `npm run lint` on Node 20 |
| `test (18.x)` | Runs the test suite on Node 18 |
| `test (20.x)` | Runs the test suite on Node 20 |

All three must pass for a green check. Pipeline status is visible on the [Actions tab](https://github.com/garystevens/garystevens/actions) and reflected in the badge at the top of this file.

To match CI locally before pushing:

```bash
npm ci && npm run lint && npm test -- --forceExit
```

`npm ci` (rather than `npm install`) mirrors what CI does — clean install from `package-lock.json`, fails if the lockfile is out of date.

---

## Architecture notes

`server.js` exports `app` and only calls `app.listen()` when run directly (`node server.js`). This allows tests to import the app without binding a port.

**Middleware order** (registration order matters in Express):

1. `morgan` — logs every request; skipped when `NODE_ENV=test`
2. `express.static` — serves `public/`
3. Data routes — `GET /data/*`
4. Global error handler — catches any unhandled error, returns `{ error: "..." }` JSON; masks 5xx messages in production

```
┌─────────────┐     GET /          ┌──────────────┐
│             │ ─────────────────> │  public/     │
│   Browser   │                    │  index.html  │
│             │ ─── GET /data/* ─> │  data/*.json │
│             │ ─── (any error) ─> │  error JSON  │
└─────────────┘                    └──────────────┘
```
