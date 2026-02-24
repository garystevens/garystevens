const express = require('express');
const path = require('path');

const app = express();

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Data API endpoints
app.get('/data/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'profile.json'));
});

app.get('/data/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'projects.json'));
});

app.get('/data/skills', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'skills.json'));
});

module.exports = app;

// Only listen when run directly, not when imported by tests
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
