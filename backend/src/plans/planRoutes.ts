import { Router } from 'express';
import crypto from 'crypto';
import type { PlanRepository } from './PlanRepository.js';
import { validateUuid } from '../shared/validateUuid.js';

export function planRoutes(repo: PlanRepository): Router {
  const router = Router();
  router.param('id', validateUuid);

  router.get('/plans', (_req, res) => {
    res.json(repo.getAll());
  });

  router.post('/plans', (req, res) => {
    const { name, schedule } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = crypto.randomUUID();
    const plan = {
      id,
      name,
      schedule: schedule || {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
      }
    };
    repo.save(plan);
    res.status(201).json(plan);
  });

  router.get('/plans/:id', (req, res) => {
    const plan = repo.getById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  });

  router.put('/plans/:id', (req, res) => {
    const existing = repo.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Plan not found' });

    const { name, schedule } = req.body;
    const updated = {
      ...existing,
      name: name ?? existing.name,
      schedule: schedule ?? existing.schedule
    };
    repo.save(updated);
    res.json(updated);
  });

  router.delete('/plans/:id', (req, res) => {
    if (!repo.delete(req.params.id)) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(204).send();
  });

  return router;
}
