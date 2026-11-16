import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const ROUTES = ['friends', 'family'] as const;
const WIDTHS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

/**
 * Skip the entry gate: best-effort sessionStorage seed, then click Enter if it is still shown.
 * The seeded session can make the gate auto-dismiss within ~500ms of load (faster on lighter
 * pages than heavier ones), so the button may be visible only briefly. Use a short, bounded
 * click attempt rather than a long wait-then-click, and treat "it's already gone" as success
 * rather than racing a click against an element that will never reappear.
 */
async function passGate(page: Page) {
  const enter = page.getByRole('button', { name: /enter/i }).first();
  try {
    await enter.click({ timeout: 2000 });
  } catch {
    // Either never appeared (gate pre-skipped) or vanished mid-race (gate auto-dismissed) —
    // both mean no gate is left to pass.
    return;
  }
  await enter.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(300, Math.floor(page.viewportSize()!.height * 0.7));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

for (const route of ROUTES) {
  for (const vp of WIDTHS) {
    test(`/${route} @ ${vp.width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        // Missing photos/video/music are expected until real media is added; placeholders cover them.
        if (m.type() === 'error' && !/Failed to load resource.*404/.test(m.text()))
          errors.push(`console: ${m.text()}`);
      });
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        try {
          for (const k of [
            'entered',
            'entry',
            'gate',
            'entryGate',
            'ps-entered',
            'wedding-entered',
          ]) {
            sessionStorage.setItem(k, '1');
          }
        } catch {}
      });
      await page.goto(`/${route}`, { waitUntil: 'load' });
      await passGate(page);

      await expect(page.locator('h1').first()).toBeVisible();
      await scrollThrough(page);

      expect(await page.locator('form, input, textarea, select').count()).toBe(0);

      const body = page.locator('body');
      if (route === 'family') await expect(body).toContainText('Sr. Head Master');
      else await expect(body).not.toContainText('Sr. Head Master');

      mkdirSync('test-results/screenshots', { recursive: true });
      await page.screenshot({
        path: `test-results/screenshots/${route}-${vp.width}.png`,
        fullPage: true,
      });

      expect(errors).toEqual([]);
    });
  }
}
