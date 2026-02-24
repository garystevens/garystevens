# Runbook — garystevens

Operational reference for running, maintaining, and troubleshooting the portfolio server.

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

## Verifying the server is healthy

Check that all three data endpoints respond:

```bash
curl -s http://localhost:3000/data/profile | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('name:', d.name)"
curl -s http://localhost:3000/data/projects | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('projects:', d.length)"
curl -s http://localhost:3000/data/skills | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('categories:', d.length)"
```

Or run the test suite as a health check:

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

## Installing dependencies after a fresh clone

```bash
npm install
```

This installs both production (`express`) and dev (`jest`, `supertest`) dependencies.

---

## Running tests

```bash
npm test
```

All 14 tests should pass. A failure indicates either:

- A data file is malformed or missing a required field
- A route is broken in `server.js`
- A file was renamed or moved

---

## CI pipeline

### What triggers it

- Every push to `main`
- Every pull request targeting `main`

Runs on Node 18 and Node 20 in parallel. Both must pass for the job to be green.

### Checking pipeline status

Go to the **Actions** tab on GitHub. Each run shows per-job logs. The badge in the README reflects the latest run on `main`.

### When CI fails

1. Click into the failed run on the Actions tab
2. Expand the **Run tests** step to see which tests failed and why
3. Fix the issue locally, verify with:
   ```bash
   npm ci && npm test -- --forceExit
   ```
4. Push the fix — CI re-runs automatically

### Common CI failure causes

| Symptom                           | Likely cause                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm ci` fails                    | `package-lock.json` is out of sync — run `npm install` locally and commit the updated lockfile     |
| Tests pass locally but fail in CI | An absolute path or OS-specific behaviour in a test; check the logs for the differing Node version |
| Workflow doesn't trigger          | Branch name doesn't match `main`; check the `on.push.branches` value in `ci.yml`                   |

---

## Troubleshooting

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

### Static files (CSS/JS) not loading

Confirm the files exist under `public/`:

```bash
ls public/
```

Expected: `index.html`, `style.css`, `app.js`. Express serves this directory at `/` automatically.
