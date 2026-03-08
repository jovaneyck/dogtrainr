import type { DogRepository } from '../dogs/DogRepository.js';
import type { PlanRepository } from '../plans/PlanRepository.js';
import type { SessionRepository } from './SessionRepository.js';

type SessionRecord = Record<string, unknown>;
type ListResult = { sessions: SessionRecord[] } | { error: string };

export class SessionListingService {
  constructor(
    private dogs: DogRepository,
    private plans: PlanRepository,
    private sessions: SessionRepository,
  ) {}

  list(dogId: string, from: Date, to: Date): ListResult {
    const dog = this.dogs.getById(dogId);
    if (!dog) return { error: 'Dog not found' };

    const persistedSessions = this.sessions.getByDogIdInRange(dogId, from, to);

    const persistedKey = (date: string, tId: string) => `${date}:${tId}`;
    const persistedMap = new Map<string, SessionRecord>();
    for (const s of persistedSessions) {
      persistedMap.set(persistedKey(s.date, s.trainingId), s as unknown as SessionRecord);
    }

    const results: SessionRecord[] = [];
    const usedPersistedKeys = new Set<string>();

    if (dog.planId) {
      const plan = this.plans.getById(dog.planId);
      if (plan) {
        const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const current = new Date(from);
        while (current <= to) {
          const dayName = weekdays[current.getDay()];
          const yyyy = current.getFullYear();
          const mm = String(current.getMonth() + 1).padStart(2, '0');
          const dd = String(current.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;
          const scheduledTrainings: string[] = plan.schedule[dayName] || [];

          for (const tid of scheduledTrainings) {
            const key = persistedKey(dateStr, tid);
            if (persistedMap.has(key)) {
              results.push(persistedMap.get(key)!);
              usedPersistedKeys.add(key);
            } else {
              results.push({
                dogId,
                trainingId: tid,
                planId: dog.planId,
                date: dateStr,
                status: 'planned'
              });
            }
          }

          current.setDate(current.getDate() + 1);
        }
      }
    }

    for (const s of persistedSessions) {
      const key = persistedKey(s.date, s.trainingId);
      if (!usedPersistedKeys.has(key)) {
        results.push(s as unknown as SessionRecord);
      }
    }

    results.sort((a, b) => (a.date as string).localeCompare(b.date as string));

    return { sessions: results };
  }
}
