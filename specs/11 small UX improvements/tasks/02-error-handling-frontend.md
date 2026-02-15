# Proper error response handling in frontend

When the backend is down, the frontend currently shows "no dogs registered yet" (as if it got a 404). This is misleading — a backend-down scenario yields a 500 or network error, not a 404.

Add proper response code handling in the frontend:
- 404 → show "not found" messaging as appropriate
- Any other error (500, network error, etc.) → show an error message indicating something is wrong with the app (e.g. a toast or inline error text), not the "no data yet" empty state
