import fs from 'fs';
import path from 'path';
import type { Session } from '../shared/types.js';
import type { SessionRepository } from './SessionRepository.js';

export class FsSessionRepository implements SessionRepository {
  constructor(private dataDir: string) {}

  getById(id: string): Session | null {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  getByDogIdInRange(dogId: string, from: Date, to: Date): Session[] {
    if (!fs.existsSync(this.dataDir)) return [];
    const results: Session[] = [];
    const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const session: Session = JSON.parse(fs.readFileSync(path.join(this.dataDir, f), 'utf-8'));
      if (session.dogId !== dogId) continue;
      const sessionDate = new Date(`${session.date}T00:00:00`);
      if (sessionDate >= from && sessionDate <= to) {
        results.push(session);
      }
    }
    return results;
  }

  save(session: Session): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(this.dataDir, `${session.id}.json`), JSON.stringify(session, null, 2));
  }

  delete(id: string): boolean {
    const filePath = path.join(this.dataDir, `${id}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }
}
