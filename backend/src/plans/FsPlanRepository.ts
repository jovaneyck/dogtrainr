import fs from 'fs';
import path from 'path';
import type { Plan } from '../shared/types.js';
import type { PlanRepository } from './PlanRepository.js';

export class FsPlanRepository implements PlanRepository {
  constructor(private dataDir: string) {}

  getAll(): Plan[] {
    if (!fs.existsSync(this.dataDir)) return [];
    return fs.readdirSync(this.dataDir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(this.dataDir, f), 'utf-8')));
  }

  getById(id: string): Plan | null {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  save(plan: Plan): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(this.dataDir, `${plan.id}.json`), JSON.stringify(plan, null, 2));
  }

  delete(id: string): boolean {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }
}
