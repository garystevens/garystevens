const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

// HTTP request logging — skipped in test to keep output clean
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Security headers
app.use(helmet());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Health check — used by uptime monitors and load balancers
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Data API endpoints
app.get('/data/profile', (_req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'profile.json'));
});

app.get('/data/projects', (_req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'projects.json'));
});

app.get('/data/skills', (_req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'skills.json'));
});

// Test-only route to exercise the error handler without polluting production routes
if (process.env.NODE_ENV === 'test') {
  app.get('/__test/error', (_req, _res, next) => next(new Error('Test error')));
}

// Global error handler — must be registered last
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status >= 500
      ? 'Internal server error'
      : err.message;
  res.status(status).json({ error: message });
});

module.exports = app;

// Only listen when run directly, not when imported by tests
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
