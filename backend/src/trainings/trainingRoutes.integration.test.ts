import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import multer from 'multer';
import { trainingRoutes } from './trainingRoutes.js';
import { FakeTrainingRepository } from './FakeTrainingRepository.js';
import { NoopStorage } from '../shared/noopStorage.js';

describe('Training routes (HTTP adapter)', () => {
  let app: Express;
  let repo: FakeTrainingRepository;

  beforeEach(() => {
    const upload = multer({ storage: new NoopStorage() });
    repo = new FakeTrainingRepository();
    app = express();
    app.use(express.json());
    app.use('/api', trainingRoutes(repo, upload));
  });

  describe('GET /api/trainings', () => {
    it('returns empty array when no trainings exist', async () => {
      const response = await request(app).get('/api/trainings');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns all trainings from the repo', async () => {
      repo.save({ id: crypto.randomUUID(), name: 'Sit', procedure: '', tips: '' });
      repo.save({ id: crypto.randomUUID(), name: 'Down', procedure: '', tips: '' });

      const response = await request(app).get('/api/trainings');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/trainings', () => {
    it('creates a training with name, procedure, and tips', async () => {
      const response = await request(app)
        .post('/api/trainings')
        .send({
          name: 'Sit',
          procedure: '# Steps\n1. Hold treat above nose\n2. Say "sit"',
          tips: '- Be patient\n- Use high-value treats'
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Sit');
      expect(response.body.procedure).toBe('# Steps\n1. Hold treat above nose\n2. Say "sit"');
      expect(response.body.tips).toBe('- Be patient\n- Use high-value treats');
    });

    it('persists the created training in the repo', async () => {
      const response = await request(app)
        .post('/api/trainings')
        .send({ name: 'Sit', procedure: '', tips: '' });

      expect(repo.getById(response.body.id)).not.toBeNull();
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/trainings')
        .send({ procedure: '# Steps', tips: '- Tips' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/trainings/:id', () => {
    it('returns a single training by id', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Down', procedure: '# Down', tips: '- Tip' });

      const response = await request(app).get(`/api/trainings/${id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe('Down');
    });

    it('returns 404 for non-existent training', async () => {
      const response = await request(app).get('/api/trainings/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/trainings/not-a-uuid');
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/trainings/:id', () => {
    it('updates a training', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Stay', procedure: '# Stay', tips: '- Tip' });

      const response = await request(app)
        .put(`/api/trainings/${id}`)
        .send({ name: 'Stay Updated', procedure: '# Stay Updated', tips: '- Updated tip' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Stay Updated');
      expect(response.body.procedure).toBe('# Stay Updated');
      expect(response.body.tips).toBe('- Updated tip');
    });

    it('returns 404 for non-existent training', async () => {
      const response = await request(app)
        .put('/api/trainings/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Test' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/trainings/:id', () => {
    it('deletes a training', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Come', procedure: '# Come', tips: '- Tip' });

      const response = await request(app).delete(`/api/trainings/${id}`);
      expect(response.status).toBe(204);
      expect(repo.getById(id)).toBeNull();
    });

    it('returns 404 when deleting non-existent training', async () => {
      const response = await request(app).delete('/api/trainings/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/trainings/:id/images', () => {
    it('uploads an image for a training', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Fetch', procedure: '# Fetch', tips: '- Tip' });

      const response = await request(app)
        .post(`/api/trainings/${id}/images`)
        .attach('image', Buffer.from('fake-image-data'), 'fetch-step1.jpg');

      expect(response.status).toBe(201);
      expect(response.body.filename).toBeDefined();
      expect(response.body.url).toContain('/uploads/trainings/');
    });

    it('returns 404 for non-existent training', async () => {
      const response = await request(app)
        .post('/api/trainings/00000000-0000-0000-0000-000000000000/images')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(404);
    });

    it('returns 400 when no image provided', async () => {
      const id = crypto.randomUUID();
      repo.save({ id, name: 'Roll', procedure: '# Roll', tips: '- Tip' });

      const response = await request(app)
        .post(`/api/trainings/${id}/images`);

      expect(response.status).toBe(400);
    });
  });
});
