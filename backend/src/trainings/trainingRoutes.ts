import { Router } from 'express';
import crypto from 'crypto';
import type { TrainingRepository } from './TrainingRepository.js';
import type multer from 'multer';
import { validateUuid } from '../shared/validateUuid.js';

export function trainingRoutes(repo: TrainingRepository, upload: multer.Multer): Router {
  const router = Router();
  router.param('id', validateUuid);

  router.get('/trainings', (_req, res) => {
    res.json(repo.getAll());
  });

  router.post('/trainings', (req, res) => {
    const { name, procedure, tips } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = crypto.randomUUID();
    const training = { id, name, procedure: procedure || '', tips: tips || '' };
    repo.save(training);
    res.status(201).json(training);
  });

  router.get('/trainings/:id', (req, res) => {
    const training = repo.getById(req.params.id);
    if (!training) return res.status(404).json({ error: 'Training not found' });
    res.json(training);
  });

  router.put('/trainings/:id', (req, res) => {
    const existing = repo.getById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Training not found' });

    const { name, procedure, tips } = req.body;
    const updated = {
      ...existing,
      name: name ?? existing.name,
      procedure: procedure ?? existing.procedure,
      tips: tips ?? existing.tips
    };
    repo.save(updated);
    res.json(updated);
  });

  router.delete('/trainings/:id', (req, res) => {
    if (!repo.delete(req.params.id)) {
      return res.status(404).json({ error: 'Training not found' });
    }
    res.status(204).send();
  });

  router.post('/trainings/:id/images', upload.single('image'), (req, res) => {
    const training = repo.getById(req.params.id);
    if (!training) return res.status(404).json({ error: 'Training not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Image is required' });

    res.status(201).json({
      filename: file.filename,
      url: `/uploads/trainings/${file.filename}`
    });
  });

  return router;
}
