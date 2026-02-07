# Dog Training Plans Show Training IDs Instead of Names

## Status: PENDING

## Problem
When rendering a dog's training plan, training IDs are displayed instead of training names. The fix should NOT duplicate the name in the JSON — instead, do a lookup by ID when rendering.

## Acceptance Criteria
- Training plan display shows training names, not IDs
- Names are resolved via ID lookup at render time, not stored redundantly in the plan JSON
- All tests pass
- Code compiles
