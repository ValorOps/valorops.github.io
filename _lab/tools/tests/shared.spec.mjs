// Checks every lab page must pass. Add each new experiment's path to LAB_PAGES.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const LAB_PAGES = ['/lab/', '/lab/01-materials/'];
const ORIGIN = 'http://127.0.0.1:4500';

async function load(page, path) {
  const errors = [];
  const requests = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push('FAILED ' + r.url()));
  page.on('request', (r) => requests.push(r.url()));
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  const res = await page.goto(path, { waitUntil: 'networkidle' });
  expect(res.status(), `${path} status`).toBe(200);
  return { errors, requests };
}

for (const path of LAB_PAGES) {
  test.describe(`shared ${path} `, () => {
    test('has noindex', async ({ page }) => {
      await load(page, path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    });

    test('no CSP violations', async ({ page }) => {
      await load(page, path);
      expect(await page.evaluate(() => window.__csp)).toEqual([]);
    });

    test('no console errors and no failed requests', async ({ page }) => {
      const { errors } = await load(page, path);
      expect(errors).toEqual([]);
    });

    test('same-origin only', async ({ page }) => {
      const { requests } = await load(page, path);
      expect(requests.filter((u) => !u.startsWith(ORIGIN) && !u.startsWith('data:'))).toEqual([]);
    });

    test('no em dash', async ({ page }) => {
      await load(page, path);
      expect(await page.evaluate(() => document.body.innerText.includes('—'))).toBe(false);
    });

    for (const vp of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
      test(`no horizontal overflow at ${vp.width}`, async ({ page }) => {
        await page.setViewportSize(vp);
        await load(page, path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });
    }

    test('axe: no serious or critical violations', async ({ page }) => {
      await load(page, path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  });
}
