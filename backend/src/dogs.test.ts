import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from './index.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Express } from 'express';

describe('Dogs API', () => {
  let app: Express;
  let dataRoot: string;

  beforeEach(() => {
    dataRoot = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    fs.mkdirSync(path.join(dataRoot, 'dogs'), { recursive: true });
    app = createApp(dataRoot);
  });

  afterEach(() => {
    if (fs.existsSync(dataRoot)) {
      fs.rmSync(dataRoot, { recursive: true });
    }
  });

  describe('GET /api/dogs', () => {
    it('returns empty array when no dogs exist', async () => {
      const response = await request(app).get('/api/dogs');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/dogs', () => {
    it('creates a dog with name and image', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy')
        .attach('picture', testImageBuffer, 'buddy.jpg');

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Buddy');
      expect(response.body.picture).toContain('buddy');

      // Verify dog is persisted
      const listResponse = await request(app).get('/api/dogs');
      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].name).toBe('Buddy');
    });
  });

  describe('GET /api/dogs/:id', () => {
    it('returns a single dog by id', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      const createResponse = await request(app)
        .post('/api/dogs')
        .field('name', 'Max')
        .attach('picture', testImageBuffer, 'max.jpg');

      const dogId = createResponse.body.id;
      const response = await request(app).get(`/api/dogs/${dogId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(dogId);
      expect(response.body.name).toBe('Max');
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app).get('/api/dogs/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });

    it('rejects path traversal attempts with 400', async () => {
      const traversalPayloads = [
        '..%2F..%2Fetc%2Fpasswd',
        'not-a-uuid',
        '00000000-0000-0000-0000-00000000000g', // invalid hex char
      ];
      for (const payload of traversalPayloads) {
        const response = await request(app).get(`/api/dogs/${payload}`);
        expect(response.status).toBe(400);
      }
    });

    it('rejects path traversal on DELETE', async () => {
      const response = await request(app).delete('/api/dogs/..%2F..%2Fetc%2Fpasswd');
      expect(response.status).toBe(400);
    });

    it('rejects path traversal on PUT plan', async () => {
      const response = await request(app)
        .put('/api/dogs/..%2F..%2Fetc%2Fpasswd/plan')
        .send({ planId: 'plan-123' });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/dogs/:id', () => {
    it('deletes a dog', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      const createResponse = await request(app)
        .post('/api/dogs')
        .field('name', 'Rex')
        .attach('picture', testImageBuffer, 'rex.jpg');

      const dogId = createResponse.body.id;
      const deleteResponse = await request(app).delete(`/api/dogs/${dogId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify dog no longer exists
      const getResponse = await request(app).get(`/api/dogs/${dogId}`);
      expect(getResponse.status).toBe(404);
    });

    it('returns 404 when deleting non-existent dog', async () => {
      const response = await request(app).delete('/api/dogs/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/dogs/:id/plan', () => {
    it('assigns a training plan to a dog', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      const createDogResponse = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy')
        .attach('picture', testImageBuffer, 'buddy.jpg');

      const dogId = createDogResponse.body.id;

      const response = await request(app)
        .put(`/api/dogs/${dogId}/plan`)
        .send({ planId: 'plan-123' });

      expect(response.status).toBe(200);
      expect(response.body.planId).toBe('plan-123');

      // Verify dog has plan assigned
      const getResponse = await request(app).get(`/api/dogs/${dogId}`);
      expect(getResponse.body.planId).toBe('plan-123');
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app)
        .put('/api/dogs/00000000-0000-0000-0000-000000000000/plan')
        .send({ planId: 'plan-123' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/dogs/:id/plan', () => {
    it('unassigns a training plan from a dog', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');
      const createDogResponse = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy')
        .attach('picture', testImageBuffer, 'buddy.jpg');

      const dogId = createDogResponse.body.id;

      // First assign a plan
      await request(app)
        .put(`/api/dogs/${dogId}/plan`)
        .send({ planId: 'plan-123' });

      // Then unassign
      const response = await request(app).delete(`/api/dogs/${dogId}/plan`);

      expect(response.status).toBe(200);
      expect(response.body.planId).toBeUndefined();

      // Verify dog has no plan
      const getResponse = await request(app).get(`/api/dogs/${dogId}`);
      expect(getResponse.body.planId).toBeUndefined();
    });

    it('returns 404 for non-existent dog', async () => {
      const response = await request(app).delete('/api/dogs/00000000-0000-0000-0000-000000000000/plan');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /uploads/dogs/:filename', () => {
    it('returns the uploaded image data', async () => {
      const testImageBuffer = Buffer.from('fake-image-data');

      const createResponse = await request(app)
        .post('/api/dogs')
        .field('name', 'Buddy')
        .attach('picture', testImageBuffer, 'buddy.jpg');

      const filename = createResponse.body.picture;
      const imageResponse = await request(app)
        .get(`/uploads/dogs/${filename}`)
        .buffer(true)
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      expect(imageResponse.status).toBe(200);
      expect(imageResponse.body.toString()).toBe('fake-image-data');
    });
  });
});
