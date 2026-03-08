# Hexagonal architecture

## Goal

Cleaner more modular code. Think in slices not layers. Hexagonal design.

## Steps

 * Pull out persistence concerns into repositories (with atomic API like `getDog() : Dog?` instead of a very implementation specific fileExists() and later Get()). My aggregate roots should map 1:1 to the repositories: Dogs, Plans, Sessions, Trainings are all separate aggregate roots.

 * Pull out services for all non-trivial logic (aggregate root creation, session calculation). REST adapter layer can directly access repositories and spawn construct their own aggregates, for everything else that needs more than 3 lines of code, push the behavior to the aggregate itself or extract into a separate service.

 * Spawn subagents afterward that works on their own worktrees. 
 You come up with the tests they should migrate. Reason about what work makes sense to work on in parallel and what work should be done sequentially for this.

 Rework all existing backend tests to benefit from this architecture (broad unit test for core services and aggregate roots if not covered by a core service test + narrow integration tests on REST + data adapters). For the core, try to keep units as large as possible, only cutting out the adapters. For adapters, do not use mocking libraries but instead build your own lookup table based fake repositories.
