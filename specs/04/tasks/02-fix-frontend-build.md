# Fix all frontend build errors

Spawn a sub agent working in its own git worktree.

- Fix all build errors and warnings in the `frontend/` project
- All tests must pass (`npm test`)
- The build command must succeed without errors or warnings (`npm run build`)
- Once done, merge the changes from the worktree back to the main branch and commit
