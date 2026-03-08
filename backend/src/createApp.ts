import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';

import { FsDogRepository } from './dogs/FsDogRepository.js';
import { FsTrainingRepository } from './trainings/FsTrainingRepository.js';
import { FsPlanRepository } from './plans/FsPlanRepository.js';
import { FsSessionRepository } from './sessions/FsSessionRepository.js';
import { SessionListingService } from './sessions/SessionListingService.js';
import { healthRoutes } from './health/healthRoutes.js';
import { dogRoutes } from './dogs/dogRoutes.js';
import { trainingRoutes } from './trainings/trainingRoutes.js';
import { planRoutes } from './plans/planRoutes.js';
import { sessionRoutes } from './sessions/sessionRoutes.js';

export function createApp(dataRoot: string = path.join(process.cwd(), 'data')) {
  const app = express();

  const dogsDir = path.join(dataRoot, 'dogs');
  const trainingsDir = path.join(dataRoot, 'trainings');
  const plansDir = path.join(dataRoot, 'plans');
  const sessionsDir = path.join(dataRoot, 'sessions');
  const dogUploadsDir = path.join(dogsDir, 'uploads');
  const trainingUploadsDir = path.join(trainingsDir, 'uploads');

  // Repositories
  const dogRepo = new FsDogRepository(dogsDir, dogUploadsDir);
  const trainingRepo = new FsTrainingRepository(trainingsDir);
  const planRepo = new FsPlanRepository(plansDir);
  const sessionRepo = new FsSessionRepository(sessionsDir);

  // Services
  const sessionListingService = new SessionListingService(dogRepo, planRepo, sessionRepo);

  // Multer storage
  const dogStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      if (!fs.existsSync(dogUploadsDir)) {
        fs.mkdirSync(dogUploadsDir, { recursive: true });
      }
      cb(null, dogUploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${crypto.randomUUID()}${ext}`);
    }
  });
  const dogUpload = multer({ storage: dogStorage });

  const trainingStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      if (!fs.existsSync(trainingUploadsDir)) {
        fs.mkdirSync(trainingUploadsDir, { recursive: true });
      }
      cb(null, trainingUploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${crypto.randomUUID()}${ext}`);
    }
  });
  const trainingUpload = multer({ storage: trainingStorage });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/uploads/dogs', express.static(dogUploadsDir));
  app.use('/uploads/trainings', express.static(trainingUploadsDir));

  // Routes
  app.use('/api', healthRoutes());
  app.use('/api', dogRoutes(dogRepo, dogUpload));
  app.use('/api', trainingRoutes(trainingRepo, trainingUpload));
  app.use('/api', planRoutes(planRepo));
  app.use('/api', sessionRoutes(dogRepo, sessionRepo, sessionListingService));

  return app;
}
