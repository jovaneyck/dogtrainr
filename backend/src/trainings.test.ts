import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from './index.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express } from 'express';

describe('Trainings API', () => {
  let app: Express;
  let dataRoot: string;

  beforeEach(() => {
    dataRoot = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    fs.mkdirSync(path.join(dataRoot, 'trainings'), { recursive: true });
    app = createApp(dataRoot);
  });

  afterEach(() => {
    if (fs.existsSync(dataRoot)) {
      fs.rmSync(dataRoot, { recursive: true });
    }
  });

  describe('GET /api/trainings', () => {
    it('returns empty array when no trainings exist', async () => {
      const response = await request(app).get('/api/trainings');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
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

      // Verify training is persisted
      const listResponse = await request(app).get('/api/trainings');
      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].name).toBe('Sit');
    });

    it('returns 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/trainings')
        .send({
          procedure: '# Steps',
          tips: '- Tips'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/trainings/:id', () => {
    it('returns a single training by id', async () => {
      const createResponse = await request(app)
        .post('/api/trainings')
        .send({ name: 'Down', procedure: '# Down', tips: '- Tip' });

      const trainingId = createResponse.body.id;
      const response = await request(app).get(`/api/trainings/${trainingId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(trainingId);
      expect(response.body.name).toBe('Down');
    });

    it('returns 404 for non-existent training', async () => {
      const response = await request(app).get('/api/trainings/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/trainings/:id', () => {
    it('updates a training', async () => {
      const createResponse = await request(app)
        .post('/api/trainings')
        .send({ name: 'Stay', procedure: '# Stay', tips: '- Tip' });

      const trainingId = createResponse.body.id;
      const response = await request(app)
        .put(`/api/trainings/${trainingId}`)
        .send({ name: 'Stay Updated', procedure: '# Stay Updated', tips: '- Updated tip' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Stay Updated');
      expect(response.body.procedure).toBe('# Stay Updated');
      expect(response.body.tips).toBe('- Updated tip');
    });

    it('returns 404 for non-existent training', async () => {
      const response = await request(app)
        .put('/api/trainings/non-existent-id')
        .send({ name: 'Test' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/trainings/:id', () => {
    it('deletes a training', async () => {
      const createResponse = await request(app)
        .post('/api/trainings')
        .send({ name: 'Come', procedure: '# Come', tips: '- Tip' });

      const trainingId = createResponse.body.id;
      const deleteResponse = await request(app).delete(`/api/trainings/${trainingId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify training no longer exists
      const getResponse = await request(app).get(`/api/trainings/${trainingId}`);
      expect(getResponse.status).toBe(404);
    });

    it('returns 404 when deleting non-existent training', async () => {
      const response = await request(app).delete('/api/trainings/non-existent-id');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/trainings/:id/images', () => {
    it('uploads an image for a training', async () => {
      const createResponse = await request(app)
        .post('/api/trainings')
        .send({ name: 'Fetch', procedure: '# Fetch', tips: '- Tip' });

      const trainingId = createResponse.body.id;
      const testImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post(`/api/trainings/${trainingId}/images`)
        .attach('image', testImageBuffer, 'fetch-step1.jpg');

      expect(response.status).toBe(201);
      expect(response.body.filename).toContain('fetch-step1');
      expect(response.body.url).toContain('/uploads/trainings/');
    });

    it('returns 404 for non-existent training', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      const response = await request(app)
        .post('/api/trainings/non-existent-id/images')
        .attach('image', testImageBuffer, 'test.jpg');

      expect(response.status).toBe(404);
    });

    it('returns 400 when no image provided', async () => {
      const createResponse = await request(app)
        .post('/api/trainings')
        .send({ name: 'Roll', procedure: '# Roll', tips: '- Tip' });

      const trainingId = createResponse.body.id;
      const response = await request(app)
        .post(`/api/trainings/${trainingId}/images`);

      expect(response.status).toBe(400);
    });
  });
});
