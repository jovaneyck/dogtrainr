import type { Plan } from '../shared/types.js';

export interface PlanRepository {
  getAll(): Plan[];
  getById(id: string): Plan | null;
  save(plan: Plan): void;
  delete(id: string): boolean;
}
