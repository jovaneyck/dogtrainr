import type { StorageEngine } from 'multer';
import type { Request } from 'express';
import crypto from 'crypto';
import path from 'path';

export class NoopStorage implements StorageEngine {
  _handleFile(_req: Request, file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void): void {
    file.stream.resume();
    file.stream.on('end', () => {
      const ext = path.extname(file.originalname);
      cb(null, { filename: `${crypto.randomUUID()}${ext}` });
    });
  }

  _removeFile(_req: Request, _file: Express.Multer.File, cb: (error: Error | null) => void): void {
    cb(null);
  }
}
