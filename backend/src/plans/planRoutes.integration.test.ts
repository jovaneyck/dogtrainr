import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import crypto from 'crypto';
import request from 'supertest';
import { planRoutes } from './planRoutes.js';
import { FakePlanRepository } from './FakePlanRepository.js';
import type { Express } from 'express';

const fullSchedule = (overrides: Record<string, string[]> = {}) => ({
  monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
  ...overrides,
});

describe('Plans API', () => {
  let app: Express;
  let repo: FakePlanRepository;

  beforeEach(() => {
    repo = new FakePlanRepository();
    app = express();
    app.use(express.json());
    app.use('/api', planRoutes(repo));
  });

  describe('GET /api/plans', () => {
    it('returns empty array when no plans exist', async () => {
      const response = await request(app).get('/api/plans');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns all plans from repo', async () => {
      repo.save({ id: crypto.randomUUID(), name: 'Plan A', schedule: fullSchedule() });
      repo.save({ id: crypto.randomUUID(), name: 'Plan B', schedule: fullSchedule() });

      const response = await request(app).get('/api/plans');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/plans', () => {
    it('creates a plan with name and schedule', async () => {
      const schedule = fullSchedule({ monday: ['training-1', 'training-2'], wednesday: ['training-3'] });

      const response = await request(app)
        .post('/api/plans')
        .send({ name: 'Puppy basics', schedule });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Puppy basics');
      expect(response.body.schedule.monday).toEqual(['training-1', 'training-2']);
      expect(response.body.schedule.wednesday).toEqual(['training-3']);
    });

    it('defaults schedule when none provided', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({ name: 'Minimal plan' });

      expect(response.status).toBe(201);
      expect(response.body.schedule).toEqual(fullSchedule());
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/plans')
        .send({ schedule: { monday: [] } });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/plans/:id', () => {
    it('returns a single plan by id', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Weekly plan', schedule: fullSchedule({ monday: ['t1'] }) });

      const response = await request(app).get(`/api/plans/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe('Weekly plan');
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app).get('/api/plans/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const invalidIds = ['not-a-uuid', '..%2F..%2Fetc%2Fpasswd', '00000000-0000-0000-0000-00000000000g'];
      for (const id of invalidIds) {
        const response = await request(app).get(`/api/plans/${id}`);
        expect(response.status).toBe(400);
      }
    });
  });

  describe('PUT /api/plans/:id', () => {
    it('updates name and schedule', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Old name', schedule: fullSchedule() });

      const response = await request(app)
        .put(`/api/plans/${id}`)
        .send({ name: 'New name', schedule: fullSchedule({ monday: ['t1'], tuesday: ['t2'] }) });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New name');
      expect(response.body.schedule.monday).toEqual(['t1']);
      expect(response.body.schedule.tuesday).toEqual(['t2']);
    });

    it('returns 404 for non-existent plan', async () => {
      const response = await request(app)
        .put('/api/plans/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Test' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/plans/:id', () => {
    it('deletes a plan', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'To delete', schedule: fullSchedule() });

      const response = await request(app).delete(`/api/plans/${id}`);
      expect(response.status).toBe(204);
    });

    it('returns 404 when deleting non-existent plan', async () => {
      const response = await request(app).delete('/api/plans/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });
  });
});
