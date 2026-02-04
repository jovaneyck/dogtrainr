import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(process.cwd(), 'data', 'dogs');

const storage = multer.diskStorage({
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
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads/dogs', express.static(DATA_DIR));

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
