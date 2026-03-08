import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FsPlanRepository } from './FsPlanRepository.js';
import type { Plan } from '../shared/types.js';

describe('FsPlanRepository', () => {
  let repo: FsPlanRepository;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    repo = new FsPlanRepository(tempDir);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it('returns empty array when no plans exist', () => {
    expect(repo.getAll()).toEqual([]);
  });

  it('saves and retrieves a plan by id', () => {
    const plan: Plan = {
      id: crypto.randomUUID(),
      name: 'Puppy basics',
      schedule: { monday: ['t1'], tuesday: [] },
    };

    repo.save(plan);

    expect(repo.getById(plan.id)).toEqual(plan);
  });

  it('saves and lists all plans', () => {
    const plan1: Plan = { id: crypto.randomUUID(), name: 'Plan A', schedule: {} };
    const plan2: Plan = { id: crypto.randomUUID(), name: 'Plan B', schedule: {} };

    repo.save(plan1);
    repo.save(plan2);

    const all = repo.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(expect.arrayContaining([plan1, plan2]));
  });

  it('deletes an existing plan and returns true', () => {
    const plan: Plan = { id: crypto.randomUUID(), name: 'To delete', schedule: {} };
    repo.save(plan);

    expect(repo.delete(plan.id)).toBe(true);
    expect(repo.getById(plan.id)).toBeNull();
  });

  it('returns false when deleting a non-existent plan', () => {
    expect(repo.delete(crypto.randomUUID())).toBe(false);
  });
});
