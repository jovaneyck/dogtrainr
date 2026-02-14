# Task 03: Week strip and agenda view

Build the progress screen UI accessible from a dog's profile: Dog → Plan → Progress.

## Week strip (top)

- Month/year header with left/right arrows to navigate weeks
- Row of 7 days (Mon–Sun) showing day-of-month numbers
- Today is auto-selected on open
- Tap a date → agenda below swaps instantly
- Dot/marker under a date if at least one completed/skipped session exists for that day
- Star/badge under a date for missed or low-score sessions (future analytics hook)

## Agenda (below strip)

- Header: full date (e.g. "Sat 14 February 2026")
- List of session cards for the selected day
- Fetches data from `GET /api/dogs/:dogId/sessions?from=...&to=...` for the visible week

## Session cards (collapsed default)

- Show: training name, score (if completed), status icon (✓ for completed)
- Planned sessions show a "Check off" button
- Completed/skipped sessions show status inline
