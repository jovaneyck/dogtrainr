import type { Plan } from '../shared/types.js';
import type { PlanRepository } from './PlanRepository.js';

export class FakePlanRepository implements PlanRepository {
  private data = new Map<string, Plan>();

  getAll(): Plan[] {
    return [...this.data.values()];
  }

  getById(id: string): Plan | null {
    return this.data.get(id) ?? null;
  }

  save(plan: Plan): void {
    this.data.set(plan.id, { ...plan });
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }
}
