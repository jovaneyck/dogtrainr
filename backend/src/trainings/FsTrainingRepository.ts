import fs from 'fs';
import path from 'path';
import type { Training } from '../shared/types.js';
import type { TrainingRepository } from './TrainingRepository.js';

export class FsTrainingRepository implements TrainingRepository {
  constructor(private dataDir: string) {}

  getAll(): Training[] {
    if (!fs.existsSync(this.dataDir)) return [];
    return fs.readdirSync(this.dataDir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(this.dataDir, f), 'utf-8')));
  }

  getById(id: string): Training | null {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  save(training: Training): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(this.dataDir, `${training.id}.json`), JSON.stringify(training, null, 2));
  }

  delete(id: string): boolean {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }
}
