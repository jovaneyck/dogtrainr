# Take a screenshot of the frontend

Use this skill to visually inspect the frontend UI. Run the screenshot script and then read the resulting image.

## Usage

```bash
node C:/projects/dogtrainr2/.claude/skills/take-screenshot/screenshot.mjs <url> [output-filename]
```

- `url` — The page URL to screenshot (e.g. `http://localhost:5173/dogs/new`)
- `output-filename` — Optional filename (saved in `C:/projects/dogtrainr2/screenshots/`). Defaults to `screenshot.png`.

## Example

```bash
node C:/projects/dogtrainr2/.claude/skills/take-screenshot/screenshot.mjs http://localhost:5173
```

Then read the image:

```
Read screenshots/screenshot.png
```
