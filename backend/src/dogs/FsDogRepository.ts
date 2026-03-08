import fs from 'fs';
import path from 'path';
import type { Dog } from '../shared/types.js';
import type { DogRepository } from './DogRepository.js';

export class FsDogRepository implements DogRepository {
  constructor(private dataDir: string, private uploadsDir: string) {}

  getAll(): Dog[] {
    if (!fs.existsSync(this.dataDir)) return [];
    return fs.readdirSync(this.dataDir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(this.dataDir, f), 'utf-8')));
  }

  getById(id: string): Dog | null {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  save(dog: Dog): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(this.dataDir, `${dog.id}.json`), JSON.stringify(dog, null, 2));
  }

  delete(id: string): boolean {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }

  deleteUpload(filename: string): void {
    const filePath = path.join(this.uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
