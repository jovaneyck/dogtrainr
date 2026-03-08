import type { Dog } from '../shared/types.js';

export interface DogRepository {
  getAll(): Dog[];
  getById(id: string): Dog | null;
  save(dog: Dog): void;
  delete(id: string): boolean;
  deleteUpload(filename: string): void;
}
