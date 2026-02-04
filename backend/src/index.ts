import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(process.cwd(), 'data', 'dogs');
const TRAININGS_DIR = path.join(process.cwd(), 'data', 'trainings');
const PLANS_DIR = path.join(process.cwd(), 'data', 'plans');

const dogStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    cb(null, DATA_DIR);
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
    if (!fs.existsSync(TRAININGS_DIR)) {
      fs.mkdirSync(TRAININGS_DIR, { recursive: true });
    }
    cb(null, TRAININGS_DIR);
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
app.use('/uploads/dogs', express.static(DATA_DIR));
app.use('/uploads/trainings', express.static(TRAININGS_DIR));

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
  const picturePath = path.join(DATA_DIR, data.picture);

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
