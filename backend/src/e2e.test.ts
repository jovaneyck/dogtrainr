import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from './createApp.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express } from 'express';

describe('E2E smoke test', () => {
  let app: Express;
  let dataRoot: string;

  beforeAll(() => {
    dataRoot = path.join(process.cwd(), 'data', `test-e2e-${crypto.randomUUID()}`);
    fs.mkdirSync(path.join(dataRoot, 'dogs'), { recursive: true });
    app = createApp(dataRoot);
  });

  afterAll(() => {
    if (fs.existsSync(dataRoot)) fs.rmSync(dataRoot, { recursive: true });
  });

  it('health check returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  let dogId: string;
  let dogPicture: string;
  const imageData = Buffer.from('fake-png-data');

  it('creates a dog with picture upload', async () => {
    const res = await request(app)
      .post('/api/dogs')
      .field('name', 'Buddy')
      .attach('picture', imageData, 'buddy.png');

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Buddy');
    expect(res.body.id).toBeDefined();
    dogId = res.body.id;
    dogPicture = res.body.picture;
  });

  it('retrieves the created dog', async () => {
    const res = await request(app).get(`/api/dogs/${dogId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Buddy');
  });

  it('serves the uploaded dog picture as a static file', async () => {
    const res = await request(app).get(`/uploads/dogs/${dogPicture}`);
    expect(res.status).toBe(200);
    expect(Buffer.from(res.body).toString()).toBe(imageData.toString());
  });

  let trainingId: string;

  it('creates a training', async () => {
    const res = await request(app)
      .post('/api/trainings')
      .send({ name: 'Sit', procedure: '# Sit procedure', tips: 'Be patient' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Sit');
    trainingId = res.body.id;
  });

  it('retrieves the created training', async () => {
    const res = await request(app).get(`/api/trainings/${trainingId}`);
    expect(res.status).toBe(200);
    expect(res.body.procedure).toBe('# Sit procedure');
  });

  it('uploads an image to a training', async () => {
    const res = await request(app)
      .post(`/api/trainings/${trainingId}/images`)
      .attach('image', imageData, 'step1.png');

    expect(res.status).toBe(201);
    expect(res.body.filename).toBeDefined();
    expect(res.body.url).toContain('/uploads/trainings/');
  });

  let planId: string;

  it('creates a plan with a monday schedule', async () => {
    const res = await request(app)
      .post('/api/plans')
      .send({
        name: 'Puppy Basics',
        schedule: {
          monday: [trainingId], tuesday: [trainingId], wednesday: [],
          thursday: [], friday: [], saturday: [], sunday: []
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Puppy Basics');
    planId = res.body.id;
  });

  it('retrieves the created plan', async () => {
    const res = await request(app).get(`/api/plans/${planId}`);
    expect(res.status).toBe(200);
    expect(res.body.schedule.monday).toContain(trainingId);
  });

  it('assigns plan to dog, creates session, and lists merged sessions', async () => {
    // Assign plan
    await request(app).put(`/api/dogs/${dogId}/plan`).send({ planId });

    // Create completed session for Monday 2026-03-09
    const sessionRes = await request(app)
      .post(`/api/dogs/${dogId}/sessions`)
      .send({ trainingId, planId, date: '2026-03-09', status: 'completed', score: 8 });
    expect(sessionRes.status).toBe(201);

    // List sessions Mon-Tue (2026-03-09 is Monday, 2026-03-10 is Tuesday)
    const listRes = await request(app)
      .get(`/api/dogs/${dogId}/sessions?from=2026-03-09&to=2026-03-10`);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(2);

    // Monday: persisted completed session
    const monday = listRes.body.find((s: any) => s.date === '2026-03-09');
    expect(monday.status).toBe('completed');
    expect(monday.score).toBe(8);
    expect(monday.id).toBeDefined();

    // Tuesday: computed planned session
    const tuesday = listRes.body.find((s: any) => s.date === '2026-03-10');
    expect(tuesday.status).toBe('planned');
    expect(tuesday.id).toBeUndefined();
  });

  it('deletes dog, training, plan and verifies 404', async () => {
    await request(app).delete(`/api/dogs/${dogId}`).expect(204);
    await request(app).delete(`/api/trainings/${trainingId}`).expect(204);
    await request(app).delete(`/api/plans/${planId}`).expect(204);

    await request(app).get(`/api/dogs/${dogId}`).expect(404);
    await request(app).get(`/api/trainings/${trainingId}`).expect(404);
    await request(app).get(`/api/plans/${planId}`).expect(404);
  });
});
