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

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm test` | Run the test suite |

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

| File | What to edit |
|---|---|
| `data/profile.json` | Name, title, bio, social links |
| `data/projects.json` | Add, remove, or update projects |
| `data/skills.json` | Add, remove, or reorder skill categories |

After editing, run `npm test` to verify the data files still conform to the expected shape.

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |

Set via shell or a `.env` file (requires `dotenv` if using a `.env` file):

```bash
PORT=8080 npm start
```

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

---

## CI

Every push to `main` and every pull request targeting `main` runs the test suite automatically via GitHub Actions across Node 18 and Node 20.

Pipeline status is visible on the [Actions tab](https://github.com/garystevens/garystevens/actions) and reflected in the badge at the top of this file.

To match CI locally before pushing:

```bash
npm ci && npm test -- --forceExit
```

`npm ci` (rather than `npm install`) mirrors what CI does — clean install from `package-lock.json`, fails if the lockfile is out of date.

---

## Architecture notes

`server.js` exports `app` and only calls `app.listen()` when run directly (`node server.js`). This allows tests to import the app without binding a port.

```
┌─────────────┐     GET /          ┌──────────────┐
│             │ ─────────────────> │  public/     │
│   Browser   │                    │  index.html  │
│             │ ─── GET /data/* ─> │  data/*.json │
└─────────────┘                    └──────────────┘
```
