import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from './index.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express } from 'express';

describe('Sessions API', () => {
  let app: Express;
  let dataRoot: string;
  let dogId: string;
  const trainingId = crypto.randomUUID();

  beforeEach(async () => {
    dataRoot = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    fs.mkdirSync(path.join(dataRoot, 'dogs'), { recursive: true });
    app = createApp(dataRoot);

    // Create a dog for all session tests
    const testImageBuffer = Buffer.from('fake-image-data');
    const res = await request(app)
      .post('/api/dogs')
      .field('name', 'Buddy')
      .attach('picture', testImageBuffer, 'buddy.jpg');
    dogId = res.body.id;
  });

  afterEach(() => {
    if (fs.existsSync(dataRoot)) {
      fs.rmSync(dataRoot, { recursive: true });
    }
  });

  describe('POST /api/dogs/:dogId/sessions', () => {
    it('creates a session for a dog', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 8 });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.dogId).toBe(dogId);
      expect(res.body.trainingId).toBe(trainingId);
      expect(res.body.date).toBe('2026-02-14');
      expect(res.body.status).toBe('completed');
      expect(res.body.score).toBe(8);
    });

    it('creates a session with optional planId and notes', async () => {
      const planId = crypto.randomUUID();
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, planId, date: '2026-02-14', status: 'completed', score: 7, notes: 'Good boy' });

      expect(res.status).toBe(201);
      expect(res.body.planId).toBe(planId);
      expect(res.body.notes).toBe('Good boy');
    });

    it('creates a skipped session without score', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'skipped' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('skipped');
      expect(res.body.score).toBeUndefined();
    });

    it('returns 404 for non-existent dog', async () => {
      const fakeDogId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/api/dogs/${fakeDogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      expect(res.status).toBe(404);
    });

    it('returns 400 when dogId is not a valid UUID', async () => {
      const res = await request(app)
        .post('/api/dogs/not-a-uuid/sessions')
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId });

      expect(res.status).toBe(400);
    });

    it('returns 400 when status is invalid', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when score is provided for skipped session', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'skipped', score: 5 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when score is out of range', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 11 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when score is 0', async () => {
      const res = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/dogs/:dogId/sessions/:id', () => {
    it('returns a session by id', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 9 });

      const sessionId = createRes.body.id;
      const res = await request(app).get(`/api/dogs/${dogId}/sessions/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(sessionId);
      expect(res.body.dogId).toBe(dogId);
    });

    it('returns 404 for non-existent session', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/dogs/${dogId}/sessions/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 when session belongs to a different dog', async () => {
      // Create session for dogId
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      const sessionId = createRes.body.id;

      // Create another dog
      const testImageBuffer = Buffer.from('fake-image-data');
      const dog2Res = await request(app)
        .post('/api/dogs')
        .field('name', 'Rex')
        .attach('picture', testImageBuffer, 'rex.jpg');
      const dog2Id = dog2Res.body.id;

      // Try to get session via wrong dog
      const res = await request(app).get(`/api/dogs/${dog2Id}/sessions/${sessionId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/dogs/:dogId/sessions/:id', () => {
    it('updates session status, score and notes', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 5 });

      const sessionId = createRes.body.id;
      const res = await request(app)
        .put(`/api/dogs/${dogId}/sessions/${sessionId}`)
        .send({ status: 'completed', score: 9, notes: 'Improved!' });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(9);
      expect(res.body.notes).toBe('Improved!');
      expect(res.body.trainingId).toBe(trainingId); // unchanged fields preserved
    });

    it('returns 404 for non-existent session', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .put(`/api/dogs/${dogId}/sessions/${fakeId}`)
        .send({ status: 'skipped' });

      expect(res.status).toBe(404);
    });

    it('returns 404 when session belongs to a different dog', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      const sessionId = createRes.body.id;

      const testImageBuffer = Buffer.from('fake-image-data');
      const dog2Res = await request(app)
        .post('/api/dogs')
        .field('name', 'Rex')
        .attach('picture', testImageBuffer, 'rex.jpg');

      const res = await request(app)
        .put(`/api/dogs/${dog2Res.body.id}/sessions/${sessionId}`)
        .send({ status: 'skipped' });

      expect(res.status).toBe(404);
    });

    it('returns 400 when score provided for skipped status', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed', score: 5 });

      const sessionId = createRes.body.id;
      const res = await request(app)
        .put(`/api/dogs/${dogId}/sessions/${sessionId}`)
        .send({ status: 'skipped', score: 5 });

      expect(res.status).toBe(400);
    });

    it('returns 400 when score is out of range', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      const sessionId = createRes.body.id;
      const res = await request(app)
        .put(`/api/dogs/${dogId}/sessions/${sessionId}`)
        .send({ score: 11 });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/dogs/:dogId/sessions/:id', () => {
    it('deletes a session', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      const sessionId = createRes.body.id;
      const res = await request(app).delete(`/api/dogs/${dogId}/sessions/${sessionId}`);

      expect(res.status).toBe(204);

      // Verify deleted
      const getRes = await request(app).get(`/api/dogs/${dogId}/sessions/${sessionId}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent session', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).delete(`/api/dogs/${dogId}/sessions/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 when session belongs to a different dog', async () => {
      const createRes = await request(app)
        .post(`/api/dogs/${dogId}/sessions`)
        .send({ trainingId, date: '2026-02-14', status: 'completed' });

      const sessionId = createRes.body.id;

      const testImageBuffer = Buffer.from('fake-image-data');
      const dog2Res = await request(app)
        .post('/api/dogs')
        .field('name', 'Rex')
        .attach('picture', testImageBuffer, 'rex.jpg');

      const res = await request(app).delete(`/api/dogs/${dog2Res.body.id}/sessions/${sessionId}`);
      expect(res.status).toBe(404);
    });
  });
});
