/**
 * Renders invitation-card/card.html to a print-ready PNG.
 *   node scripts/render-invitation-card.mjs [scale]
 * Default scale 2 -> 2400x3600 (8" x 12" at 300dpi).
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'invitation-card', 'card.html');
const out = path.join(root, 'invitation-card', 'invitation-card.png');
const scale = Number(process.argv[2] ?? 2);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 1800 },
  deviceScaleFactor: scale,
});
await page.goto('file://' + src, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.locator('.card').screenshot({ path: out });
await browser.close();
console.log(`${out}  @${scale}x  ->  ${1200 * scale}x${1800 * scale}`);
