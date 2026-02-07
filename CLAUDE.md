# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

### Backend (`backend/`)
- `npm run dev` — Start dev server with tsx watch (port 3001)
- `npm test` — Run all tests (vitest)
- `npm run test:watch` — Run tests in watch mode
- `npx vitest run src/dogs.test.ts` — Run a single test file

### Frontend (`frontend/`)
- `npm run dev` — Start Vite dev server (proxies `/api` to backend:3001)
- `npm test` — Run all tests (vitest + jsdom)
- `npm run test:watch` — Run tests in watch mode
- `npx vitest run src/DogList.test.tsx` — Run a single test file
- `npm run lint` — ESLint
- `npm run build` — TypeScript check + Vite build

## Architecture

Monorepo with two independent npm projects (no root package.json scripts — run commands from `backend/` or `frontend/`).

### Backend
- Express API
- File-based persistence — JSON files in `data/{dogs,trainings,plans}/` (gitignored)
- File uploads via multer to the same data dirs
- App is exported for testing; server only starts when `NODE_ENV !== 'test'`
- Tests use supertest against the exported app, with `beforeEach`/`afterEach` that wipe the data directories

### Frontend
- React 19 + React Router 7 + Vite
- Each feature has paired `Component.tsx` / `Component.test.tsx` files
- Tests use Testing Library with `vi.spyOn(global, 'fetch')` for API mocking
- Markdown editing via `@uiw/react-md-editor`

### Domain Model
Three entities, all stored as JSON files with UUID ids:
- **Dogs** — name, picture (uploaded file), optional planId
- **Trainings** — name, procedure (markdown), tips (markdown), optional images
- **Plans** — name, weekly schedule (map of weekday → array of training IDs)

Dogs can be assigned a single training plan.

### API Routes
All routes prefixed with `/api/`:
- `GET/POST /dogs`, `GET/DELETE /dogs/:id`, `PUT/DELETE /dogs/:id/plan`
- `GET/POST /trainings`, `GET/PUT/DELETE /trainings/:id`, `POST /trainings/:id/images`
- `GET/POST /plans`, `GET/PUT/DELETE /plans/:id`

### Frontend Routes
- `/` — Dog list, `/dogs/new` — Add dog, `/dogs/:id` — Dog profile
- `/trainings` — Training list, `/trainings/new` — Add, `/trainings/:id` — Detail, `/trainings/:id/edit` — Edit
- `/plans` — Plan list, `/plans/new` — Add, `/plans/:id` — Detail, `/plans/:id/edit` — Edit
