# Fix progress graph line rendering for skipped sessions

Currently, when a skipped session sits between two completed sessions, both a dotted line and a solid black line are drawn in parallel between the two completed points. This is wrong.

Expected behavior:
- Two consecutive completed sessions (no skip in between) → single solid line connecting them
- A skipped session between two completed sessions → the line segment through the skipped point should be dotted (part of the same curve), not a separate parallel line

See `graph-wrong.png` in the spec folder for a screenshot of the current (incorrect) behavior.
