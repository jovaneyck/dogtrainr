<p align="center">
  <img src="frontend/src/assets/logo.png" alt="DogTrainr" width="200" height="200" style="border-radius: 50%; object-fit: cover;" />
</p>

<h1 align="center">DogTrainr</h1>

<p align="center">
  <em>Organize training plans for your dogs, one session at a time.</em>
</p>

---

> **Note** — This is a **demo application** built for learning and presentation purposes. It is not intended for production use.

---

## What is DogTrainr?

DogTrainr helps dog owners and trainers manage their dogs, define training exercises, and compose those exercises into weekly training plans.

### Core concepts

| Concept      | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| **Dogs**     | Your dogs, each with a name, photo, and an optional assigned training plan. |
| **Trainings**| Individual exercises with a procedure and tips, written in Markdown.        |
| **Plans**    | Weekly schedules that map each weekday to a set of trainings.              |

## Tech stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 19, React Router 7, Vite            |
| Backend  | Express, file-based JSON persistence       |
| Tests    | Vitest, Testing Library, Supertest         |

## Getting started

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:3001

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api to backend)
```

## Running tests

```bash
cd backend  && npm test
cd frontend && npm test
```
