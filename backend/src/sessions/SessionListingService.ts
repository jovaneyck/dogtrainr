import type { DogRepository } from '../dogs/DogRepository.js';
import type { PlanRepository } from '../plans/PlanRepository.js';
import type { Plan } from '../shared/types.js';
import type { SessionRepository } from './SessionRepository.js';

type SessionRecord = Record<string, unknown>;
type ListResult = { sessions: SessionRecord[] } | { error: string };

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const formatDate = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const dateRange = (from: Date, to: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(from);
  while (current <= to) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const sessionKey = (date: string, trainingId: string) => `${date}:${trainingId}`;

const scheduledTrainingIds = (plan: Plan, date: string): string[] => {
  const dayName = weekdays[new Date(date + 'T00:00:00').getDay()];
  return plan.schedule[dayName] || [];
};

export class SessionListingService {
  constructor(
    private readonly dogs: DogRepository,
    private readonly plans: PlanRepository,
    private readonly sessions: SessionRepository,
  ) { }

  list(dogId: string, from: Date, to: Date): ListResult {
    const dog = this.dogs.getById(dogId);
    if (!dog) return { error: 'Dog not found' };

    const persistedSessions = this.sessions.getByDogIdInRange(dogId, from, to);
    const persistedMap = new Map(
      persistedSessions.map(s => [sessionKey(s.date, s.trainingId), s as unknown as SessionRecord])
    );

    const plan = dog.planId ? this.plans.getById(dog.planId) : null;

    const scheduledSessions = plan
      ? dateRange(from, to).flatMap(date =>
        scheduledTrainingIds(plan, date).map(tid =>
          persistedMap.get(sessionKey(date, tid)) ?? { dogId, trainingId: tid, planId: dog.planId, date, status: 'planned' }
        )
      )
      : [];

    const scheduledKeys = new Set(scheduledSessions.map(s => sessionKey(s.date as string, s.trainingId as string)));

    const adHocSessions = persistedSessions
      .filter(s => !scheduledKeys.has(sessionKey(s.date, s.trainingId)))
      .map(s => s as unknown as SessionRecord);

    return {
      sessions: [...scheduledSessions, ...adHocSessions]
        .sort((a, b) => (a.date as string).localeCompare(b.date as string))
    };
  }
}
