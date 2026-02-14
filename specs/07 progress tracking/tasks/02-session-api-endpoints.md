# Task 02: Session API endpoints

Create the REST endpoints for sessions under `/api/`.

## Endpoints

- `GET /api/dogs/:dogId/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD` — Returns sessions for a dog within a date range. Merges persisted sessions (completed/skipped) with computed planned sessions from the dog's training plan for that date range. Planned sessions are calculated on the fly from the plan's weekly schedule.
- `POST /api/dogs/:dogId/sessions` — Create/upsert a session (check off or edit). Body: `{ trainingId, planId?, date, status, score?, notes? }`
- `PUT /api/dogs/:dogId/sessions/:id` — Update an existing session (edit score, notes, status)
- `DELETE /api/dogs/:dogId/sessions/:id` — Delete a session (revert to planned)

## Computed (planned) sessions logic

When returning sessions for a date range:
1. Look up the dog's assigned plan
2. For each day in the range, check the plan's weekly schedule for that weekday
3. For each scheduled training on that day, check if a persisted session exists
4. If persisted → return it with its status/score/notes
5. If not persisted → return a computed session with `status: "planned"` and no id
