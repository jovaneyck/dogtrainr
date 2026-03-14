import { describe, it, expect, beforeEach } from 'vitest';
import { SessionListingService } from './SessionListingService.js';
import { FakeDogRepository } from '../dogs/FakeDogRepository.js';
import { FakePlanRepository } from '../plans/FakePlanRepository.js';
import { FakeSessionRepository } from './FakeSessionRepository.js';

describe('SessionListingService', () => {
  let dogs: FakeDogRepository;
  let plans: FakePlanRepository;
  let sessions: FakeSessionRepository;
  let service: SessionListingService;

  const dogId = 'dog-00000000-0000-0000-0000-000000000001';
  const trainingId1 = 'trn-00000000-0000-0000-0000-000000000001';
  const trainingId2 = 'trn-00000000-0000-0000-0000-000000000002';
  const planId = 'pln-00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    dogs = new FakeDogRepository();
    plans = new FakePlanRepository();
    sessions = new FakeSessionRepository();
    service = new SessionListingService(dogs, plans, sessions);
  });

  it('returns error when dog not found', () => {
    const result = service.list('nonexistent', new Date('2026-02-09T00:00:00'), new Date('2026-02-15T00:00:00'));
    expect(result).toEqual({ error: 'Dog not found' });
  });

  it('returns empty list when no plan and no sessions', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg' });

    const result = service.list(dogId, new Date('2026-02-09T00:00:00'), new Date('2026-02-15T00:00:00'));
    expect(result).toEqual({ sessions: [] });
  });

  it('generates computed planned sessions from plan schedule', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg', planId });
    plans.save({
      id: planId, name: 'Puppy Basics',
      schedule: {
        monday: [trainingId1], tuesday: [], wednesday: [],
        thursday: [], friday: [], saturday: [], sunday: []
      }
    });

    // 2026-02-09 is Monday, 2026-02-15 is Sunday
    const result = service.list(dogId, new Date('2026-02-09T00:00:00'), new Date('2026-02-15T00:00:00'));
    expect('sessions' in result).toBe(true);
    if (!('sessions' in result)) return;

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toEqual({
      dogId,
      trainingId: trainingId1,
      planId,
      date: '2026-02-09',
      status: 'planned'
    });
  });

  it('persisted completed session overrides computed planned', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg', planId });
    plans.save({
      id: planId, name: 'Puppy Basics',
      schedule: {
        monday: [trainingId1], tuesday: [trainingId1], wednesday: [],
        thursday: [], friday: [], saturday: [], sunday: []
      }
    });

    sessions.save({
      id: 'ses-001', dogId, trainingId: trainingId1, date: '2026-02-09',
      status: 'completed', planId, score: 9
    });

    const result = service.list(dogId, new Date('2026-02-09T00:00:00'), new Date('2026-02-10T00:00:00'));
    expect('sessions' in result).toBe(true);
    if (!('sessions' in result)) return;

    expect(result.sessions).toHaveLength(2);

    const monday = result.sessions.find(s => s.date === '2026-02-09');
    expect(monday!.id).toBe('ses-001');
    expect(monday!.status).toBe('completed');
    expect(monday!.score).toBe(9);

    const tuesday = result.sessions.find(s => s.date === '2026-02-10');
    expect(tuesday!.id).toBeUndefined();
    expect(tuesday!.status).toBe('planned');
  });

  it('includes ad-hoc sessions not covered by plan', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg', planId });
    plans.save({
      id: planId, name: 'Puppy Basics',
      schedule: {
        monday: [trainingId1], tuesday: [], wednesday: [],
        thursday: [], friday: [], saturday: [], sunday: []
      }
    });

    // Ad-hoc session on Tuesday with a different training
    sessions.save({
      id: 'ses-adhoc', dogId, trainingId: trainingId2, date: '2026-02-10',
      status: 'completed'
    });

    const result = service.list(dogId, new Date('2026-02-09T00:00:00'), new Date('2026-02-15T00:00:00'));
    expect('sessions' in result).toBe(true);
    if (!('sessions' in result)) return;

    expect(result.sessions).toHaveLength(2);
    const adhoc = result.sessions.find(s => s.trainingId === trainingId2);
    expect(adhoc).toBeDefined();
    expect(adhoc!.id).toBe('ses-adhoc');
  });

  it('generates planned sessions for every day in a full-week schedule with no persisted sessions', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg', planId });
    plans.save({
      id: planId, name: 'Full Week',
      schedule: {
        monday: [trainingId1, trainingId2],
        tuesday: [trainingId1],
        wednesday: [trainingId1, trainingId2],
        thursday: [trainingId1],
        friday: [trainingId1, trainingId2],
        saturday: [trainingId1],
        sunday: [trainingId1, trainingId2]
      }
    });

    // 2026-03-16 is Monday, 2026-03-22 is Sunday
    const result = service.list(dogId, new Date('2026-03-16T00:00:00'), new Date('2026-03-22T00:00:00'));
    expect('sessions' in result).toBe(true);
    if (!('sessions' in result)) return;

    // 7 days: Mon(2) + Tue(1) + Wed(2) + Thu(1) + Fri(2) + Sat(1) + Sun(2) = 11
    expect(result.sessions).toHaveLength(11);
    expect(result.sessions.every(s => s.status === 'planned')).toBe(true);
    expect(result.sessions[0].date).toBe('2026-03-16');
    expect(result.sessions[result.sessions.length - 1].date).toBe('2026-03-22');
  });

  it('sorts results by date', () => {
    dogs.save({ id: dogId, name: 'Buddy', picture: 'buddy.jpg' });

    sessions.save({ id: 'ses-b', dogId, trainingId: trainingId1, date: '2026-02-12', status: 'completed' });
    sessions.save({ id: 'ses-a', dogId, trainingId: trainingId2, date: '2026-02-10', status: 'completed' });

    const result = service.list(dogId, new Date('2026-02-09T00:00:00'), new Date('2026-02-15T00:00:00'));
    expect('sessions' in result).toBe(true);
    if (!('sessions' in result)) return;

    expect(result.sessions[0].date).toBe('2026-02-10');
    expect(result.sessions[1].date).toBe('2026-02-12');
  });
});
