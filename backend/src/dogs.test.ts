import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from './index.js';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'dogs');

describe('Dogs API', () => {
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
      const response = await request(app).get('/api/dogs/non-existent-id');
      expect(response.status).toBe(404);
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
      const response = await request(app).delete('/api/dogs/non-existent-id');
      expect(response.status).toBe(404);
    });
  });
});
