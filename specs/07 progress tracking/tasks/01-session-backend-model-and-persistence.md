# Task 01: Session backend model and persistence

Create the Session entity with file-based persistence in `data/sessions/`.

## Session model

- `id` — UUID
- `dogId` — foreign key to Dog
- `trainingId` — foreign key to Training
- `planId` — optional foreign key to Plan
- `date` — ISO date string (YYYY-MM-DD)
- `status` — `"completed"` | `"skipped"`
- `score` — optional number 1–10 (only when status is completed)
- `notes` — optional string

## Persistence

- Store as JSON files in `data/sessions/` (same pattern as dogs/trainings/plans)
- CRUD operations: create, read by id, list (with filtering by dogId and date range), update, delete
