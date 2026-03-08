import type { Dog } from '../shared/types.js';
import type { DogRepository } from './DogRepository.js';

export class FakeDogRepository implements DogRepository {
  private data = new Map<string, Dog>();

  getAll(): Dog[] {
    return [...this.data.values()];
  }

  getById(id: string): Dog | null {
    return this.data.get(id) ?? null;
  }

  save(dog: Dog): void {
    this.data.set(dog.id, { ...dog });
  }

  delete(id: string): boolean {
    return this.data.delete(id);
  }

  deleteUpload(_filename: string): void {}
}
