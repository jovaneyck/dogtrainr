import { Router } from 'express';
import crypto from 'crypto';
import type { DogRepository } from './DogRepository.js';
import type multer from 'multer';
import { validateUuid } from '../shared/validateUuid.js';

export function dogRoutes(repo: DogRepository, upload: multer.Multer): Router {
  const router = Router();
  router.param('id', validateUuid);

  router.get('/dogs', (_req, res) => {
    res.json(repo.getAll());
  });

  router.post('/dogs', upload.single('picture'), (req, res) => {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ error: 'Name and picture are required' });
    }

    const id = crypto.randomUUID();
    const dog = { id, name, picture: file.filename };
    repo.save(dog);
    res.status(201).json(dog);
  });

  router.get('/dogs/:id', (req, res) => {
    const dog = repo.getById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    res.json(dog);
  });

  router.delete('/dogs/:id', (req, res) => {
    const dog = repo.getById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    repo.delete(req.params.id);
    repo.deleteUpload(dog.picture);
    res.status(204).send();
  });

  router.put('/dogs/:id/plan', (req, res) => {
    const dog = repo.getById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    dog.planId = req.body.planId;
    repo.save(dog);
    res.json(dog);
  });

  router.delete('/dogs/:id/plan', (req, res) => {
    const dog = repo.getById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    delete dog.planId;
    repo.save(dog);
    res.json(dog);
  });

  return router;
}
