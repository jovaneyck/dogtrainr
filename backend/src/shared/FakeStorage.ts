import type { StorageEngine } from 'multer';
import type { Request } from 'express';
import crypto from 'crypto';
import path from 'path';

export class FakeStorage implements StorageEngine {
  private files = new Map<string, Buffer>();

  _handleFile(_req: Request, file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void): void {
    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    file.stream.on('end', () => {
      const ext = path.extname(file.originalname);
      const filename = `${crypto.randomUUID()}${ext}`;
      this.files.set(filename, Buffer.concat(chunks));
      cb(null, { filename });
    });
  }

  _removeFile(_req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void {
    this.files.delete(file.filename);
    cb(null);
  }

  has(filename: string): boolean {
    return this.files.has(filename);
  }

  get(filename: string): Buffer | undefined {
    return this.files.get(filename);
  }
}
