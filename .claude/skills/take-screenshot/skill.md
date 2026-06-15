---
name: take-screenshot
description: Use this whenever you want to take a screenshot of the frontend UI, e.g. asked by the user or for visual debugging of the app.
---

## Usage

```bash
node ./screenshot.mjs <url> [output-filename]
```

- `url` — The page URL to screenshot (e.g. `http://localhost:5173/dogs/new`)
- `output-filename` — Optional filename (saved in `./screenshots/`). Defaults to `screenshot.png`.

## Example

```bash
node ./screenshot.mjs http://localhost:5173
```

Then read the image:

```
Read ./screenshots/screenshot.png
```
