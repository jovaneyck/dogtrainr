# Task 04: Session card expand/collapse

Add tap-to-expand behavior on session cards in the agenda view.

## Collapsed (default)

- Training name + score + status icon
- No edit affordances

## Expanded (on tap)

- Training name + full status text (e.g. "✓ Completed")
- Score: X/10
- Note: text content
- [Edit] button → opens check-off bottom sheet in edit mode
- [Remove] button → deletes session (DELETEs via API, reverts to planned)
