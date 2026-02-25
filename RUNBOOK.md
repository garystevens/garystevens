# Runbook — garystevens

Operational reference for running, maintaining, and troubleshooting the portfolio server.

---

## Running with Docker

### Start

```bash
npm run docker:up
# or: docker compose up
```

Builds the image on first run. Subsequent starts reuse the cached image unless the `Dockerfile` or dependencies have changed.

To run in the background:

```bash
docker compose up -d
```

### Stop

```bash
npm run docker:down
# or: docker compose down
```

### View container logs

```bash
docker compose logs -f
```

### Rebuild the image

Required after changing `package.json`, `server.js`, or any file copied in the `Dockerfile`:

```bash
npm run docker:build
# then:
npm run docker:up
```

### Health check

```bash
curl -s http://localhost:3000/health
```

---

## Starting the server

```bash
npm start
```

Expected output:

```
Server running at http://localhost:3000
```

To run on a different port:

```bash
PORT=8080 npm start
```

---

## Stopping the server

Press `Ctrl+C` in the terminal where the server is running.

If the process is running in the background:

```bash
# Find the PID
lsof -i :3000

# Kill it
kill <PID>
```

---

## Request logging

Morgan logs every HTTP request to stdout. The format depends on the environment:

| `NODE_ENV`      | Format     | Example                                                         |
| --------------- | ---------- | --------------------------------------------------------------- |
| (default / dev) | `dev`      | `GET /data/profile 200 3.2 ms`                                  |
| `production`    | `combined` | Apache combined log format — includes IP, user-agent, timestamp |
| `test`          | —          | Logging is suppressed                                           |

To follow logs in real time (if running as a background process):

```bash
node server.js 2>&1 | tee server.log
tail -f server.log
```

---

## Verifying the server is healthy

The fastest check — the dedicated health endpoint:

```bash
curl -s http://localhost:3000/health
# {"status":"ok","uptime":12.3,"timestamp":1700000000000}
```

To verify all data endpoints are also responding:

```bash
curl -s http://localhost:3000/data/profile | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('name:', d.name)"
curl -s http://localhost:3000/data/projects | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('projects:', d.length)"
curl -s http://localhost:3000/data/skills | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('categories:', d.length)"
```

Or run the full test suite:

```bash
npm test
```

---

## Updating content

1. Edit the relevant file in `data/`:

   | Goal                         | File                 |
   | ---------------------------- | -------------------- |
   | Update bio, title, or links  | `data/profile.json`  |
   | Add or edit a project        | `data/projects.json` |
   | Add or edit a skill category | `data/skills.json`   |

2. Validate the change:

   ```bash
   npm test
   ```

3. No server restart needed — changes are served immediately on the next request.

---

## Adding a new project

Open `data/projects.json` and append an object to the array:

```json
{
  "title": "My New Project",
  "description": "One or two sentences about what it does.",
  "tags": ["Tag1", "Tag2"],
  "image": "/images/my-new-project.png",
  "url": "https://github.com/garystevens/my-new-project"
}
```

Place the image file at `public/images/my-new-project.png`.

