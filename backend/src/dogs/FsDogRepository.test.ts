import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FsDogRepository } from './FsDogRepository.js';
import type { Dog } from '../shared/types.js';

describe('FsDogRepository', () => {
  let dataDir: string;
  let uploadsDir: string;
  let repo: FsDogRepository;

  beforeEach(() => {
    const tmpRoot = path.join(process.cwd(), 'data', `test-${crypto.randomUUID()}`);
    dataDir = path.join(tmpRoot, 'dogs');
    uploadsDir = path.join(tmpRoot, 'uploads');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(uploadsDir, { recursive: true });
    repo = new FsDogRepository(dataDir, uploadsDir);
  });

  afterEach(() => {
    const tmpRoot = path.resolve(dataDir, '..');
    if (fs.existsSync(tmpRoot)) {
      fs.rmSync(tmpRoot, { recursive: true });
    }
  });

  it('returns empty array when no dogs exist', () => {
    expect(repo.getAll()).toEqual([]);
  });

  it('saves and retrieves a dog by id', () => {
    const dog: Dog = { id: crypto.randomUUID(), name: 'Buddy', picture: 'buddy.jpg' };
    repo.save(dog);
    expect(repo.getById(dog.id)).toEqual(dog);
  });

  it('saves and lists all dogs', () => {
    const dog1: Dog = { id: crypto.randomUUID(), name: 'Buddy', picture: 'buddy.jpg' };
    const dog2: Dog = { id: crypto.randomUUID(), name: 'Rex', picture: 'rex.jpg' };
    repo.save(dog1);
    repo.save(dog2);

    const all = repo.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(expect.arrayContaining([dog1, dog2]));
  });

  it('returns null for non-existent dog', () => {
    expect(repo.getById(crypto.randomUUID())).toBeNull();
  });

  it('deletes an existing dog and returns true', () => {
    const dog: Dog = { id: crypto.randomUUID(), name: 'Buddy', picture: 'buddy.jpg' };
    repo.save(dog);
    expect(repo.delete(dog.id)).toBe(true);
    expect(repo.getById(dog.id)).toBeNull();
  });

  it('returns false when deleting a non-existent dog', () => {
    expect(repo.delete(crypto.randomUUID())).toBe(false);
  });

  it('deletes an uploaded file', () => {
    const filename = 'buddy.jpg';
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, 'fake-image-data');

    repo.deleteUpload(filename);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('does not throw when deleting a non-existent upload', () => {
    expect(() => repo.deleteUpload('nope.jpg')).not.toThrow();
  });
});
