# 04 — D3.js progress graph

When a training is selected, render a D3.js line graph plotting session progress data:

- X-axis: session date/time
- Y-axis: score
- Completed sessions: black dots with smooth connecting lines
- Skipped sessions: connect the 2 surrounding sessions with a dashed line, no dot for the skipped session
