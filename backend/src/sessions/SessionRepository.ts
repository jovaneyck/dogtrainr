import type { Session } from '../shared/types.js';

export interface SessionRepository {
  getById(id: string): Session | null;
  getByDogIdInRange(dogId: string, from: Date, to: Date): Session[];
  save(session: Session): void;
  delete(id: string): boolean;
}
