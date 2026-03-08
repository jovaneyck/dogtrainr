import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { type Express } from 'express';
import multer from 'multer';
import request from 'supertest';
import { dogRoutes } from './dogRoutes.js';
import { FakeDogRepository } from './FakeDogRepository.js';
import { NoopStorage } from '../shared/noopStorage.js';

describe('Dog routes (HTTP adapter)', () => {
  let app: Express;
  let repo: FakeDogRepository;

  beforeEach(() => {
    const upload = multer({ storage: new NoopStorage() });
    repo = new FakeDogRepository();
    app = express();
    app.use(express.json());
    app.use('/api', dogRoutes(repo, upload));
  });

  describe('GET /api/dogs', () => {
    it('returns empty array when no dogs exist', async () => {
      const response = await request(app).get('/api/dogs');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns all dogs from repo', async () => {
      repo.save({ id: '00000000-0000-0000-0000-000000000001', name: 'Buddy', picture: 'buddy.jpg' });
      repo.save({ id: '00000000-0000-0000-0000-000000000002', name: 'Max', picture: 'max.jpg' });

      const response = await request(app).get('/api/dogs');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/dogs', () => {
    it('creates a dog with name and picture', async () => {
      const response = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy')
        .attach('picture', Buffer.from('fake-image'), 'buddy.jpg');

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Buddy');
      expect(response.body.picture).toMatch(/\.jpg$/);
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/dogs')
        .attach('picture', Buffer.from('fake-image'), 'buddy.jpg');

      expect(response.status).toBe(400);
    });

    it('returns 400 when picture is missing', async () => {
      const response = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/dogs/:id', () => {
    it('returns a dog by id', async () => {
      const id = '00000000-0000-0000-0000-000000000001';
      repo.save({ id, name: 'Buddy', picture: 'buddy.jpg' });

      const response = await request(app).get(`/api/dogs/${id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id, name: 'Buddy', picture: 'buddy.jpg' });
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app).get('/api/dogs/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/dogs/not-a-uuid');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/dogs/:id', () => {
    it('deletes a dog and returns 204', async () => {
      const id = '00000000-0000-0000-0000-000000000001';
      repo.save({ id, name: 'Rex', picture: 'rex.jpg' });

      const response = await request(app).delete(`/api/dogs/${id}`);
      expect(response.status).toBe(204);
      expect(repo.getById(id)).toBeNull();
    });

    it('calls deleteUpload with the picture filename', async () => {
      const id = '00000000-0000-0000-0000-000000000001';
      repo.save({ id, name: 'Rex', picture: 'rex.jpg' });
      const spy = vi.spyOn(repo, 'deleteUpload');

      await request(app).delete(`/api/dogs/${id}`);
      expect(spy).toHaveBeenCalledWith('rex.jpg');
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app).delete('/api/dogs/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).delete('/api/dogs/not-a-uuid');
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/dogs/:id/plan', () => {
    it('assigns a plan to a dog', async () => {
      const id = '00000000-0000-0000-0000-000000000001';
      repo.save({ id, name: 'Buddy', picture: 'buddy.jpg' });

      const response = await request(app)
        .put(`/api/dogs/${id}/plan`)
        .send({ planId: 'plan-123' });

      expect(response.status).toBe(200);
      expect(response.body.planId).toBe('plan-123');
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app)
        .put('/api/dogs/00000000-0000-0000-0000-000000000000/plan')
        .send({ planId: 'plan-123' });
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app)
        .put('/api/dogs/not-a-uuid/plan')
        .send({ planId: 'plan-123' });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/dogs/:id/plan', () => {
    it('removes plan from a dog', async () => {
      const id = '00000000-0000-0000-0000-000000000001';
      repo.save({ id, name: 'Buddy', picture: 'buddy.jpg', planId: 'plan-123' });

      const response = await request(app).delete(`/api/dogs/${id}/plan`);

      expect(response.status).toBe(200);
      expect(response.body.planId).toBeUndefined();
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app).delete('/api/dogs/00000000-0000-0000-0000-000000000000/plan');
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).delete('/api/dogs/not-a-uuid/plan');
      expect(response.status).toBe(400);
    });
  });
});
