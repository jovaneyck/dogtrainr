import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FsSessionRepository } from './FsSessionRepository.js';
import type { Session } from '../shared/types.js';

describe('FsSessionRepository', () => {
  let repo: FsSessionRepository;
  let dataDir: string;

  beforeEach(() => {
    dataDir = path.join(process.cwd(), 'data', `test-sessions-${crypto.randomUUID()}`);
    fs.mkdirSync(dataDir, { recursive: true });
    repo = new FsSessionRepository(dataDir);
  });

  afterEach(() => {
    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true });
    }
  });

  function makeSession(overrides: Partial<Session> = {}): Session {
    return {
      id: crypto.randomUUID(),
      dogId: crypto.randomUUID(),
      trainingId: crypto.randomUUID(),
      date: '2026-02-10',
      status: 'completed',
      ...overrides,
    };
  }

  it('returns null for non-existent session', () => {
    expect(repo.getById(crypto.randomUUID())).toBeNull();
  });

  it('saves and retrieves a session by id', () => {
    const session = makeSession();
    repo.save(session);

    const retrieved = repo.getById(session.id);
    expect(retrieved).toEqual(session);
  });

  describe('getByDogIdInRange', () => {
    it('filters by dogId and date range', () => {
      const dogId = crypto.randomUUID();
      const otherDogId = crypto.randomUUID();

      const inRange = makeSession({ dogId, date: '2026-02-10' });
      const beforeRange = makeSession({ dogId, date: '2026-02-08' });
      const afterRange = makeSession({ dogId, date: '2026-02-16' });
      const otherDog = makeSession({ dogId: otherDogId, date: '2026-02-10' });

      repo.save(inRange);
      repo.save(beforeRange);
      repo.save(afterRange);
      repo.save(otherDog);

      const from = new Date('2026-02-09T00:00:00');
      const to = new Date('2026-02-15T00:00:00');
      const results = repo.getByDogIdInRange(dogId, from, to);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(inRange);
    });

    it('includes sessions on boundary dates', () => {
      const dogId = crypto.randomUUID();
      const onFrom = makeSession({ dogId, date: '2026-02-09' });
      const onTo = makeSession({ dogId, date: '2026-02-15' });

      repo.save(onFrom);
      repo.save(onTo);

      const from = new Date('2026-02-09T00:00:00');
      const to = new Date('2026-02-15T00:00:00');
      const results = repo.getByDogIdInRange(dogId, from, to);

      expect(results).toHaveLength(2);
    });

    it('returns empty array when data directory does not exist', () => {
      const emptyRepo = new FsSessionRepository(path.join(dataDir, 'nonexistent'));
      const results = emptyRepo.getByDogIdInRange(crypto.randomUUID(), new Date(), new Date());
      expect(results).toEqual([]);
    });
  });

  describe('delete', () => {
    it('returns true when deleting an existing session', () => {
      const session = makeSession();
      repo.save(session);

      expect(repo.delete(session.id)).toBe(true);
      expect(repo.getById(session.id)).toBeNull();
    });

    it('returns false when deleting a non-existent session', () => {
      expect(repo.delete(crypto.randomUUID())).toBe(false);
    });
  });
});