Run `npm test` to confirm the data file is still valid. Note: the test suite currently asserts exactly 3 projects — update that assertion in [tests/server.test.js](tests/server.test.js#L58) when adding more.

---

## Environment configuration

All environment variables are documented in [.env.example](.env.example).

### Local setup

```bash
cp .env.example .env
# Edit .env as needed — defaults work out of the box
```

`.env` is loaded automatically at startup via `dotenv`. It is gitignored and must never be committed.

### Available variables

| Variable   | Default       | Effect                                                                         |
| ---------- | ------------- | ------------------------------------------------------------------------------ |
| `PORT`     | `3000`        | Port the server listens on                                                     |
| `NODE_ENV` | `development` | `development`: dev logs, full errors · `production`: combined logs, masked 5xx |

### Production

Do not use a `.env` file in production. Set variables through your hosting platform's environment config (e.g. Railway, Fly.io, Render, or shell `export`). The app reads from `process.env` directly — `dotenv` is a no-op when no `.env` file is present.

---

## Installing dependencies after a fresh clone

```bash
npm install
```

This installs all dependencies — production (`express`) and dev (`jest`, `supertest`, `eslint`, `prettier`, `husky`, `lint-staged`). Husky's git hooks are set up automatically via the `prepare` script.

---

## Running checks

### Tests

```bash
npm test
```

All 23 tests should pass. A failure indicates either:

- A data file is malformed or missing a required field
- A route is broken in `server.js`
- A file was renamed or moved

### Lint

```bash
npm run lint
```

No output means all files pass. To auto-fix fixable issues:

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

Rewrites files in place. Safe to run at any time — commit first if you want a clean diff.

---

## Pre-commit hook

Husky installs a `pre-commit` hook that runs **lint-staged** automatically on every `git commit`. It only processes staged files, so it's fast.

What it does per file type:

| Files                     | Steps                         |
| ------------------------- | ----------------------------- |
| `*.js`                    | `eslint --fix`, then Prettier |
| `*.json`, `*.md`, `*.yml` | Prettier                      |

If the hook blocks a commit, fix the reported issues and re-stage:

```bash
npm run lint:fix
git add -p       # re-stage the fixed files
git commit
```

To skip the hook in an emergency (use sparingly):

```bash
git commit --no-verify -m "message"
```

---

## CI pipeline

### What triggers it

- Every push to `main`
- Every pull request targeting `main`

Four jobs run in parallel — all must pass for the check to be green:

| Job           | What it runs                                        |
| ------------- | --------------------------------------------------- |
| `lint`        | `npm run lint` on Node 20                           |
| `test (18.x)` | Test suite on Node 18                               |
| `test (20.x)` | Test suite on Node 20                               |
| `docker`      | `docker build` — validates the image builds cleanly |

### Checking pipeline status

Go to the **Actions** tab on GitHub. Each run shows per-job logs. The badge in the README reflects the latest run on `main`.

### When CI fails

1. Click into the failed run on the Actions tab
2. Identify which job failed — `lint`, `test (18.x)`, or `test (20.x)`
3. Expand the failing step (**Lint** or **Run tests**) to see the error
4. Fix locally and verify:

   ```bash
   # If lint failed:
   npm run lint:fix && npm run lint

   # If tests failed:
   npm test -- --forceExit
   ```

5. Push the fix — CI re-runs automatically

### Common CI failure causes

| Symptom                           | Likely cause                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm ci` fails                    | `package-lock.json` is out of sync — run `npm install` locally and commit the updated lockfile     |
| Lint fails in CI but not locally  | ESLint or Prettier version mismatch — ensure you ran `npm ci`, not `npm install`                   |
| Tests pass locally but fail in CI | An absolute path or OS-specific behaviour in a test; check the logs for the differing Node version |
| Docker build fails in CI          | A file referenced in the `Dockerfile` was moved or the base image tag is unavailable               |
| Workflow doesn't trigger          | Branch name doesn't match `main`; check the `on.push.branches` value in `ci.yml`                   |

---

## Troubleshooting

### Docker container won't start

Check the logs immediately after the failure:

```bash
docker compose logs
```

Common causes:

- Port 3000 already in use — stop the conflicting process or change `PORT`
- Image not built — run `npm run docker:build` first

### Changes to data files not reflected in the container

The `data/` directory is mounted as a volume — no rebuild needed. If changes still aren't showing, confirm the volume is mounted:

```bash
docker compose config
```

Look for the `volumes` entry pointing `./data` to `/app/data`.

### Changes to server.js or package.json not reflected

These files are baked into the image at build time, not mounted. Rebuild:

```bash
npm run docker:build && npm run docker:up
```

---

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::3000
```

Another process is using port 3000. Either stop it or use a different port:

```bash
PORT=3001 npm start
```

To find and kill the conflicting process:

```bash
lsof -i :3000
kill <PID>
```

---

### `Cannot find module 'express'`

Dependencies are not installed. Run:

```bash
npm install
```

---

### Data endpoint returns 404

The file in `data/` is missing or the route in `server.js` doesn't match. Verify:

```bash
ls data/
```

Expected: `profile.json`, `projects.json`, `skills.json`.

---

### JSON parse error in browser / test failure on shape

A data file contains invalid JSON. Validate it:

```bash
node -e "require('./data/profile.json')"
node -e "require('./data/projects.json')"
node -e "require('./data/skills.json')"
```

No output means the file is valid. A `SyntaxError` points to the offending file.

---

### ESLint or Prettier errors on commit

The pre-commit hook blocked your commit. Read the output to identify the file and rule, then:

```bash
npm run lint:fix   # auto-fix what ESLint can
npm run format     # fix all Prettier issues
git add -p         # re-stage the corrected files
git commit
```

If the issue can't be auto-fixed, edit the file manually, re-stage, and commit.

---

### Static files (CSS/JS) not loading

Confirm the files exist under `public/`:

```bash
ls public/
```

Expected: `index.html`, `style.css`, `app.js`. Express serves this directory at `/` automatically.
