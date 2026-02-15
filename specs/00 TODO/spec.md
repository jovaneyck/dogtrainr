# Hexagonal architecture
 * Pull out persistence (with atomic API instead of fileExists() and later Get())
 * Pull out services (session calculation)
 * Rework tests to benefit from architecture (unit test core + integration tests on adapters)

# UX

* Progress graph should show notes etc. from a session when hovering over a node