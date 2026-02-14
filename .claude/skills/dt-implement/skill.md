---
name: dt-implement
description: implement a feature
hooks:
  Stop:
    - hooks:
        - type: command
          command: "cd C:\\projects\\dogtrainr2\\backend && npx vitest run 2>&1 || (echo 'Backend tests are failing. Fix them before finishing.' >&2 && exit 2)"
---

* You are given an implementation task
* Every acceptance criterium listed in the task must be covered by a unit test. Focus on covering every use case rather than "100% code coverage" based on internal branching logic.
