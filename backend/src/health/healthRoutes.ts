import { Router } from 'express';

export function healthRoutes(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Hello from DogTrainr API!' });
  });

  return router;
}
