import { describe, it, expect } from 'vitest';
import { app } from './index.js';
import request from 'supertest';

describe('Health endpoint', () => {
  it('returns ok status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
