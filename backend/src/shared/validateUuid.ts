import type { Request, Response, NextFunction } from 'express';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuid(_req: Request, res: Response, next: NextFunction, value: string) {
  if (!UUID_RE.test(value)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
}
