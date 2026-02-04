import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Hello from DogTrainr API!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
