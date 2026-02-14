import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

export function createApp(dataRoot: string = path.join(process.cwd(), 'data')) {
  const app = express();
  const DATA_DIR = path.join(dataRoot, 'dogs');
  const TRAININGS_DIR = path.join(dataRoot, 'trainings');
  const PLANS_DIR = path.join(dataRoot, 'plans');
  const SESSIONS_DIR = path.join(dataRoot, 'sessions');
  const DOG_UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
  const TRAINING_UPLOADS_DIR = path.join(TRAININGS_DIR, 'uploads');

  const dogStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      if (!fs.existsSync(DOG_UPLOADS_DIR)) {
        fs.mkdirSync(DOG_UPLOADS_DIR, { recursive: true });
      }
      cb(null, DOG_UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${crypto.randomUUID()}${ext}`);
    }
  });
  const upload = multer({ storage: dogStorage });

  const trainingStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      if (!fs.existsSync(TRAINING_UPLOADS_DIR)) {
        fs.mkdirSync(TRAINING_UPLOADS_DIR, { recursive: true });
      }
      cb(null, TRAINING_UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${crypto.randomUUID()}${ext}`);
    }
  });
  const trainingUpload = multer({ storage: trainingStorage });

  app.use(cors());
  app.use(express.json());
  app.use('/uploads/dogs', express.static(DOG_UPLOADS_DIR));
  app.use('/uploads/trainings', express.static(TRAINING_UPLOADS_DIR));

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.param('id', (req, res, next, id) => {
    if (!UUID_RE.test(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  });

  app.param('dogId', (req, res, next, dogId) => {
    if (!UUID_RE.test(dogId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Hello from DogTrainr API!' });
  });

  app.get('/api/dogs', (_req, res) => {
    if (!fs.existsSync(DATA_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const dogs = files.map(f => {
      const data = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
      return JSON.parse(data);
    });
    res.json(dogs);
  });

  app.post('/api/dogs', upload.single('picture'), (req, res) => {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ error: 'Name and picture are required' });
    }

    const id = crypto.randomUUID();
    const dog = {
      id,
      name,
      picture: file.filename
    };

    fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(dog, null, 2));
    res.status(201).json(dog);
  });

  app.get('/api/dogs/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.delete('/api/dogs/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Read dog data to get picture filename
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const picturePath = path.join(DOG_UPLOADS_DIR, data.picture);

    // Delete JSON file
    fs.unlinkSync(filePath);

    // Delete picture file if it exists
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    res.status(204).send();
  });

  app.put('/api/dogs/:id/plan', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const { planId } = req.body;
    const dog = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    dog.planId = planId;

    fs.writeFileSync(filePath, JSON.stringify(dog, null, 2));
    res.json(dog);
  });

  app.delete('/api/dogs/:id/plan', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const dog = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    delete dog.planId;

    fs.writeFileSync(filePath, JSON.stringify(dog, null, 2));
    res.json(dog);
  });

  // Trainings API
  app.get('/api/trainings', (_req, res) => {
    if (!fs.existsSync(TRAININGS_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(TRAININGS_DIR).filter(f => f.endsWith('.json'));
    const trainings = files.map(f => {
      const data = fs.readFileSync(path.join(TRAININGS_DIR, f), 'utf-8');
      return JSON.parse(data);
    });
    res.json(trainings);
  });

  app.post('/api/trainings', (req, res) => {
    const { name, procedure, tips } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!fs.existsSync(TRAININGS_DIR)) {
      fs.mkdirSync(TRAININGS_DIR, { recursive: true });
    }

    const id = crypto.randomUUID();
    const training = { id, name, procedure: procedure || '', tips: tips || '' };

    fs.writeFileSync(path.join(TRAININGS_DIR, `${id}.json`), JSON.stringify(training, null, 2));
    res.status(201).json(training);
  });

  app.get('/api/trainings/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(TRAININGS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.put('/api/trainings/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(TRAININGS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { name, procedure, tips } = req.body;
    const updated = {
      ...existing,
      name: name ?? existing.name,
      procedure: procedure ?? existing.procedure,
      tips: tips ?? existing.tips
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  });

  app.delete('/api/trainings/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(TRAININGS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Training not found' });
    }

    fs.unlinkSync(filePath);
    res.status(204).send();
  });

  app.post('/api/trainings/:id/images', trainingUpload.single('image'), (req, res) => {
    const { id } = req.params;
    const filePath = path.join(TRAININGS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    res.status(201).json({
      filename: file.filename,
      url: `/uploads/trainings/${file.filename}`
    });
  });

  // Plans API
  app.get('/api/plans', (_req, res) => {
    if (!fs.existsSync(PLANS_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(PLANS_DIR).filter(f => f.endsWith('.json'));
    const plans = files.map(f => {
      const data = fs.readFileSync(path.join(PLANS_DIR, f), 'utf-8');
      return JSON.parse(data);
    });
    res.json(plans);
  });

  app.post('/api/plans', (req, res) => {
    const { name, schedule } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!fs.existsSync(PLANS_DIR)) {
      fs.mkdirSync(PLANS_DIR, { recursive: true });
    }

    const id = crypto.randomUUID();
    const plan = {
      id,
      name,
      schedule: schedule || {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
      }
    };

    fs.writeFileSync(path.join(PLANS_DIR, `${id}.json`), JSON.stringify(plan, null, 2));
    res.status(201).json(plan);
  });

  app.get('/api/plans/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(PLANS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.put('/api/plans/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(PLANS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { name, schedule } = req.body;
    const updated = {
      ...existing,
      name: name ?? existing.name,
      schedule: schedule ?? existing.schedule
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  });

  app.delete('/api/plans/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(PLANS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    fs.unlinkSync(filePath);
    res.status(204).send();
  });

  // Sessions API
  app.post('/api/dogs/:dogId/sessions', (req, res) => {
    const { dogId } = req.params;
    const dogPath = path.join(DATA_DIR, `${dogId}.json`);

    if (!fs.existsSync(dogPath)) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const { trainingId, planId, date, status, score, notes } = req.body;

    if (!trainingId || !date || !status) {
      return res.status(400).json({ error: 'trainingId, date, and status are required' });
    }

    if (status !== 'completed' && status !== 'skipped') {
      return res.status(400).json({ error: 'Status must be "completed" or "skipped"' });
    }

    if (score !== undefined && status === 'skipped') {
      return res.status(400).json({ error: 'Score is only allowed when status is completed' });
    }

    if (score !== undefined && (score < 1 || score > 10)) {
      return res.status(400).json({ error: 'Score must be between 1 and 10' });
    }

    if (!fs.existsSync(SESSIONS_DIR)) {
      fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }

    const id = crypto.randomUUID();
    const session: Record<string, unknown> = { id, dogId, trainingId, date, status };
    if (planId !== undefined) session.planId = planId;
    if (score !== undefined) session.score = score;
    if (notes !== undefined) session.notes = notes;

    fs.writeFileSync(path.join(SESSIONS_DIR, `${id}.json`), JSON.stringify(session, null, 2));
    res.status(201).json(session);
  });

  app.get('/api/dogs/:dogId/sessions/:id', (req, res) => {
    const { dogId, id } = req.params;
    const filePath = path.join(SESSIONS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (session.dogId !== dogId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  });

  app.put('/api/dogs/:dogId/sessions/:id', (req, res) => {
    const { dogId, id } = req.params;
    const filePath = path.join(SESSIONS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (existing.dogId !== dogId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { status, score, notes } = req.body;
    const updatedStatus = status ?? existing.status;

    if (score !== undefined && updatedStatus === 'skipped') {
      return res.status(400).json({ error: 'Score is only allowed when status is completed' });
    }

    if (score !== undefined && (score < 1 || score > 10)) {
      return res.status(400).json({ error: 'Score must be between 1 and 10' });
    }

    const updated = {
      ...existing,
      status: updatedStatus,
      score: score ?? existing.score,
      notes: notes ?? existing.notes
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  });

  app.delete('/api/dogs/:dogId/sessions/:id', (req, res) => {
    const { dogId, id } = req.params;
    const filePath = path.join(SESSIONS_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (session.dogId !== dogId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    fs.unlinkSync(filePath);
    res.status(204).send();
  });

  return app;
}

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
