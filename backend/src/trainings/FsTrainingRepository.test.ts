import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FsTrainingRepository } from './FsTrainingRepository.js';
import type { Training } from '../shared/types.js';

describe('FsTrainingRepository', () => {
  let repo: FsTrainingRepository;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    repo = new FsTrainingRepository(tmpDir);
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it('returns empty array when no trainings exist', () => {
    expect(repo.getAll()).toEqual([]);
  });

  it('saves and retrieves a training by id', () => {
    const training: Training = { id: crypto.randomUUID(), name: 'Sit', procedure: '# Sit', tips: '- tip' };
    repo.save(training);

    expect(repo.getById(training.id)).toEqual(training);
  });

  it('saves and lists all trainings', () => {
    const t1: Training = { id: crypto.randomUUID(), name: 'Sit', procedure: '# Sit', tips: '- tip' };
    const t2: Training = { id: crypto.randomUUID(), name: 'Stay', procedure: '# Stay', tips: '- tip' };
    repo.save(t1);
    repo.save(t2);

    const all = repo.getAll();
    expect(all).toHaveLength(2);
    expect(all.map(t => t.name).sort()).toEqual(['Sit', 'Stay']);
  });

  it('deletes an existing training and returns true', () => {
    const training: Training = { id: crypto.randomUUID(), name: 'Down', procedure: '# Down', tips: '- tip' };
    repo.save(training);

    expect(repo.delete(training.id)).toBe(true);
    expect(repo.getById(training.id)).toBeNull();
  });

  it('returns false when deleting a non-existent training', () => {
    expect(repo.delete(crypto.randomUUID())).toBe(false);
  });
});
