import { chromium } from 'playwright';
import path from 'node:path';

const url = process.argv[2] || 'http://localhost:5173';
const filename = process.argv[3] || 'screenshot.png';
const output = path.join('C:/projects/dogtrainr2/screenshots', filename);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: output, fullPage: true });
await browser.close();
console.log(`Saved ${output}`);
