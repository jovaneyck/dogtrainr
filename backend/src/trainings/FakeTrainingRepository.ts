import type { Training } from '../shared/types.js';
import type { TrainingRepository } from './TrainingRepository.js';

export class FakeTrainingRepository implements TrainingRepository {
  private data = new Map<string, Training>();

  getAll(): Training[] {
    return [...this.data.values()];
  }

  getById(id: string): Training | null {
    return this.data.get(id) ?? null;
  }

  save(training: Training): void {
    this.data.set(training.id, { ...training });
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }
}
