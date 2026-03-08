import type { Training } from '../shared/types.js';

export interface TrainingRepository {
  getAll(): Training[];
  getById(id: string): Training | null;
  save(training: Training): void;
  delete(id: string): boolean;
}
