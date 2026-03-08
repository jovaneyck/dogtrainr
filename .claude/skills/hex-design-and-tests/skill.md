---
name: hex-design-and-tests
description: Design guide for hexagonal architecture with vertical slices and layered tests
---

# Hexagonal Architecture — Design & Test Guide

This skill documents how to structure a new domain slice in this codebase, following the patterns established.

## Directory Structure

Organize by **vertical domain slices**, not layers. Each slice owns its interface, implementations, fakes, routes, and tests:

```
src/
  {slice}/
    {Slice}Repository.ts              # Port: repository interface. One repository = one aggregate root.
    Fs{Slice}Repository.ts            # Adapter: file-system implementation
    Fs{Slice}Repository.test.ts       # Narrow FS adapter test
    Fake{Slice}Repository.ts          # In-memory Map-based fake for tests
    {slice}Routes.ts                  # Adapter: thin HTTP adapter (Express Router)
    {slice}Routes.integration.test.ts # HTTP adapter test using fakes
```

## 1. Repository Interface (Port)

Define in terms of **atomic** API primitives. No `fileExists()` + `readFile()` combos — each method is a single operation.

Example: [DogRepository](../../../backend/src/dogs//DogRepository.ts)

## 2. Fake Repository (Test Double)

A `Map<string, T>`-based in-memory implementation. No mocking libraries:

Example: [FakeDogRepository](../../../backend/src/dogs/FakeDogRepository.ts)

## 3. FS Repository (Adapter)

Example: [FsDogRepository](../../../backend/src/dogs/FsDogRepository.ts)


## 4. Routes (HTTP Adapter)

Thin — parse request, call repo/service, format response. Each router owns its UUID validation via `router.param()`:

Example: [dogRoutes.ts](../../../backend/src/dogs/dogRoutes.ts)

**Key rule**: `router.param('id', validateUuid)` must be on each Router, not on the app. Express `app.param()` doesn't propagate to mounted sub-routers.

If a route accepts file uploads, take `upload: multer.Multer` as a dependency and use `upload.single('fieldname')` middleware. The route reads `req.file.filename` — nothing else.

## 5. Services (Domain Logic)

Only create a service when logic spans multiple aggregates and/or repositories and is non-trivial. Example: `SessionListingService` merges planned sessions (from plan schedule) with persisted sessions.

Services depend on **interfaces**, not implementations:

```ts
export class SessionListingService {
  constructor(
    private dogs: DogRepository,
    private plans: PlanRepository,
    private sessions: SessionRepository
  ) {}
}
```

## 6. Composition Root

`createApp.ts` is the only place that knows about concrete implementations:

- Creates FS repositories with data directories
- Creates services with repository interfaces
- Configures multer storage (diskStorage for production)
- Mounts routes under `/api`
- Sets up static file serving for uploads

## Test Layers

Four distinct layers — each tests one thing:

### Layer 1: Unit Tests (aggregates, services with fakes)
- [SessionListingService.test.ts](../../../backend/src/sessions/SessionListingService.test.ts) is the canonical example
- Uses `Fake*Repository` adapter instances for ports, no HTTP, no filesystem
- Tests domain logic: merging, filtering, edge cases

### Layer 2: HTTP Adapter Tests (`*.integration.test.ts`)
- Canonical example: [dogRoutes.integration.test.ts](../../../backend/src/dogs/dogRoutes.integration.test.ts)
- Creates Express app with `Fake*Repository` and route function
- Tests HTTP concerns: status codes, request parsing, validation, response format
- **No filesystem** — use `FakeStorage` (in-memory multer engine) for upload routes

### Layer 3: FS Adapter Tests (`Fs*Repository.test.ts`)
- Canonical example: [FsDogRepository.test.ts](../../../backend/src/dogs/FsDogRepository.test.ts)
- Tests real filesystem reads/writes in a temp directory
- `beforeEach` creates temp dir, `afterEach` cleans up
- Narrow: only tests the repository

### Layer 4: E2E Smoke Test (`e2e.test.ts`)
- Single file using `createApp()` with real FS repos
- Happy-path CRUD for each aggregate root
- Validates the full wiring works end-to-end

## FakeStorage Pattern

For routes that accept file uploads, `FakeStorage` replaces multer's `diskStorage` in HTTP adapter tests. [FakeStorage.ts](../../../backend/src/shared/FakeStorage.ts).

## Adding a New Slice — Checklist

1. Add the domain types to `shared/types.ts`
2. Create `{Slice}Repository.ts` interface
3. Create `Fake{Slice}Repository.ts` (Map-based)
4. Create `Fs{Slice}Repository.ts` + `Fs{Slice}Repository.test.ts`
5. Create `{slice}Routes.ts` with `router.param('id', validateUuid)`
6. Create `{slice}Routes.integration.test.ts` using fakes (and `FakeStorage` if uploads)
7. If non-trivial logic exists, create a service + unit test with fakes
8. Wire into `createApp.ts`: FS repo, service (if any), multer (if uploads), route mount
9. Add happy-path coverage to `e2e.test.ts`

## Cross-Slice Dependencies

Slices may depend on **interfaces** from other slices (e.g., `sessionRoutes` imports `DogRepository` from `../dogs/`). Never import concrete implementations across slices — that's the composition root's job.
