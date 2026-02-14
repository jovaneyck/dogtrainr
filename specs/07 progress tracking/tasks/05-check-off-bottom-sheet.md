# Task 05: Check-off bottom sheet

Build the bottom sheet for checking off or editing a session. Opens without navigating away from the progress screen.

## Content

- Header: training name + date
- Status radio: Completed / Skipped
- Score selector: buttons 1–10, only visible when status is "Completed"
- Notes: text area
- [Save] button — single primary action

## Behavior

- Save = upsert session via `POST /api/dogs/:dogId/sessions` (new) or `PUT /api/dogs/:dogId/sessions/:id` (edit)
- On save, close sheet and refresh the agenda for the current day
- Score input is optional, not forced
- Opens from "Check off" button on planned sessions or "Edit" button on expanded completed/skipped sessions
