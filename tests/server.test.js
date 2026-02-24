const request = require('supertest');
const app = require('../server');

describe('Static file serving', () => {
  test('GET / returns 200 with HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('GET /unknown returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});

describe('GET /data/profile', () => {
  let body;

  beforeAll(async () => {
    const res = await request(app).get('/data/profile');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    body = res.body;
  });

  test('has required top-level fields', () => {
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('bio');
    expect(body).toHaveProperty('links');
  });

  test('name and title are non-empty strings', () => {
    expect(typeof body.name).toBe('string');
    expect(body.name.length).toBeGreaterThan(0);
    expect(typeof body.title).toBe('string');
    expect(body.title.length).toBeGreaterThan(0);
  });

  test('links has expected keys', () => {
    expect(body.links).toHaveProperty('github');
    expect(body.links).toHaveProperty('linkedin');
    expect(body.links).toHaveProperty('email');
  });
});

describe('GET /data/projects', () => {
  let body;

  beforeAll(async () => {
    const res = await request(app).get('/data/projects');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    body = res.body;
  });

  test('is an array of 3 projects', () => {
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(3);
  });

  test.each([0, 1, 2])('project %i has required fields', (i) => {
    const project = body[i];
    expect(project).toHaveProperty('title');
    expect(project).toHaveProperty('description');
    expect(project).toHaveProperty('tags');
    expect(project).toHaveProperty('image');
    expect(project).toHaveProperty('url');
  });

  test.each([0, 1, 2])('project %i tags is a non-empty array', (i) => {
    expect(Array.isArray(body[i].tags)).toBe(true);
    expect(body[i].tags.length).toBeGreaterThan(0);
  });
});

describe('GET /data/skills', () => {
  let body;

  beforeAll(async () => {
    const res = await request(app).get('/data/skills');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    body = res.body;
  });

  test('is a non-empty array', () => {
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('each category has a name and skills array', () => {
    body.forEach((category) => {
      expect(category).toHaveProperty('category');
      expect(typeof category.category).toBe('string');
      expect(Array.isArray(category.skills)).toBe(true);
      expect(category.skills.length).toBeGreaterThan(0);
    });
  });
});
