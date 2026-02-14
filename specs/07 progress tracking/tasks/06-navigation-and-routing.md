# Task 06: Navigation and routing

Wire the progress screen into the app's navigation hierarchy.

## Route

- Add route: `/dogs/:id/progress` — Progress screen for a dog

## Navigation

- From dog profile page, add a way to navigate to the progress screen (e.g. "Progress" link/button, visible when the dog has an assigned plan)
- Hierarchy: Dog → Plan → Progress

## Data fetching

- Progress screen needs the dog's assigned plan to compute planned sessions
- Fetch the week's sessions on mount and when navigating between weeks/days
