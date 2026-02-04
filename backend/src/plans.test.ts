import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from './index.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'plans');

describe('Plans API', () => {
  beforeEach(() => {
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(DATA_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true });
    }
  });

  describe('GET /api/plans', () => {
    it('returns empty array when no plans exist', async () => {
      const response = await request(app).get('/api/plans');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/plans', () => {
    it('creates a plan with name and schedule', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({
          name: 'Puppy basics',
          schedule: {
            monday: ['training-1', 'training-2'],
            tuesday: [],
            wednesday: ['training-3'],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Puppy basics');
      expect(response.body.schedule.monday).toEqual(['training-1', 'training-2']);
      expect(response.body.schedule.wednesday).toEqual(['training-3']);

      // Verify plan is persisted
      const listResponse = await request(app).get('/api/plans');
      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].name).toBe('Puppy basics');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({
          schedule: { monday: [], tuesday: [] }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/plans/:id', () => {
    it('returns a single plan by id', async () => {
      const createResponse = await request(app)
        .post('/api/plans')
        .send({
          name: 'Weekly plan',
          schedule: { monday: ['t1'], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        });

      const planId = createResponse.body.id;
      const response = await request(app).get(`/api/plans/${planId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(planId);
      expect(response.body.name).toBe('Weekly plan');
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app).get('/api/plans/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/plans/:id', () => {
    it('updates a plan', async () => {
      const createResponse = await request(app)
        .post('/api/plans')
        .send({
          name: 'Old name',
          schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        });

      const planId = createResponse.body.id;
      const response = await request(app)
        .put(`/api/plans/${planId}`)
        .send({
          name: 'New name',
          schedule: { monday: ['t1'], tuesday: ['t2'], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New name');
      expect(response.body.schedule.monday).toEqual(['t1']);
      expect(response.body.schedule.tuesday).toEqual(['t2']);
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app)
        .put('/api/plans/non-existent-id')
        .send({ name: 'Test' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/plans/:id', () => {
    it('deletes a plan', async () => {
      const createResponse = await request(app)
        .post('/api/plans')
        .send({
          name: 'To delete',
          schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        });

      const planId = createResponse.body.id;
      const deleteResponse = await request(app).delete(`/api/plans/${planId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify plan no longer exists
      const getResponse = await request(app).get(`/api/plans/${planId}`);
      expect(getResponse.status).toBe(404);
    });

    it('returns 404 when deleting non-existent plan', async () => {
      const response = await request(app).delete('/api/plans/non-existent-id');
      expect(response.status).toBe(404);
    });
  });
});
